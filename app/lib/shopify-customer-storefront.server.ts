/**
 * Storefront API — customer signup, login token, and session validation.
 */

import { storefrontGraphQL } from "./shopify-storefront.server";

const CUSTOMER_CREATE = `#graphql
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `#graphql
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_BY_TOKEN = `#graphql
  query CustomerByToken($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
    }
  }
`;

export type StorefrontCustomerUserError = {
  code?: string;
  field?: string[];
  message: string;
};

export type CustomerCreateResult =
  | {
      ok: true;
      customerId: string;
      email: string;
      firstName: string | null;
    }
  | { ok: false; errors: StorefrontCustomerUserError[] };

export type AccessTokenResult =
  | {
      ok: true;
      accessToken: string;
      expiresAt: string | null;
    }
  | { ok: false; errors: StorefrontCustomerUserError[] };

export async function storefrontCustomerCreate(input: {
  email: string;
  password: string;
  firstName: string;
  acceptsMarketing?: boolean;
}): Promise<CustomerCreateResult> {
  const { data, errors } = await storefrontGraphQL<{
    customerCreate: {
      customer: { id: string; email: string; firstName: string | null } | null;
      customerUserErrors: StorefrontCustomerUserError[];
    };
  }>(CUSTOMER_CREATE, {
    input: {
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      acceptsMarketing: input.acceptsMarketing ?? false,
    },
  });

  if (errors.length) {
    return { ok: false, errors: [{ message: errors.join("; ") }] };
  }

  const payload = data?.customerCreate;
  const userErrors = payload?.customerUserErrors ?? [];
  if (userErrors.length) {
    return { ok: false, errors: userErrors };
  }

  const customer = payload?.customer;
  if (!customer?.id) {
    return {
      ok: false,
      errors: [{ message: "Account could not be created." }],
    };
  }

  return {
    ok: true,
    customerId: customer.id,
    email: customer.email,
    firstName: customer.firstName,
  };
}

export async function storefrontCustomerAccessTokenCreate(input: {
  email: string;
  password: string;
}): Promise<AccessTokenResult> {
  const { data, errors } = await storefrontGraphQL<{
    customerAccessTokenCreate: {
      customerAccessToken: {
        accessToken: string;
        expiresAt: string;
      } | null;
      customerUserErrors: StorefrontCustomerUserError[];
    };
  }>(CUSTOMER_ACCESS_TOKEN_CREATE, {
    input: {
      email: input.email,
      password: input.password,
    },
  });

  if (errors.length) {
    return { ok: false, errors: [{ message: errors.join("; ") }] };
  }

  const payload = data?.customerAccessTokenCreate;
  const userErrors = payload?.customerUserErrors ?? [];
  if (userErrors.length) {
    return { ok: false, errors: userErrors };
  }

  const token = payload?.customerAccessToken;
  if (!token?.accessToken) {
    return {
      ok: false,
      errors: [{ message: "Invalid email or password." }],
    };
  }

  return {
    ok: true,
    accessToken: token.accessToken,
    expiresAt: token.expiresAt ?? null,
  };
}

export type StorefrontCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export async function getStorefrontCustomerByToken(
  accessToken: string,
): Promise<StorefrontCustomer | null> {
  if (!accessToken?.trim()) {
    return null;
  }

  const { data, errors } = await storefrontGraphQL<{
    customer: StorefrontCustomer | null;
  }>(CUSTOMER_BY_TOKEN, { customerAccessToken: accessToken.trim() });

  if (errors.length || !data?.customer?.id) {
    return null;
  }

  return data.customer;
}
