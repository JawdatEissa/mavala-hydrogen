import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SKIN_QUIZ_STEPS, QuizStep } from '../lib/quizData';
import { translations, Language } from '../lib/quizTranslations';

interface Answers {
  [key: number]: string;
}

export function SkinDiagnosis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const step = SKIN_QUIZ_STEPS[currentStep];
  const stepTranslations = translations[language].steps[step.id];
  const progress = ((currentStep + 1) / SKIN_QUIZ_STEPS.length) * 100;
  const isLastStep = currentStep === SKIN_QUIZ_STEPS.length - 1;

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

    const newAnswers = { ...answers, [step.id]: inputValue.trim() };
    setAnswers(newAnswers);

    if (isLastStep) {
      handleComplete(newAnswers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = (finalAnswers: Answers) => {
    console.log('Quiz completed! Answers:', finalAnswers);
    // TODO: Handle quiz completion (show results, send to API, etc.)
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step has an answer
  const hasAnswer = 
    step.type === 'choice' 
      ? !!answers[step.id]
      : !!inputValue.trim();

  const handleNext = () => {
    if (!hasAnswer) {
      return; // Don't allow moving forward without an answer
    }

    if (currentStep < SKIN_QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isLastStep) {
      // Complete the quiz
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

      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-white border-2 border-[#AE1932] text-[#AE1932] font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-[#AE1932] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] focus:ring-offset-2"
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row min-h-screen pt-1">
        {/* Left Side - Questions (40% on desktop) */}
        <div className="w-full md:w-[40%] bg-white flex flex-col justify-center px-6 md:px-12 py-12 md:py-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep}-${language}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="max-w-md mx-auto w-full flex-1 flex flex-col"
            >
              {/* Step Number Indicator and Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#AE1932] flex items-center justify-center">
                    <span className="text-white font-['Archivo'] text-sm font-semibold">
                      {step.id}
                    </span>
                  </div>
                  <span className="font-['Archivo'] text-xs text-gray-500 uppercase tracking-wider">
                    {currentStep + 1} / {SKIN_QUIZ_STEPS.length}
                  </span>
                </div>
                
                {/* Navigation Arrows - Horizontal and More Visible */}
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
                className="font-['Archivo'] text-2xl md:text-3xl font-semibold text-[#AE1932] mb-6"
              >
                {stepTranslations.question}
                {step.type !== 'email' && <span className="text-[#AE1932]">*</span>}
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
                    const letter = String.fromCharCode(65 + index); // A, B, C, etc.
                    const isSelected = answers[step.id] === option;
                    return (
                      <button
                        key={index}
                        onClick={() => handleChoiceSelect(option)}
                        className={`w-full text-left px-6 py-4 border-2 rounded-lg font-['Archivo'] text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] focus:ring-offset-2 ${
                          isSelected
                            ? 'border-[#AE1932] bg-white'
                            : 'border-gray-200 bg-white hover:border-gray-300'
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

              {/* Text/Email Input */}
              {(step.type === 'text' || step.type === 'email') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-8"
                >
                  <input
                    type={step.type === 'email' ? 'email' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleTextSubmit();
                      }
                    }}
                    placeholder={stepTranslations.placeholder}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#AE1932] focus:outline-none font-['Archivo'] text-base text-gray-900 placeholder-gray-400 transition-colors"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!inputValue.trim()}
                    className="mt-6 w-full md:w-auto px-8 py-3 bg-[#AE1932] text-white font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8d1428] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#AE1932] focus:ring-offset-2"
                  >
                    Ok
                  </button>
                </motion.div>
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
