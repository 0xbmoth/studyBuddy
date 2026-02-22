import { v4 as uuid } from "uuid";
import { MCQAttempt } from "../types/Attempts";
import { axiosInstance } from "../services/auth.service";
import { MCQs } from "../types/mcq";

export const useMcqAttempt = (userId: string) => {
  const handleSaveAttempt = async (
    mcq: MCQs,
    answers: { [key: number]: boolean },
    score: number
  ) => {
    const mcqAttempt: MCQAttempt = {
      userId,
      mcqSetId: mcq._id || uuid(),
      title: mcq.title,
      numberOfQuestions: mcq.mcqs.length,
      score,
      answers,
      timestamp: new Date(),
    };

    try {
      const response = await axiosInstance.post("/attempt/mcq", { mcqAttempt });
      return response.data;
    } catch (error) {
      console.error("Failed to save MCQ attempt:", error);
      throw new Error("Failed to save MCQ attempt");
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const userResponse = await axiosInstance.get("/users");
      const userId = userResponse.data.user._id;
      const attemptsResponse = await axiosInstance.get(
        `/attempt/user/${userId}`
      );
      return attemptsResponse.data;
    } catch (error) {
      console.error("Error fetching user attempts:", error);
      throw new Error("Failed to fetch user attempts");
    }
  };

  return { handleSaveAttempt, fetchUserAttempts };
};
