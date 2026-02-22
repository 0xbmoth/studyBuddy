export interface Answer {
  isCorrect: boolean;
}

export interface Answers {
  [key: number]: boolean;
}

export interface MCQAttempt {
  userId: string;
  mcqSetId: string;
  title: string;
  numberOfQuestions: number;
  score: number;
  answers: { [key: number]: boolean };
  timestamp: Date;
  attempted: number;
}

export interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

export interface CategoryStat {
  name: string;
  avgScore: number;
  attempts: number;
}

export interface TitleStat {
  name: string;
  correct: number;
  total: number;
}

export interface WeeklyData {
  timestamp: Date;
  score: number;
  questionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface UserStats {
  totalAttempts: number;
  weeklyData: WeeklyData[];
  categoryData: CategoryStat[];
  answered: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  currentStreak: number;
}
