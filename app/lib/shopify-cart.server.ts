/**
 * Storefront Cart — queries/mutations validated against Storefront GraphQL (MCP).
 */
import { storefrontGraphQL } from "./shopify-storefront.server";
import { getStorefrontProductByHandle } from "./shopify-storefront.server";
import { getDefaultVariantGidFromStorefrontNode } from "./shopify-product-mapper.server";
import { shopifyCartIdCookie } from "./cart-cookie.server";

const CART_QUERY = `#graphql
  query CartQuery($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount { amount currencyCode }
              amountPerQuantity { amount currencyCode }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                image {
                  url(transform: { maxWidth: 512 })
                  altText
                }
                product {
                  handle
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type CartLineUI = {
  id: string;
  quantity: number;
  merchandiseId: string;
  productTitle: string;
  variantTitle: string;
  handle: string;
  imageUrl: string | null;
  imageAlt: string | null;
  lineTotalAmount: string;
  lineTotalCurrency: string;
  unitAmount: string;
  unitCurrency: string;
};

export type CartUI = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLineUI[];
  subtotalAmount: string;
  subtotalCurrency: string;
  totalAmount: string;
  totalCurrency: string;
};

type CartQueryData = {
  cart: {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
      totalAmount: { amount: string; currencyCode: string };
      subtotalAmount: { amount: string; currencyCode: string };
    };
    lines: {
      edges: Array<{
        node: {
          id: string;
          quantity: number;
          cost: {
            totalAmount: { amount: string; currencyCode: string };
            amountPerQuantity: { amount: string; currencyCode: string };
          };
          merchandise: {
            id: string;
            title: string;
            image: { url: string; altText: string | null } | null;
            product: { handle: string; title: string };
          } | null;
        };
      }>;
    };
  } | null;
};

function mapCartNode(cart: NonNullable<CartQueryData["cart"]>): CartUI {
  const lines: CartLineUI[] = [];
  for (const { node } of cart.lines.edges) {
    const m = node.merchandise;
    if (!m || !("product" in m)) continue;
    lines.push({
      id: node.id,
      quantity: node.quantity,
      merchandiseId: m.id,
      productTitle: m.product.title,
      variantTitle: m.title,
      handle: m.product.handle,
      imageUrl: m.image?.url ?? null,
      imageAlt: m.image?.altText ?? null,
      lineTotalAmount: node.cost.totalAmount.amount,
      lineTotalCurrency: node.cost.totalAmount.currencyCode,
      unitAmount: node.cost.amountPerQuantity.amount,
      unitCurrency: node.cost.amountPerQuantity.currencyCode,
    });
  }

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines,
    subtotalAmount: cart.cost.subtotalAmount.amount,
    subtotalCurrency: cart.cost.subtotalAmount.currencyCode,
    totalAmount: cart.cost.totalAmount.amount,
    totalCurrency: cart.cost.totalAmount.currencyCode,
  };
}

export async function fetchCartById(
  cartId: string,
): Promise<{ cart: CartUI | null; errors: string[] }> {
  const { data, errors } = await storefrontGraphQL<CartQueryData>(CART_QUERY, {
    id: cartId,
  });
  if (errors.length) {
    return { cart: null, errors };
  }
  const raw = data?.cart;
  if (!raw) {
    return { cart: null, errors: [] };
  }
  return { cart: mapCartNode(raw), errors: [] };
}

function formatUserErrors(
  userErrors: Array<{ field?: string[] | null; message: string }>,
): string[] {
  return userErrors.map((e) => e.message);
}

type CartCreateData = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
};

export async function createCartWithLines(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<{
  cartId: string | null;
  checkoutUrl: string | null;
  errors: string[];
}> {
  const { data, errors } = await storefrontGraphQL<CartCreateData>(
    CART_CREATE,
    { input: { lines } },
  );
  if (errors.length) {
    return { cartId: null, checkoutUrl: null, errors };
  }
  const payload = data?.cartCreate;
  if (!payload) {
    return { cartId: null, checkoutUrl: null, errors: ["No cartCreate payload"] };
  }
  const ue = formatUserErrors(payload.userErrors);
  if (ue.length) {
    return { cartId: null, checkoutUrl: null, errors: ue };
  }
  const c = payload.cart;
  if (!c) {
    return { cartId: null, checkoutUrl: null, errors: ["Cart create returned null"] };
  }
  return { cartId: c.id, checkoutUrl: c.checkoutUrl, errors: [] };
}

type CartLinesAddData = {
  cartLinesAdd: {
    cart: { id: string; checkoutUrl: string; totalQuantity: number } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
};

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<{ ok: boolean; errors: string[] }> {
  const { data, errors } = await storefrontGraphQL<CartLinesAddData>(
    CART_LINES_ADD,
    { cartId, lines },
  );
  if (errors.length) {
    return { ok: false, errors };
  }
  const payload = data?.cartLinesAdd;
  if (!payload) {
    return { ok: false, errors: ["No cartLinesAdd payload"] };
  }
  const ue = formatUserErrors(payload.userErrors);
  if (ue.length) {
    return { ok: false, errors: ue };
  }
  if (!payload.cart) {
    return { ok: false, errors: ["cartLinesAdd returned null cart"] };
  }
  return { ok: true, errors: [] };
}

type CartLinesUpdateData = {
  cartLinesUpdate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
};

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<{ ok: boolean; errors: string[] }> {
  const { data, errors } = await storefrontGraphQL<CartLinesUpdateData>(
    CART_LINES_UPDATE,
    { cartId, lines },
  );
  if (errors.length) {
    return { ok: false, errors };
  }
  const payload = data?.cartLinesUpdate;
  if (!payload) {
    return { ok: false, errors: ["No cartLinesUpdate payload"] };
  }
  const ue = formatUserErrors(payload.userErrors);
  if (ue.length) {
    return { ok: false, errors: ue };
  }
  if (!payload.cart) {
    return { ok: false, errors: ["cartLinesUpdate returned null cart"] };
  }
  return { ok: true, errors: [] };
}

type CartLinesRemoveData = {
  cartLinesRemove: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
};

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<{ ok: boolean; errors: string[] }> {
  const { data, errors } = await storefrontGraphQL<CartLinesRemoveData>(
    CART_LINES_REMOVE,
    { cartId, lineIds },
  );
  if (errors.length) {
    return { ok: false, errors };
  }
  const payload = data?.cartLinesRemove;
  if (!payload) {
    return { ok: false, errors: ["No cartLinesRemove payload"] };
  }
  const ue = formatUserErrors(payload.userErrors);
  if (ue.length) {
    return { ok: false, errors: ue };
  }
  if (!payload.cart) {
    return { ok: false, errors: ["cartLinesRemove returned null cart"] };
  }
  return { ok: true, errors: [] };
}

export async function getMerchandiseIdForHandle(
  handle: string,
): Promise<string | null> {
  const node = await getStorefrontProductByHandle(handle.trim());
  if (!node) return null;
  return getDefaultVariantGidFromStorefrontNode(node);
}

export async function readCartIdFromRequest(
  request: Request,
): Promise<string | null> {
  const raw = await shopifyCartIdCookie.parse(request.headers.get("Cookie"));
  return typeof raw === "string" && raw.startsWith("gid://") ? raw : null;
}

export function setCartIdCookieHeader(cartId: string): Promise<string> {
  return shopifyCartIdCookie.serialize(cartId);
}

export function clearCartIdCookieHeader(): Promise<string> {
  return shopifyCartIdCookie.serialize("", { maxAge: 0 });
}

/**
 * Add line: use existing cart or create new; returns Set-Cookie when a new cart is created
 * or cart id changed (should not change on add).
 */
export async function addLineToCart(
  request: Request,
  merchandiseId: string,
  quantity: number,
): Promise<{
  ok: boolean;
  errors: string[];
  setCookie: string | null;
  clearCookie: boolean;
}> {
  const q = Math.max(1, Math.min(99, Math.floor(quantity) || 1));
  let cartId = await readCartIdFromRequest(request);

  if (!cartId) {
    const created = await createCartWithLines([
      { merchandiseId, quantity: q },
    ]);
    if (!created.cartId) {
      return {
        ok: false,
        errors: created.errors,
        setCookie: null,
        clearCookie: false,
      };
    }
    const cookie = await setCartIdCookieHeader(created.cartId);
    return { ok: true, errors: [], setCookie: cookie, clearCookie: false };
  }

  const added = await addCartLines(cartId, [
    { merchandiseId, quantity: q },
  ]);
  if (added.ok) {
    return { ok: true, errors: [], setCookie: null, clearCookie: false };
  }

  const created = await createCartWithLines([
    { merchandiseId, quantity: q },
  ]);
  if (!created.cartId) {
    return {
      ok: false,
      errors: added.errors,
      setCookie: null,
      clearCookie: true,
    };
  }
  const cookie = await setCartIdCookieHeader(created.cartId);
  return { ok: true, errors: [], setCookie: cookie, clearCookie: false };
}
