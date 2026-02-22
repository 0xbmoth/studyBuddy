import HttpException from "@/utils/exceptions/http.exception";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router, Request, Response, NextFunction } from "express";
import Groq from "groq-sdk";
import multer from "multer";
import pdfParser from "pdf-parse";

class GenerateController {
  public path = "/generate";
  public router = Router();

  private upload: multer.Multer;
  private storage = multer.memoryStorage();
  private GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  constructor() {
    this.upload = multer({ storage: this.storage });

    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/upload-pdf`,
      this.upload.single("pdf"),
      this.postPDF,
    );

    this.router.post(`${this.path}`, this.generate);
  }

  private generate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { lesson, module, subject, type, language, n } = req.body;

    const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        }
      });

    
    const promptMcq = `
      ### ROLE
      You are an expert Professor in ${module}. Your task is to create a high-level academic assessment for ${subject}.

      ### TASK
      Generate exactly ${n} difficult Multiple-Response Questions (MRQs) in ${language} based STRICTLY on the text provided below. 

      ### RULES
      1. Each question MUST have exactly 5 options.
      2. One or MORE options can be correct (Multiple Response).
      3. The "answers" array must contain the indices of the correct options (e.g., [1, 3, 5]).
      4. Only use information provided in the "SOURCE TEXT".
      5. Output ONLY a valid JSON object. No prose, no markdown code blocks.

      ### SOURCE TEXT
      ${lesson}

      ### TARGET JSON STRUCTURE
      {
        "questions": [
          {
            "id": 1,
            "question": "Example question text?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
            "answers": [1, 4], // count is from 0
            "explanation": "Briefly explain why these are correct."
          }
        ]
      }`;

    const promptFlashcards = `
    ### ROLE
    You are a pedagogical expert specializing in Active Recall and Spaced Repetition.

    ### TASK
    Generate ${n} high-quality flashcards in ${language} based on the text provided below.

    ### RULES
    1. Each flashcard should focus on a single key concept or definition.
    2. The "answer" should be concise.
    3. The "explanation" must clarify why the concept is important or how it relates to the context of ${subject}.
    4. Output ONLY valid JSON.

    ### SOURCE TEXT
    ${lesson}

    ### TARGET JSON STRUCTURE
    {
      "questions": [
        {
          "id": 1,
          "question": "What is [Concept]?",
          "answer": "Concise definition.",
        }
      ]
    }`;
    
    try {
      const prompt = type == "quiz" ? promptMcq : promptFlashcards;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const data = JSON.parse(text);
      res.json({ aiResponse: data });
    } catch (err) {
      console.log(err)
      next(new HttpException(400, (err as Error).message));
    }
  };

  private postPDF = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const pdfBuffer = req.file.buffer; // Access uploaded file buffer directly

      const pdfText = await pdfParser(pdfBuffer);

      const extractedText = pdfText.text;

      res.json({ extractedText });
    } catch (error) {
      next(new HttpException(400, (error as Error).message));
    }
  };
}

export default GenerateController;
