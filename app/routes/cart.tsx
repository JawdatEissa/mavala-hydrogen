import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  Form,
} from "@remix-run/react";
import type { CartUI } from "~/lib/shopify-cart.server";
import {
  addLineToCart,
  clearCartIdCookieHeader,
  fetchCartById,
  getMerchandiseIdForHandle,
  readCartIdFromRequest,
  removeCartLines,
  updateCartLines,
} from "~/lib/shopify-cart.server";

export const meta: MetaFunction = () => {
  return [{ title: "Shopping Cart | Mavala Switzerland" }];
};

function formatMoney(amount: string, currencyCode: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(n);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cartId = await readCartIdFromRequest(request);
  if (!cartId) {
    return json({ cart: null as CartUI | null, banner: null as string | null });
  }

  const { cart, errors } = await fetchCartById(cartId);
  if (!cart) {
    const banner =
      errors[0] ?? "Your cart expired or is no longer available.";
    return json(
      { cart: null, banner },
      {
        headers: {
          "Set-Cookie": await clearCartIdCookieHeader(),
        },
      },
    );
  }

  return json({ cart, banner: null });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const redirectToCart = String(form.get("redirectTo") ?? "") === "/cart";

  if (intent === "add") {
    const merchandiseId = String(form.get("merchandiseId") ?? "").trim();
    const handle = String(form.get("handle") ?? "").trim();
    const quantity = Number(form.get("quantity")) || 1;

    let mid = merchandiseId;
    if (!mid && handle) {
      const resolved = await getMerchandiseIdForHandle(handle);
      mid = resolved ?? "";
    }

    if (!mid) {
      return json({
        ok: false as const,
        error: "This product is not available for checkout online.",
      });
    }

    const result = await addLineToCart(request, mid, quantity);
    const headers = new Headers();
    if (result.setCookie) headers.append("Set-Cookie", result.setCookie);
    if (!result.ok && result.clearCookie) {
      headers.append("Set-Cookie", await clearCartIdCookieHeader());
    }

    if (!result.ok) {
      return json(
        { ok: false as const, error: result.errors.join("; ") },
        headers.get("Set-Cookie") != null ? { headers } : undefined,
      );
    }

    if (redirectToCart) {
      return redirect("/cart", { headers });
    }
    return json(
      { ok: true as const, error: null as string | null },
      { headers },
    );
  }

  const cartId = await readCartIdFromRequest(request);
  if (!cartId) {
    if (intent === "checkout") {
      throw redirect("/cart");
    }
    return json({ ok: false, error: "Cart not found." });
  }

  if (intent === "update") {
    const lineId = String(form.get("lineId") ?? "");
    const quantity = Math.max(
      0,
      Math.min(99, Math.floor(Number(form.get("quantity")) || 0)),
    );
    if (!lineId) {
      return json({ ok: false, error: "Missing line." });
    }
    if (quantity < 1) {
      const rm = await removeCartLines(cartId, [lineId]);
      if (!rm.ok) {
        return json({ ok: false, error: rm.errors.join("; ") });
      }
      const { cart } = await fetchCartById(cartId);
      if (!cart || cart.lines.length === 0) {
        return json(
          { ok: true, error: null },
          { headers: { "Set-Cookie": await clearCartIdCookieHeader() } },
        );
      }
      return json({ ok: true, error: null });
    }
    const up = await updateCartLines(cartId, [{ id: lineId, quantity }]);
    if (!up.ok) {
      return json({ ok: false, error: up.errors.join("; ") });
    }
    return json({ ok: true, error: null });
  }

  if (intent === "remove") {
    const lineId = String(form.get("lineId") ?? "");
    if (!lineId) {
      return json({ ok: false, error: "Missing line." });
    }
    const rm = await removeCartLines(cartId, [lineId]);
    if (!rm.ok) {
      return json({ ok: false, error: rm.errors.join("; ") });
    }
    const { cart } = await fetchCartById(cartId);
    if (!cart || cart.lines.length === 0) {
      return json(
        { ok: true, error: null },
        { headers: { "Set-Cookie": await clearCartIdCookieHeader() } },
      );
    }
    return json({ ok: true, error: null });
  }

  if (intent === "checkout") {
    const { cart, errors } = await fetchCartById(cartId);
    if (!cart || errors.length) {
      return json({
        ok: false,
        error: errors[0] ?? "Could not load cart for checkout.",
      });
    }
    const url = cart.checkoutUrl?.trim();
    if (!url) {
      return json({ ok: false, error: "Checkout is unavailable." });
    }
    throw redirect(url);
  }

  return json({ ok: false, error: "Unknown action." });
};

export default function CartPage() {
  const { cart, banner } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const err =
    actionData && "error" in actionData && actionData.error
      ? actionData.error
      : null;

  return (
    <div className="pt-[104px] md:pt-[112px]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-light tracking-[0.15em] uppercase text-center mb-12">
          Shopping Cart
        </h1>

        {banner ? (
          <p className="text-center text-amber-800 text-sm mb-6">{banner}</p>
        ) : null}
        {err ? (
          <p className="text-center text-red-700 text-sm mb-6">{err}</p>
        ) : null}

        {!cart || cart.lines.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-mavala-gray mb-6">Your cart is empty</p>
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="grid grid-cols-12 gap-4 text-sm text-mavala-gray uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              </div>

              <ul className="space-y-6">
                {cart.lines.map((line) => (
                  <li
                    key={line.id}
                    className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-6"
                  >
                    <div className="col-span-6 flex gap-4">
                      <Link
                        to={`/products/${line.handle}`}
                        className="shrink-0 w-20 h-24 bg-[#f5f5f5] rounded-[3px] overflow-hidden flex items-center justify-center"
                      >
                        {line.imageUrl ? (
                          <img
                            src={line.imageUrl}
                            alt={line.imageAlt ?? line.productTitle}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : null}
                      </Link>
                      <div>
                        <Link
                          to={`/products/${line.handle}`}
                          className="font-medium text-[#272724] hover:underline"
                        >
                          {line.productTitle}
                        </Link>
                        {line.variantTitle ? (
                          <p className="text-sm text-mavala-gray mt-1">
                            {line.variantTitle}
                          </p>
                        ) : null}
                        <Form method="post" className="mt-2">
                          <input type="hidden" name="intent" value="remove" />
                          <input type="hidden" name="lineId" value={line.id} />
                          <button
                            type="submit"
                            disabled={busy}
                            className="text-xs uppercase tracking-wider text-mavala-gray hover:text-red-700"
                          >
                            Remove
                          </button>
                        </Form>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm">
                      {formatMoney(line.unitAmount, line.unitCurrency)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Form method="post" className="flex items-center gap-1">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <input
                          name="quantity"
                          type="number"
                          min={1}
                          max={99}
                          defaultValue={line.quantity}
                          className="w-14 border border-gray-200 rounded px-2 py-1 text-center text-sm"
                        />
                        <button
                          type="submit"
                          disabled={busy}
                          className="text-xs uppercase tracking-wider px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Update
                        </button>
                      </Form>
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium">
                      {formatMoney(line.lineTotalAmount, line.lineTotalCurrency)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-mavala-light-gray p-6">
                <h2 className="text-lg font-medium uppercase tracking-wider mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-mavala-gray">Subtotal</span>
                    <span>
                      {formatMoney(cart.subtotalAmount, cart.subtotalCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mavala-gray">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>
                      {formatMoney(cart.totalAmount, cart.totalCurrency)}
                    </span>
                  </div>
                </div>

                <Form method="post">
                  <input type="hidden" name="intent" value="checkout" />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full btn-primary py-4 disabled:opacity-50"
                  >
                    Proceed to Checkout
                  </button>
                </Form>

                <p className="text-xs text-mavala-gray text-center mt-4">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
