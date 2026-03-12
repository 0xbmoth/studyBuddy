import { useEffect, useState } from "react";
import { MCQs } from "../types/mcq";
import Questions from "../components/topic/Quiz/Elements/questions/Questions";
import UtilityBox from "../components/topic/Quiz/Elements/UtilityBox";
import { answerKind } from "../types/Answer";
import { useLocation, useParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import Theme from "../components/Theme";
import GoBack from "../components/modals/GoBack";
import { axiosInstance } from "../services/auth.service";
import { useApp } from "../context/context";

export default function Quiz() {
    const { id: topicId } = useParams();
    const location = useLocation();
    const { locationQuiz } = location.state || {};
    
    const [mcq, setMcq] = useState<MCQs | null>(locationQuiz || null);
    const [userId, setUserId] = useState<string>("");
    const [, setTopic] = useState<string>("");
    const [, setCategory] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(!locationQuiz);
    const [error, setError] = useState<string>("");
    const [correction, setCorrection] = useState<{ answered: boolean; correct: answerKind }[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: boolean }>({});
    const [canExit, setCanExit] = useState(false);
    const [redirect, setRedirect] = useState("");

    const { state, } = useApp();
    
    useEffect(() => {
        if (mcq?.mcqs) {
            const corrections = mcq.mcqs.map(() => ({
                answered: false,
                correct: "not answered" as answerKind,
            }));

            Object.entries(answers).forEach(([index, answer]) => {
                const idx = parseInt(index, 10);
                if (idx >= 0 && idx < corrections.length) {
                    corrections[idx] = {
                        answered: true,
                        correct: answer ? "correct" : "incorrect",
                    };
                }
            });

            setCorrection(corrections);
        }
    }, [answers, mcq]);

    useEffect(() => {
        if ((mcq && mcq.mcqs && mcq.mcqs.length > 0) || !topicId) return;

        setIsLoading(true);
        setError("");

        const fetchData = async () => {
            try {
                const userResponse = await axiosInstance.get("http://localhost:3000/api/users")

                setUserId(userResponse.data.user._id);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setError(error instanceof Error ? error.message : "Failed to load quiz data");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchMcq = async () => {
            try {
                const mcqResponse = await axiosInstance.get(`http://localhost:3000/api/quiz/${topicId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                    }
                })

                let data = mcqResponse.data;

                setMcq(data.mcq)
                setTopic(data.title);
                setCategory(data.category);
                setIsLoading(false);
            } catch(err) {
                console.log(err)
            }
        }
        let stateMcq = state.mcqs.find(m => m._id === topicId);

        if (stateMcq) {
            setMcq(stateMcq)
            setTopic(stateMcq.title);
            setCategory(stateMcq.category);
            setIsLoading(false);
            fetchData()
            return;
        } else if (topicId) {
            fetchMcq()

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExit = (redirect: string) => {
        setCanExit(true);
        setRedirect(redirect)
    }

    if (isLoading) {
        return <div className="text-center py-8">Loading quiz...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    if (!mcq || !mcq.mcqs || mcq.mcqs.length === 0) {
        return <div className="text-center py-8">No questions available for this quiz.</div>;
    }

    return (
        <div className="dark:bg-[#111111] bg-white min-h-screen overflow-x-hidden overflow-y-hidden">
            <div>
                <nav>
                    <div className="dark:bg-[#1f1f1f] w-full flex items-center justify-between p-6">
                        <div className="flex gap-8">
                            <UtilityBox questions={correction} title={mcq.title} />
                            <h1
                                onClick={() => handleExit("/dashboard")}
                                className="mt-1 text-2xl font-semibold dark:text-white text-zinc-800 font-serif cursor-pointer dark:hover:text-gray-300 hover:text-gray-600 transition-colors"
                            >
                                StudyBuddy
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative top-2">
                                <Theme />
                            </div>
                            <div
                                onClick={() => handleExit("/quiz")}
                                className="hover:bg-red-500 p-2 rounded-lg transition-full duration-300 text-red-500 hover:text-white cursor-pointer"
                            >
                                <LogOut />
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-3xl mx-auto p-6">
                    <Questions correction={correction} mcq={mcq} setMcq={setMcq} userId={userId} answers={answers} setAnswers={setAnswers}/>
                </div>
            </div>

            { canExit && <GoBack del={canExit} setDel={setCanExit} redirect={redirect} /> }
        </div>
    );
}
