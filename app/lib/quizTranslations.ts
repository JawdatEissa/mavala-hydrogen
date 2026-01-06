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
        options: ['Under 20', '20-29', '30-39', '40-49', '50-59', '60+'],
      },
      4: {
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
      },
      5: {
        question: 'Tightness during day?',
        options: ['Daily', 'Sometimes', 'Rarely'],
      },
      6: {
        question: 'Sleep average?',
        options: ['<6h', '6-7h', '7-8h', '>8h'],
      },
      7: {
        question: 'Do you smoke?',
        options: ['Daily', 'Occasionally', 'No'],
      },
      8: {
        question: 'Wear makeup?',
        options: ['Daily', 'Occasional', 'No'],
      },
      9: {
        question: 'Enter email for -20%',
        subtext: 'Get results by email',
        placeholder: 'Enter your email address',
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
        options: ['Une femme', 'Un homme', 'Ne souhaite pas répondre'],
      },
      3: {
        question: 'Quel âge avez-vous?',
        options: ['Moins de 20 ans', '20-29 ans', '30-39 ans', '40-49 ans', '50-59 ans', '60 ans et plus'],
      },
      4: {
        question: 'Préoccupation principale de la peau?',
        options: [
          'Rides',
          'Tiraillements',
          'Peau sèche',
          'Teint terne',
          'Imperfections',
          'Taches brunes',
          'Manque d\'éclat',
        ],
      },
      5: {
        question: 'Tiraillements pendant la journée?',
        options: ['Tous les jours', 'Parfois', 'Rarement'],
      },
      6: {
        question: 'Durée moyenne de sommeil?',
        options: ['<6h', '6-7h', '7-8h', '>8h'],
      },
      7: {
        question: 'Fumez-vous?',
        options: ['Tous les jours', 'Occasionnellement', 'Non'],
      },
      8: {
        question: 'Portez-vous du maquillage?',
        options: ['Tous les jours ou presque', 'Pour de grandes occasions', 'Non'],
      },
      9: {
        question: 'Entrez votre email pour -20%',
        subtext: 'Recevez les résultats par email',
        placeholder: 'Entrez votre adresse email',
      },
    },
  },
};










