import { redirect } from "@remix-run/node";

// Redirect /eye-care to /eye-beauty (category consolidation)
export const loader = () => {
  return redirect("/eye-beauty", 301);
};







