import { Document } from "mongoose";

export interface MCQs extends Document {
  title: string;
  category: string;
  mcqs: MCQ[];
  score: number;
}
export interface MCQ extends Document {
  question: string;
  options: string[];
  answers: number[];
  explanation: string
}
