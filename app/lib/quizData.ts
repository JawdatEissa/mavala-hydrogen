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
    options: ['Under 20', '20-29', '30-39', '40-49', '50-59', '60+'],
    imageSrc: '/quiz/step3.png',
  },
  {
    id: 4,
    type: 'choice',
    question: 'Main skin concern?',
    options: [
      'Wrinkles',
      'Tightness',
      'Dry Skin',
      'Dullness',
      'Imperfections',
      'Dark Spots',
      'Lack of Radiance',
    ],
    imageSrc: '/quiz/step4.png',
  },
  {
    id: 5,
    type: 'choice',
    question: 'Tightness during day?',
    options: ['Daily', 'Sometimes', 'Rarely'],
    imageSrc: '/quiz/step5.png',
  },
  {
    id: 6,
    type: 'choice',
    question: 'Sleep average?',
    options: ['<6h', '6-7h', '7-8h', '>8h'],
    imageSrc: '/quiz/step6.png',
  },
  {
    id: 7,
    type: 'choice',
    question: 'Do you smoke?',
    options: ['Daily', 'Occasionally', 'No'],
    imageSrc: '/quiz/step7.jpg',
  },
  {
    id: 8,
    type: 'choice',
    question: 'Wear makeup?',
    options: ['Daily', 'Occasional', 'No'],
    imageSrc: '/quiz/step8.jpg',
  },
  {
    id: 9,
    type: 'email',
    question: 'Enter email for -20%',
    subtext: 'Get results by email',
    placeholder: 'Enter your email address',
    imageSrc: '/quiz/step9.jpg',
  },
];

