import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@remix-run/react';

// Types
type QuestionType = 'text' | 'choice' | 'email' | 'password';
type Language = 'en' | 'fr';

interface QuizStep {
  id: number;
  type: QuestionType;
  imageSrc: string;
}

interface StepTranslation {
  intro?: string;
  question: string;
  subtext?: string;
  options?: string[];
  placeholder?: string;
}

// Quiz Steps - Streamlined for sign-in/registration
const SIGN_IN_STEPS: QuizStep[] = [
  {
    id: 1,
    type: 'text',
    imageSrc: '/quiz/step1.jpg',
  },
  {
    id: 2,
    type: 'email',
    imageSrc: '/quiz/step5.png',
  },
  {
    id: 3,
    type: 'password',
    imageSrc: '/quiz/step9.jpg',
  },
  {
    id: 4,
    type: 'choice',
    imageSrc: '/quiz/step2.jpg',
  },
  {
    id: 5,
    type: 'choice',
    imageSrc: '/quiz/step3.png',
  },
  {
    id: 6,
    type: 'choice',
    imageSrc: '/quiz/step4.png',
  },
];

// Translations
const translations: Record<Language, { steps: { [key: number]: StepTranslation } }> = {
  en: {
    steps: {
      1: {
        intro: 'Welcome to Mavala',
        question: 'What is your first name?',
        placeholder: 'Enter your first name',
      },
      2: {
        question: 'What is your email?',
        subtext: 'We\'ll use this to create your account',
        placeholder: 'your@email.com',
      },
      3: {
        question: 'Create a password',
        subtext: 'At least 8 characters',
        placeholder: 'Enter your password',
      },
      4: {
        question: 'I identify as...',
        options: ['Woman', 'Man', 'Prefer not to say'],
      },
      5: {
        question: 'What is your age range?',
        options: ['Under 25', '25-34', '35-44', '45-54', '55+'],
      },
      6: {
        question: 'What interests you most?',
        subtext: 'We\'ll personalize your experience',
        options: [
          'Nail Care & Polish',
          'Skincare',
          'Eye Beauty',
          'Hand & Foot Care',
          'Color & Makeup',
          'All of the above',
        ],
      },
    },
  },
  fr: {
    steps: {
      1: {
        intro: 'Bienvenue chez Mavala',
        question: 'Quel est votre prénom?',
        placeholder: 'Entrez votre prénom',
      },
      2: {
        question: 'Quelle est votre adresse email?',
        subtext: 'Nous l\'utiliserons pour créer votre compte',
        placeholder: 'votre@email.com',
      },
      3: {
        question: 'Créez un mot de passe',
        subtext: 'Au moins 8 caractères',
        placeholder: 'Entrez votre mot de passe',
      },
      4: {
        question: 'Je m\'identifie comme...',
        options: ['Femme', 'Homme', 'Je préfère ne pas répondre'],
      },
      5: {
        question: 'Quelle est votre tranche d\'âge?',
        options: ['Moins de 25 ans', '25-34 ans', '35-44 ans', '45-54 ans', '55 ans et plus'],
      },
      6: {
        question: 'Qu\'est-ce qui vous intéresse le plus?',
        subtext: 'Nous personnaliserons votre expérience',
        options: [
          'Soins des ongles & Vernis',
          'Soins de la peau',
          'Beauté des yeux',
          'Soins des mains & pieds',
          'Couleur & Maquillage',
          'Tout ce qui précède',
        ],
      },
    },
  },
};

interface Answers {
  [key: number]: string;
}

export function SignInQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isComplete, setIsComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const step = SIGN_IN_STEPS[currentStep];
  const stepTranslations = translations[language].steps[step.id];
  const progress = ((currentStep + 1) / SIGN_IN_STEPS.length) * 100;
  const isLastStep = currentStep === SIGN_IN_STEPS.length - 1;

  // Update input value when step or language changes
  useEffect(() => {
    setInputValue(answers[step.id] || '');
  }, [currentStep, step.id, answers, language]);

  const handleChoiceSelect = (option: string) => {
    const newAnswers = { ...answers, [step.id]: option };
    setAnswers(newAnswers);

    if (isLastStep) {
      handleComplete(newAnswers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;
    
    // Validate email format
    if (step.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue.trim())) {
        return;
      }
    }
    
    // Validate password length
    if (step.type === 'password' && inputValue.trim().length < 8) {
      return;
    }

    const newAnswers = { ...answers, [step.id]: inputValue.trim() };
    setAnswers(newAnswers);

    if (isLastStep) {
      handleComplete(newAnswers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = (finalAnswers: Answers) => {
    console.log('Sign-up completed! Data:', finalAnswers);
    setIsComplete(true);
    // TODO: Send to API, create account, etc.
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step has a valid answer
  const hasAnswer = (() => {
    if (step.type === 'choice') {
      return !!answers[step.id];
    }
    if (step.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputValue.trim());
    }
    if (step.type === 'password') {
      return inputValue.trim().length >= 8;
    }
    return !!inputValue.trim();
  })();

  const handleNext = () => {
    if (!hasAnswer) return;

    if (currentStep < SIGN_IN_STEPS.length - 1) {
      if (step.type !== 'choice') {
        const newAnswers = { ...answers, [step.id]: inputValue.trim() };
        setAnswers(newAnswers);
      }
      setCurrentStep(currentStep + 1);
    } else if (isLastStep) {
      const finalAnswers = { ...answers };
      if (inputValue.trim()) {
        finalAnswers[step.id] = inputValue.trim();
      }
      handleComplete(finalAnswers);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  // Success/Complete Screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Left Side - Success Message */}
          <div className="w-full md:w-[40%] bg-white flex flex-col items-center justify-center px-6 md:px-12 py-12 md:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md text-center"
            >
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#AE1932] flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="font-['Archivo'] text-3xl md:text-4xl font-semibold text-[#AE1932] mb-4">
                {language === 'en' ? 'Welcome to Mavala!' : 'Bienvenue chez Mavala!'}
              </h1>

              <p className="font-['Archivo'] text-lg text-gray-600 mb-4">
                {language === 'en'
                  ? `Hi ${answers[1] || 'there'}! Your account has been created.`
                  : `Bonjour ${answers[1] || ''}! Votre compte a été créé.`}
              </p>

              <p className="font-['Archivo'] text-base text-gray-500 mb-8">
                {language === 'en'
                  ? 'Get ready to discover personalized beauty recommendations just for you.'
                  : 'Préparez-vous à découvrir des recommandations beauté personnalisées rien que pour vous.'}
              </p>

              {/* Perks */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-['Archivo'] text-sm uppercase tracking-wider text-gray-500 mb-4">
                  {language === 'en' ? 'Your Member Benefits' : 'Vos Avantages Membre'}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#AE1932] rounded-full flex-shrink-0"></span>
                    <span className="font-['Archivo'] text-gray-700">
                      {language === 'en' ? 'Personalized product recommendations' : 'Recommandations produits personnalisées'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#AE1932] rounded-full flex-shrink-0"></span>
                    <span className="font-['Archivo'] text-gray-700">
                      {language === 'en' ? 'Exclusive member discounts' : 'Réductions membres exclusives'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#AE1932] rounded-full flex-shrink-0"></span>
                    <span className="font-['Archivo'] text-gray-700">
                      {language === 'en' ? 'Early access to new products' : 'Accès anticipé aux nouveaux produits'}
                    </span>
                  </li>
                </ul>
              </div>

              <Link
                to="/"
                className="inline-block w-full px-8 py-4 bg-[#AE1932] text-white font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-[#8d1428] transition-colors duration-200"
              >
                {language === 'en' ? 'Start Exploring' : 'Commencer à Explorer'}
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Image */}
          <div className="w-full md:w-[60%] relative bg-gray-100 min-h-[400px] md:min-h-screen">
            <img
              src="/quiz/step9.jpg"
              alt="Welcome"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-[#AE1932]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Top Bar with Logo, Language Toggle, and Back */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        {/* Back to Home */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-600 hover:text-[#AE1932] hover:border-[#AE1932] transition-colors duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-['Archivo'] text-sm font-medium">
            {language === 'en' ? 'Back' : 'Retour'}
          </span>
        </Link>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg hover:border-[#AE1932] hover:text-[#AE1932] transition-colors duration-200 shadow-sm"
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row min-h-screen pt-1">
        {/* Left Side - Questions (40% on desktop) */}
        <div className="w-full md:w-[40%] bg-white flex flex-col justify-center px-6 md:px-12 py-20 md:py-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep}-${language}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center"
            >
              {/* Step Number Indicator and Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#AE1932] flex items-center justify-center">
                    <span className="text-white font-['Archivo'] text-sm font-semibold">
                      {currentStep + 1}
                    </span>
                  </div>
                  <span className="font-['Archivo'] text-xs text-gray-500 uppercase tracking-wider">
                    {currentStep + 1} / {SIGN_IN_STEPS.length}
                  </span>
                </div>

                {/* Navigation Arrows */}
                <div className="flex flex-row gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="w-12 h-12 rounded-lg bg-white border-2 border-gray-300 hover:border-[#AE1932] hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] shadow-md hover:shadow-lg"
                    aria-label="Previous step"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="w-12 h-12 rounded-lg bg-[#AE1932] hover:bg-[#8d1428] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] shadow-md hover:shadow-lg"
                    aria-label="Next step"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Intro Text */}
              {stepTranslations.intro && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#AE1932]"></div>
                    <p className="font-['Archivo'] text-base md:text-lg text-gray-700 font-medium">
                      {stepTranslations.intro}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Question */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-['Archivo'] text-2xl md:text-3xl font-semibold text-[#AE1932] mb-4"
              >
                {stepTranslations.question}
              </motion.h2>

              {/* Subtext */}
              {stepTranslations.subtext && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-['Archivo'] text-sm text-gray-600 mb-6"
                >
                  {stepTranslations.subtext}
                </motion.p>
              )}

              {/* Choice Options */}
              {step.type === 'choice' && stepTranslations.options && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3 mb-8"
                >
                  {stepTranslations.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = answers[step.id] === option;
                    return (
                      <button
                        key={index}
                        onClick={() => handleChoiceSelect(option)}
                        className={`w-full text-left px-6 py-4 border-2 rounded-lg font-['Archivo'] text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] focus:ring-offset-2 ${
                          isSelected
                            ? 'border-[#AE1932] bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isSelected ? 'text-[#AE1932]' : 'text-gray-700'
                          }`}
                        >
                          <span className="font-semibold mr-2">{letter}:</span>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Text/Email/Password Input */}
              {(step.type === 'text' || step.type === 'email' || step.type === 'password') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-8"
                >
                  <div className="relative">
                    <input
                      type={step.type === 'password' ? (showPassword ? 'text' : 'password') : step.type === 'email' ? 'email' : 'text'}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && hasAnswer) {
                          handleTextSubmit();
                        }
                      }}
                      placeholder={stepTranslations.placeholder}
                      className="w-full px-4 py-4 border-2 border-gray-200 focus:border-[#AE1932] rounded-lg focus:outline-none font-['Archivo'] text-base text-gray-900 placeholder-gray-400 transition-colors"
                      autoComplete={step.type === 'email' ? 'email' : step.type === 'password' ? 'new-password' : 'given-name'}
                    />
                    {step.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Validation hint for password */}
                  {step.type === 'password' && inputValue.length > 0 && inputValue.length < 8 && (
                    <p className="mt-2 text-sm text-amber-600 font-['Archivo']">
                      {language === 'en' 
                        ? `${8 - inputValue.length} more characters needed`
                        : `${8 - inputValue.length} caractères de plus nécessaires`}
                    </p>
                  )}

                  <button
                    onClick={handleTextSubmit}
                    disabled={!hasAnswer}
                    className="mt-6 w-full px-8 py-4 bg-[#AE1932] text-white font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8d1428] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] focus:ring-offset-2"
                  >
                    {language === 'en' ? 'Continue' : 'Continuer'}
                  </button>
                </motion.div>
              )}

              {/* Sign in link for existing users */}
              {currentStep === 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center font-['Archivo'] text-sm text-gray-500"
                >
                  {language === 'en' ? 'Already have an account? ' : 'Vous avez déjà un compte? '}
                  <button className="text-[#AE1932] hover:underline font-medium">
                    {language === 'en' ? 'Sign in' : 'Se connecter'}
                  </button>
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side - Image (60% on desktop) */}
        <div className="w-full md:w-[60%] relative bg-gray-100 min-h-[400px] md:min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={step.imageSrc}
                alt={`Step ${step.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', step.imageSrc);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Gradient overlay for better text readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
