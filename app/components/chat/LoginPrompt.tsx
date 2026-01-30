/**
 * LoginPrompt - Prompt shown when user is not logged in
 */

interface LoginPromptProps {
  onLoginClick?: () => void;
}

export default function LoginPrompt({ onLoginClick }: LoginPromptProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="w-20 h-20 rounded-full bg-[#E31837]/10 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 text-[#E31837]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>

      <h4 className="font-['Archivo'] text-lg font-medium text-gray-800 mb-2">
        Sign in to chat
      </h4>

      <p className="text-sm text-gray-500 mb-6 max-w-[260px]">
        Create an account or sign in to access our AI Beauty Assistant and get
        personalized recommendations.
      </p>

      <button
        onClick={onLoginClick}
        className="px-6 py-2.5 bg-[#E31837] text-white text-sm font-medium rounded-lg hover:bg-[#c41530] transition-colors"
      >
        Sign In
      </button>

      <p className="text-xs text-gray-400 mt-4">
        New to Mavala?{" "}
        <button
          onClick={onLoginClick}
          className="text-[#E31837] hover:underline"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}
