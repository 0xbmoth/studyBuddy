import { Types } from "mongoose";
import { MCQ, MCQs } from "../interfaces/mcq.interface";
import mcqModel from "../models/mcq.model";
import { Request } from "express";

export default class McqService {
  private mcq = mcqModel;

  public async save(
    title: string,
    mcqs: MCQ[],
    user: Types.ObjectId,
    category: string,
  ): Promise<String | Error> {
    try {
      const newMcq = new this.mcq({
        title,
        category,
        mcqs,
        user,
      });

      await newMcq.save();

      return "MCQ created successfully";
    } catch (err) {
      throw new Error("Unable to create user");
    }
  }

  public async get(userId: Types.ObjectId): Promise<MCQs | Error> {
    try {
      const mcq = this.mcq.find({ user: userId }).exec();
      return mcq as unknown as MCQs;
    } catch (err) {
      throw new Error("MCQs not found");
    }
  }

  public async delete(mcqId: string) {
    try {
      const result = await this.mcq.findByIdAndDelete(mcqId).exec();

      if (!result) {
        throw new Error("Flashcard not found");
      }
    } catch (err) {
      throw new Error(`Error deleting flashcard: ${(err as Error).message}`);
    }
  }

  public async getMcqTopic(mcqId: string) {
    try {
      const mcq = await this.mcq.findById(mcqId).exec();

      if (!mcq) {
        throw new Error("Flashcard not found");
      }

      return mcq as MCQ;
    } catch (err) {
      throw new Error(`Error getting MCQ: ${(err as Error).message}`);
    }
  }

  public async edit(
    mcqId: string,
    title: string,
    mcqs: MCQ[],
    category: string,
    score: number,
  ) {
    try {
      const mcq = await this.mcq
        .findByIdAndUpdate(
          mcqId,
          { title, mcqs, category, score },
          { new: true },
        )
        .exec();

      if (!mcq) {
        throw new Error("Flashcard not found");
      }

      return "MCQ saved successfully";
    } catch (err) {
      throw new Error(`Error Editing MCQ: ${(err as Error).message}`);
    }
  }

  public async deleteCategory(category: string) {
    try {
      const quizzes = await this.mcq.find({ category: category });

      quizzes.forEach(async (quiz) => {
        await quiz.deleteOne();
      });
    } catch (err) {
      throw new Error(`Error Deleting Category: ${(err as Error).message}`);
    }
  }
}
