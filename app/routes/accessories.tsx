import { redirect } from "@remix-run/node";

// Redirect /accessories to /nail-care (category consolidation - Manicure Tools merged into Nail Care)
export const loader = () => {
  return redirect("/nail-care", 301);
};
