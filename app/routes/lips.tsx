import { redirect } from "@remix-run/node";

// Redirect /lips to /face-lips (category consolidation)
export const loader = () => {
  return redirect("/face-lips", 301);
};







