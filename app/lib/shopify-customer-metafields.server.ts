/**
 * Admin API — quiz profile metafields on Customer.
 * Requires customer metafield definitions in Shopify Admin (namespace custom).
 */

import { adminGraphQL } from "./shopify-admin.server";

const METAFIELDS_SET = `#graphql
  mutation QuizMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const QUIZ_METAFIELD_NAMESPACE = "custom";
export const QUIZ_METAFIELD_KEYS = {
  gender: "quiz_gender",
  ageRange: "quiz_age_range",
  interests: "quiz_interests",
} as const;

/**
 * Best-effort: failures are logged; signup still succeeds without metafields.
 */
export async function setCustomerQuizMetafields(
  customerGid: string,
  fields: { gender: string; ageRange: string; interests: string },
): Promise<void> {
  const metafields = [
    {
      ownerId: customerGid,
      namespace: QUIZ_METAFIELD_NAMESPACE,
      key: QUIZ_METAFIELD_KEYS.gender,
      type: "single_line_text_field",
      value: fields.gender.slice(0, 255),
    },
    {
      ownerId: customerGid,
      namespace: QUIZ_METAFIELD_NAMESPACE,
      key: QUIZ_METAFIELD_KEYS.ageRange,
      type: "single_line_text_field",
      value: fields.ageRange.slice(0, 255),
    },
    {
      ownerId: customerGid,
      namespace: QUIZ_METAFIELD_NAMESPACE,
      key: QUIZ_METAFIELD_KEYS.interests,
      type: "single_line_text_field",
      value: fields.interests.slice(0, 255),
    },
  ];

  const { data, errors } = await adminGraphQL<{
    metafieldsSet: {
      metafields: { id: string }[] | null;
      userErrors: { field?: string[]; message: string }[];
    };
  }>(METAFIELDS_SET, { metafields });

  if (errors.length) {
    console.error("[quiz-metafields] GraphQL:", errors.join("; "));
    return;
  }

  const ue = data?.metafieldsSet?.userErrors ?? [];
  if (ue.length) {
    console.error(
      "[quiz-metafields] userErrors:",
      ue.map((e) => e.message).join("; "),
    );
  }
}
