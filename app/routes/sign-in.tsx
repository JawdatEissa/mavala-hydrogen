import type { MetaFunction } from '@remix-run/node';
import { SignInQuiz } from '~/components/SignInQuiz';

export const meta: MetaFunction = () => {
  return [
    { title: 'Join Mavala | Create Your Account' },
    {
      name: 'description',
      content:
        'Join the Mavala community and get personalized beauty recommendations. Sign up for exclusive offers and discover your perfect products.',
    },
  ];
};

export default function SignInPage() {
  return <SignInQuiz />;
}
