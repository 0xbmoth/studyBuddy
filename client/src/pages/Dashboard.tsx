import { useEffect, useState } from "react";
import Navbar from "../components/dashboard/Navbar";
import Sidebar from "../components/dashboard/Sidebar";
import { BarChart, PieChart, LineChart, TrendingUp } from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { MCQs } from "../types/mcq";
import { axiosInstance } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { Stat } from "../types/Attempts";
import { Flashcards } from "../types/flashcard";
import { CategoryStat, WeeklyData, WeeklyGraphData } from "../types/Analytics";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [decksCount, setDecksCount] = useState<number>(0);
  const [, setAnsweredQuestionsCount] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [streakMessage, setStreakMessage] = useState<string>("");
  const [flashcardsCreated, setFlashcardsCreated] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    axiosInstance.get(`/quiz`)
      .then((response) => { 
        const count = response.data.mcq.reduce((acc: number, mcq: MCQs) => mcq.mcqs.length + acc, 0);
        setQuestionsCount(count);
        setDecksCount(response.data.mcq.length);
    })
      .catch((error) => { console.error(error); });

    axiosInstance.get(`/flashcard`)
      .then((response) => { 
        const length = response.data.flashcard.reduce((acc: number, flashcard: Flashcards) => flashcard.flashcards.length + acc, 0);
        setFlashcardsCreated(length);
    })
      .catch((error) => { console.error(error); });
  }, []);

  useEffect(() => {
    const refreshToken = JSON.stringify(localStorage.getItem('refreshToken'));
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    const userId = jwtDecode(refreshToken).id;
    axiosInstance.get(`/attempt/user/${userId}`)
      .then((response) => {
        const { 
          weeklyData,
          categoryData,
          answered,
          totalCorrectAnswers,
          totalWrongAnswers,
          currentStreak,
        } = response.data;
        
        if (questionsCount && questionsCount > 0) {
          const averageScore = response.data.categoryData.reduce((acc: number, stat: Stat) => acc + (stat.avgScore * stat.attempts), 0) / response.data.categoryData.reduce((acc: number, stat: Stat) => acc + stat.attempts, 0);
          setAverageScore(parseFloat(averageScore.toFixed(2)));
        }
        
        setAnsweredQuestionsCount(answered);
        setCorrectAnswersCount(totalCorrectAnswers);
        setIncorrectAnswersCount(totalWrongAnswers);
        setCurrentStreak(currentStreak);

        const processedWeeklyData = weeklyData.map((data: WeeklyData) => ({
          ...data,
          timestamp: new Date(data.timestamp).toLocaleDateString(),
        }));
        
        setWeeklyData(processedWeeklyData);
        setCategoryData(categoryData);

        if (categoryData.length > 0) {
          const avgScore = categoryData.reduce(
            (acc: number, stat: CategoryStat) => acc + (stat.avgScore * stat.attempts),
            0
          ) / categoryData.reduce((acc: number, stat: CategoryStat) => acc + stat.attempts, 0);
          setAverageScore(parseFloat(avgScore.toFixed(2)));
        }

        setStreakMessage(currentStreak > 0 ? "Keep it up!" : "Restore your streak!");
        
    }).catch((error) => { console.error(error); });
  }, [currentStreak, questionsCount]);
 
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Sample data
  const stats = {
    totalQuestions: questionsCount,
    questionsAnswered: correctAnswersCount + incorrectAnswersCount || 0,
    correctAnswers: correctAnswersCount || 0,
    incorrectAnswers: incorrectAnswersCount || 0,
    flashcardsCreated: flashcardsCreated || 0,
    averageScore: averageScore == 0 ? averageScore : averageScore.toFixed(2),
    streak: currentStreak
  };

 // Helper to get all weekdays
const getWeekdays = () => {
  const weekdays = [];
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'short' };

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    weekdays.push(day.toLocaleDateString('en-US', options));
  }
  return weekdays;
};

// Step 1: Aggregate weekly data using reduce
const aggregatedData = weeklyData.reduce((acc: WeeklyGraphData[], data) => {
  const dayName = new Date(data.timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
  });

  // Check if the day already exists in the accumulator
  const existingDay = acc.find((item) => item.name === dayName);

  if (existingDay) {
    // Accumulate the values
    existingDay.questionsAttempted += data.questionsAttempted;
    existingDay.correctAnswers += data.correctAnswers;
  } else {
    // Add a new entry for the day
    acc.push({
      name: dayName,
      questionsAttempted: data.questionsAttempted,
      correctAnswers: data.correctAnswers,
    });
  }

  return acc;
}, []);

// Step 2: Ensure all days of the week are represented
const allWeekdays = getWeekdays();

const formattedWeeklyData = allWeekdays.map((day) => {
  const existingDay = aggregatedData.find((data) => data.name === day);

  return existingDay
    ? existingDay
    : { name: day, questionsAttempted: 0, correctAnswers: 0 }; // Default values for missing days
});

  // Transform category data for the pie chart
  const formattedCategoryData = categoryData.map(category => ({
    name: category.name,
    value: parseFloat(category.avgScore.toFixed(2)),
  }));

  return (
    <div className="dark:bg-[#111111] bg-white min-h-screen">
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex h-screen pt-16">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <main 
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-[#111111] transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="container mx-auto px-6 py-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium dark:text-gray-100">Total Questions</h3>
                  <BarChart className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold dark:text-gray-100">{stats.totalQuestions}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{decksCount} decks created</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.questionsAnswered} {stats.questionsAnswered === 1 ? 'question' : 'questions'} answered</p>
              </div>

              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium dark:text-gray-100">Average Score</h3>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold dark:text-gray-100">{stats.averageScore}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.correctAnswers} {stats.correctAnswers === 1 ? 'correct answer' : 'correct answers'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.incorrectAnswers} {stats.incorrectAnswers === 1 ? 'incorrect answer' : 'incorrect answers'}</p>
              </div>

              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium dark:text-gray-100">Current Streak</h3>
                  <LineChart className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold dark:text-gray-100">{stats.streak} days</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{streakMessage}</p>
              </div>

              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium dark:text-gray-100">Flashcards Created</h3>
                  <PieChart className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold dark:text-gray-100">{stats.flashcardsCreated}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{flashcardsCreated} flashcards created</p>
              </div>
            </div>
            
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={formattedWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="questionsAttempted" stroke="#0088FE" />
                    <Line type="monotone" dataKey="correctAnswers" stroke="#00C49F" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              <div className="dark:bg-zinc-800 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  {
                    categoryData.length === 0 ? <div className="dark:text-white flex items-center justify-center h-full">No data available</div>
                    :
                    <RechartsPieChart>
                    <Pie data={formattedCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {formattedCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${name}: ${value}%`]}
                      labelFormatter={(name: string) => `Category: ${name}`}
                    />
                  </RechartsPieChart>}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}