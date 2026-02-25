import { MCQ } from "./mcq";

export type QuestionUpload = {
  question: string;
  options: string[];
  answers: number[];
  explanation: string
};

export type QuestionsUpload = {
  mcqs: QuestionUpload[];
};

export const transformQuestions = (
  questions: QuestionUpload[] | undefined
): MCQ[] => {
  if (!questions) return [];

  return questions.map((q, i) => ({
    id: `q-${Date.now()}-${i}`,
    question: q.question,
    options: q.options,
    answers: q.answers,
    answered: false,
    explanation: q.explanation
  }));
};
