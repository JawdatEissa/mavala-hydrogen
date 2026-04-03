import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export function loader(_args: LoaderFunctionArgs) {
  return redirect("/join");
}

export default function SignInRedirect() {
  return null;
}
