import Controller from "@/utils/interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from "express";
import HttpException from "@/utils/exceptions/http.exception";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import McqService from "../services/mcq.service";
import { MCQ } from "../interfaces/mcq.interface";

class QuizController implements Controller {
  public path = "/quiz";
  public router = Router();

  private McqService = new McqService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, authenticatedMiddleware, this.postMcq);

    this.router.get(`${this.path}`, authenticatedMiddleware, this.getMcq);

    this.router.delete(
      `${this.path}/delete-category/:category`,
      authenticatedMiddleware,
      this.deleteMcqCategory,
    );

    this.router.get(`${this.path}/:id`, this.getMcqTopic);

    this.router.delete(
      `${this.path}/:id`,
      authenticatedMiddleware,
      this.deleteMcq,
    );

    this.router.put(`${this.path}/:id`, authenticatedMiddleware, this.editMcq);
  }

  private postMcq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        category,
        mcqs,
      }: { title: string; category: string; mcqs: MCQ[] } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await this.McqService.save(title, mcqs, userId, category);

      res.status(201).json({ message: "MCQs Created Successfully" });
    } catch (err) {
      next(new HttpException(400, (err as Error).message));
    }
  };

  private getMcqTopic = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const mcqId = req.params.id;

      const mcq = await this.McqService.getMcqTopic(mcqId);

      res.status(200).json({ mcq });
    } catch (err) {
      console.log(err);
      next(new HttpException(400, (err as Error).message));
    }
  };

  private deleteMcqCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const category = req.params.category;

      await this.McqService.deleteCategory(category);

      res.status(200).json("Category deleted successfully");
    } catch (err) {
      next(new HttpException(400, (err as Error).message));
    }
  };

  private getMcq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const mcq = await this.McqService.get(userId);

      res.status(200).json({ mcq });
    } catch (err) {
      console.log(err);
      next(new HttpException(400, (err as Error).message));
    }
  };

  private deleteMcq = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const mcqId = req.params.id;
      await this.McqService.delete(mcqId);

      res.status(200).json("Quiz Deleted Successfully");
    } catch (err) {
      next(new HttpException(400, (err as Error).message));
    }
  };

  private editMcq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mcqId = req.params.id;
      const {
        title,
        category,
        mcqs,
        score,
      }: { title: string; category: string; mcqs: MCQ[]; score: number } =
        req.body;

      await this.McqService.edit(mcqId, title, mcqs, category, score);

      res.status(200).json("quiz Deleted Successfully");
    } catch (err) {
      next(new HttpException(400, (err as Error).message));
    }
  };
}

export default QuizController;
