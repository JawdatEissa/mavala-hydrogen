/**
 * Quiz Translations
 * 
 * Contains all translations for the Skin Diagnosis quiz in English and French
 */

export type Language = 'en' | 'fr';

export interface QuizTranslations {
  steps: {
    [key: number]: {
      intro?: string;
      question: string;
      subtext?: string;
      options?: string[];
      placeholder?: string;
    };
  };
}

export const translations: Record<Language, QuizTranslations> = {
  en: {
    steps: {
      1: {
        intro: 'Welcome to the Skin Diagnosis',
        question: 'What is your first name?',
        placeholder: 'Enter your first name',
      },
      2: {
        question: 'You are...',
        options: ['Woman', 'Man', 'Prefer not to say'],
      },
      3: {
        question: 'How old are you?',
        options: ['Under 25', '25-34', '35-44', '45-54', '55+'],
      },
      4: {
        question: 'What is your skin type?',
        options: [
          'Normal',
          'Dry',
          'Oily',
          'Combination',
          'Sensitive',
          'Not sure',
        ],
      },
      5: {
        question: 'Main skin concern?',
        options: [
          'Wrinkles & Fine Lines',
          'Dryness & Tightness',
          'Dullness & Lack of Radiance',
          'Dark Spots & Uneven Tone',
          'Imperfections & Blemishes',
          'Sensitivity & Redness',
        ],
      },
      6: {
        question: 'How often do you wear makeup?',
        options: ['Daily', 'A few times a week', 'Occasionally', 'Rarely or never'],
      },
      7: {
        question: 'Get your personalized results',
        subtext: 'Enter your email for your skin analysis & 20% off your first order',
        placeholder: 'your@email.com',
      },
    },
  },
  fr: {
    steps: {
      1: {
        intro: 'Bienvenue dans le Diagnostic Peau',
        question: 'Quel est votre prénom?',
        placeholder: 'Entrez votre prénom',
      },
      2: {
        question: 'Vous êtes...',
        options: ['Femme', 'Homme', 'Je préfère ne pas répondre'],
      },
      3: {
        question: 'Quel âge avez-vous?',
        options: ['Moins de 25 ans', '25-34 ans', '35-44 ans', '45-54 ans', '55 ans et plus'],
      },
      4: {
        question: 'Quel est votre type de peau?',
        options: [
          'Normale',
          'Sèche',
          'Grasse',
          'Mixte',
          'Sensible',
          'Je ne suis pas sûr(e)',
        ],
      },
      5: {
        question: 'Préoccupation principale de la peau?',
        options: [
          'Rides & Ridules',
          'Sécheresse & Tiraillements',
          'Teint terne & Manque d\'éclat',
          'Taches brunes & Teint irrégulier',
          'Imperfections & Boutons',
          'Sensibilité & Rougeurs',
        ],
      },
      6: {
        question: 'À quelle fréquence portez-vous du maquillage?',
        options: ['Tous les jours', 'Quelques fois par semaine', 'Occasionnellement', 'Rarement ou jamais'],
      },
      7: {
        question: 'Obtenez vos résultats personnalisés',
        subtext: 'Entrez votre email pour votre analyse de peau & -20% sur votre première commande',
        placeholder: 'votre@email.com',
      },
    },
  },
};










