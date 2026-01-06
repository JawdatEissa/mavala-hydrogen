import { redirect } from "@remix-run/node";

// Redirect /skincare to /face-lips (category consolidation)
export const loader = () => {
  return redirect("/face-lips", 301);
};

