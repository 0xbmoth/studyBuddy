import { model, Schema, Types } from "mongoose";
import { Flashcard } from "../interfaces/flashcard.interface";

// Define the schema for individual flashcards
const flashcardSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const flashcardsSchema = new Schema(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId(),
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    flashcards: [flashcardSchema],
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default model<Flashcard>("Flashcards", flashcardsSchema);
