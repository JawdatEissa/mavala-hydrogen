import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

// Redirect all individual blog post requests to the main blog page (Coming Soon)
export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect('/blog');
};

