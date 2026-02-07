/**
 * Skin Diagnosis Quiz Data
 * 
 * This file contains the structure and content for the Skin Diagnosis quiz,
 * including question types, step definitions, and all quiz content.
 */

export type QuestionType = 'text' | 'choice' | 'email';

export interface QuizStep {
  id: number;
  type: QuestionType;
  intro?: string;
  question: string;
  subtext?: string;
  options?: string[];
  placeholder?: string;
  imageSrc: string;
}

export const SKIN_QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    type: 'text',
    intro: 'Welcome to the Skin Diagnosis',
    question: 'What is your first name?',
    placeholder: 'Enter your first name',
    imageSrc: '/quiz/step1.jpg',
  },
  {
    id: 2,
    type: 'choice',
    question: 'You are...',
    options: ['Woman', 'Man', 'Prefer not to say'],
    imageSrc: '/quiz/step2.jpg',
  },
  {
    id: 3,
    type: 'choice',
    question: 'How old are you?',
    options: ['Under 25', '25-34', '35-44', '45-54', '55+'],
    imageSrc: '/quiz/step3.png',
  },
  {
    id: 4,
    type: 'choice',
    question: 'What is your skin type?',
    options: [
      'Normal',
      'Dry',
      'Oily',
      'Combination',
      'Sensitive',
      'Not sure',
    ],
    imageSrc: '/quiz/step4.png',
  },
  {
    id: 5,
    type: 'choice',
    question: 'Main skin concern?',
    options: [
      'Wrinkles & Fine Lines',
      'Dryness & Tightness',
      'Dullness & Lack of Radiance',
      'Dark Spots & Uneven Tone',
      'Imperfections & Blemishes',
      'Sensitivity & Redness',
    ],
    imageSrc: '/quiz/step5.png',
  },
  {
    id: 6,
    type: 'choice',
    question: 'How often do you wear makeup?',
    options: ['Daily', 'A few times a week', 'Occasionally', 'Rarely or never'],
    imageSrc: '/quiz/step9.jpg',
  },
  {
    id: 7,
    type: 'email',
    question: 'Get your personalized results',
    subtext: 'Enter your email for your skin analysis & 20% off your first order',
    placeholder: 'your@email.com',
    imageSrc: '/quiz/step8.jpg',
  },
];

