export type MCQ = {
  id: string;
  answers: number[];
  question: string;
  options: string[];
  explanation: string;
  answered?: boolean;
  selected?: number[];
  score?: number;
  label?: string
  updatedAt?: string
};

export type MCQs = {
  mcqs: MCQ[];
  title: string;
  category: string;
  _id?: string;
  score?: number;
};

export interface EditingQuestion {
  index: number;
  text: string;
}

export interface AddingOption {
  text: string;
  isCorrect: boolean;
}

export interface SelectedOptions {
  [key: number]: number[];
}
