export interface MCQAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

export interface MCQAttempt {
  userId: string;
  mcqSetId: string;
  title: string;
  numberOfQuestions: number;
  score: number;
  answers: { [key: number]: boolean | string };
  timestamp: Date;
}

export interface Stat {
  name: string;
  avgScore: number;
  attempts: number;
}

export interface FlashcardAttempt {
  userId: string;
  deckId: string;
  category: string;
  cardsReviewed: number;
  knownCards: number;
  timestamp: Date;
}

export interface TitleStat {
  name: string;
  correct: number;
  total: number;
}
