import { Types } from "mongoose";
import { MCQAttemptModel } from "../models/attempts.model";
import {
  MCQAttempt,
  DifficultyStats,
  UserStats,
  WeeklyData,
  CategoryStat,
  TitleStat,
} from "../interfaces/attempt.interface";
import { startOfDay, differenceInDays, subDays } from "date-fns";

export class AnalyticsService {
  public async getUserStats(userId: string): Promise<UserStats> {
    try {
      const [
        mcqsAttempts,
        questionsAnswered,
        recentMCQs,
        titleStats,
        categoryStats,
      ] = await Promise.all([
        MCQAttemptModel.countDocuments({
          userId,
          answers: { $exists: true, $ne: {} },
        }),
        MCQAttemptModel.aggregate([
          { $match: { userId } },
          {
            $project: {
              questionCount: { $size: { $objectToArray: "$answers" } },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$questionCount" },
            },
          },
        ]),
        MCQAttemptModel.find({ userId }).sort({ timestamp: -1 }).limit(30),
        MCQAttemptModel.aggregate([
          { $match: { userId } },
          {
            $project: {
              title: 1,
              category: 1,
              score: 1,
              answers: { $objectToArray: "$answers" },
            },
          },
          {
            $unwind: "$answers",
          },
          {
            $group: {
              _id: "$title",
              avgScore: { $avg: "$score" },
              totalAttempts: { $sum: 1 },
              correctAnswers: {
                $sum: { $cond: [{ $eq: ["$answers.v", true] }, 1, 0] },
              },
              wrongAnswers: {
                $sum: { $cond: [{ $eq: ["$answers.v", false] }, 1, 0] },
              },
            },
          },
        ]),
        // FIXED CATEGORY STATS AGGREGATION
        MCQAttemptModel.aggregate([
          { $match: { userId: userId } },

          {
            $lookup: {
              from: "mcqs",
              localField: "title",
              foreignField: "title",
              as: "mcqInfo",
            },
          },

          // Only keep documents where lookup was successful
          {
            $match: {
              "mcqInfo.0": { $exists: true }, // Ensure mcqInfo has at least one element
            },
          },

          // Extract category from the lookup result
          {
            $addFields: {
              category: { $arrayElemAt: ["$mcqInfo.category", 0] },
            },
          },

          // Additional safety check for category
          {
            $match: {
              category: { $exists: true, $ne: null },
            },
          },

          // Extract answers and other fields
          {
            $project: {
              title: 1,
              score: 1,
              answers: { $objectToArray: "$answers" },
              category: 1,
            },
          },

          { $unwind: "$answers" },

          // Calculate title-level averages within each category
          {
            $group: {
              _id: {
                category: "$category",
                title: "$title",
              },
              titleAvgScore: { $avg: "$score" },
              titleAttempts: { $sum: 1 },
              titleCorrectAnswers: {
                $sum: { $cond: [{ $eq: ["$answers.v", true] }, 1, 0] },
              },
              titleWrongAnswers: {
                $sum: { $cond: [{ $eq: ["$answers.v", false] }, 1, 0] },
              },
            },
          },

          // Calculate category-level averages (weighted by attempts)
          {
            $group: {
              _id: "$_id.category",
              totalWeightedScore: {
                $sum: {
                  $multiply: ["$titleAvgScore", "$titleAttempts"],
                },
              },
              attempts: { $sum: "$titleAttempts" },
              correctAnswers: { $sum: "$titleCorrectAnswers" },
              wrongAnswers: { $sum: "$titleWrongAnswers" },
              titlesCount: { $sum: 1 },
            },
          },

          // Calculate the actual weighted average
          {
            $addFields: {
              avgScore: {
                $cond: {
                  if: { $gt: ["$attempts", 0] },
                  then: {
                    $divide: ["$totalWeightedScore", "$attempts"],
                  },
                  else: 0,
                },
              },
            },
          },

          // Format output
          {
            $project: {
              name: "$_id",
              avgScore: { $round: ["$avgScore", 2] },
              attempts: 1,
              correctAnswers: 1,
              wrongAnswers: 1,
              titlesCount: 1,
              _id: 0,
            },
          },

          { $sort: { name: 1 } },
        ]),
      ]);

      const weeklyData: WeeklyData[] = recentMCQs.map((mcq) => {
        const answers = mcq.answers;
        let answersArray: [string, boolean][];

        if (answers instanceof Map) {
          answersArray = Array.from(answers.entries());
        } else {
          answersArray = Object.entries(answers);
        }

        const correctAnswers = answersArray.filter(
          (answer) => answer[1],
        ).length;
        const wrongAnswers = answersArray.filter((answer) => !answer[1]).length;

        return {
          timestamp: mcq.timestamp,
          score: mcq.score,
          questionsAttempted: correctAnswers + wrongAnswers,
          correctAnswers: correctAnswers || 0,
          wrongAnswers: wrongAnswers || 0,
        };
      });

      const categoryData: CategoryStat[] = categoryStats.map((stat) => ({
        name: stat.name,
        avgScore: (stat.correctAnswers / stat.attempts) * 100,
        attempts: stat.attempts,
        correctAnswers: stat.correctAnswers || 0,
        wrongAnswers: stat.wrongAnswers || 0,
      }));

      const answered: number =
        questionsAnswered.length > 0 ? questionsAnswered[0].total : 0;

      // Fix: Handle case where categoryStats might be empty
      const totalCorrectAnswers: number = categoryStats.reduce(
        (sum, stat) => sum + (stat.correctAnswers || 0),
        0,
      );
      const totalWrongAnswers: number = categoryStats.reduce(
        (sum, stat) => sum + (stat.wrongAnswers || 0),
        0,
      );

      let currentStreak = 0;
      if (recentMCQs.length > 0) {
        const sortedAttempts = [...recentMCQs].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        const today = startOfDay(new Date());
        let previousDate = startOfDay(sortedAttempts[0].timestamp);

        if (differenceInDays(today, previousDate) === 0) {
          currentStreak = 1;
        } else if (differenceInDays(today, previousDate) === 1) {
          currentStreak = 1;
        }

        for (let i = 1; i < sortedAttempts.length; i++) {
          const currentDate = startOfDay(sortedAttempts[i].timestamp);
          const daysDiff = differenceInDays(previousDate, currentDate);

          if (daysDiff === 1) {
            currentStreak++;
            previousDate = currentDate;
          } else if (daysDiff > 1) {
            break;
          }
        }
      }

      return {
        totalAttempts: mcqsAttempts,
        weeklyData,
        categoryData,
        answered,
        totalCorrectAnswers,
        totalWrongAnswers,
        currentStreak,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Failed to fetch user statistics");
    }
  }

  public async getDifficultyStats(userId: string): Promise<DifficultyStats> {
    try {
      const stats = await MCQAttemptModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $unwind: "$answers" },
        {
          $group: {
            _id: null,
            easy: {
              $sum: {
                $cond: [{ $gt: ["$score", 80] }, 1, 0],
              },
            },
            medium: {
              $sum: {
                $cond: [
                  {
                    $and: [{ $lte: ["$score", 80] }, { $gt: ["$score", 50] }],
                  },
                  1,
                  0,
                ],
              },
            },
            hard: {
              $sum: {
                $cond: [{ $lte: ["$score", 50] }, 1, 0],
              },
            },
          },
        },
      ]);

      return stats[0] || { easy: 0, medium: 0, hard: 0 };
    } catch (error) {
      console.error("Error fetching difficulty stats:", error);
      throw new Error("Failed to fetch difficulty statistics");
    }
  }

  public async saveMcqAttempt(attempt: MCQAttempt): Promise<void> {
    try {
      await MCQAttemptModel.create(attempt);
    } catch (error) {
      console.error("Error saving MCQ attempt:", error);
      throw new Error("Failed to save MCQ attempt");
    }
  }
}
