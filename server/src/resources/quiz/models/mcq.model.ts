import { model, Schema, Types } from "mongoose";
import { MCQ } from "../interfaces/mcq.interface";

const mcqSchema = new Schema<MCQ>(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
    },
    explanation: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: false
    }
  },
  { _id: false },
);

const mcqsSchema = new Schema(
  {
    title: { type: String, required: true },
    mcqs: { type: [mcqSchema], required: true },
    category: { type: String, required: true },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    id: {
      type: String,
      default: () => new Types.ObjectId(),
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default model<MCQ>("Mcqs", mcqsSchema);
