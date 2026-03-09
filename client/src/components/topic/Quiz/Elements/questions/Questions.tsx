/* eslint-disable react-hooks/exhaustive-deps */
import { useState, FC, useEffect, useRef } from "react";
import { AddingOption, MCQ, MCQs } from "../../../../../types/mcq";
import { axiosInstance } from "../../../../../services/auth.service";
import { ScoreDisplay } from "./DisplayScore";
import { QuestionOption } from "./QuestionOption";
import { Navigation } from "./Navigation";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, X } from "lucide-react";
import { AddOption } from "../../../../modals/AddOption";
import DeleteQuestion from "../../../../modals/DeleteQuestion";
import { EditQuestion } from "../../../../modals/EditQuestion";
import { useApp } from "../../../../../context/context";
import { toast } from "react-toastify";
import { answerKind } from "../../../../../types/Answer";

interface QuestionsProps {
    mcq: {
        explanation: any;
        _id?: string;
        title: string;
        category: string;
        mcqs: {
            id: string;
            question: string;
            options: string[];
            answers: number[];
            selected?: number[];
            explanation: string;
            answered?: boolean;
            label?: string
        }[];
        correct: number
    };
    setMcq: (m: MCQs | null) => void;
    userId: string;
    answers: Record<number, boolean>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    correction: {
        answered: boolean;
        correct: answerKind;
    }[],
}

const Questions: FC<QuestionsProps> = ({ mcq, setMcq, userId, answers, setAnswers, correction }) => {
    const [showScore, setShowScore] = useState<boolean>(false);
    const score = useRef<number>(0);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const currentQuestionIndexRef = useRef(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(currentQuestionIndexRef.current);
    
    const [addingOption, setAddingOption] = useState<AddingOption | null>(null);
    const [savingQuestion, setSavingQuestion] = useState<boolean>(false);
    const [canMove, setCanMove] = useState(true);
    const savingAttempt = useRef(false);

    const { dispatch } = useApp();
    
    const [deleteQuestion, setDeleteQuestion] = useState(false)
    const [shouldDelete, setShouldDelete] = useState(false)

    const [shouldEdit, setShouldEdit] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(false);

    const isSample = useLocation().pathname === '/quiz-sample';

    const navigate = useNavigate();
    const location = useLocation();

    const handleOptionClick = (index: number): void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        if (currentQuestion.answered) return;

        const currentSelections = currentQuestion.selected || [];
        
        const newSelection = currentSelections.includes(index)
            ? currentSelections.filter(i => i !== index)
            : [...currentSelections, index];

        const updatedMcqs = [...mcq.mcqs];
        updatedMcqs[currentQuestionIndex] = {
            ...currentQuestion,
            selected: newSelection
        };

        setMcq({ ...mcq, mcqs: updatedMcqs });
    };

    useEffect(() => {
        // 1. Ensure 'selected' array exists for all questions
        const updatedMcqs = mcq.mcqs.map(q => ({
            ...q,
            selected: q.selected || []
        }));

        // 2. Update the parent state
        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        });

        // 3. Populate the local state with existing selections
        const initialSelections: Record<string, number[]> = {};
        updatedMcqs.forEach(q => {
            if (q.selected && q.selected.length > 0) {
                initialSelections[q.id] = q.selected;
            }
        });

        // 4. Sync the isSubmitted status for the first question
        if (updatedMcqs[0]?.answered) {
            setIsSubmitted(true);
        }
    }, []);

    useEffect(() => {
        if (!location.pathname.includes("sample-quiz") && (shouldDelete || shouldEdit)) {
            saveChanges(score.current);
            setShouldDelete(false);
            setShouldEdit(false);
        }
    }, [mcq, shouldDelete])

    const handleDeleteQuestion = async () => {
        setShouldDelete(true)

        const updatedMcqs: MCQ[] = [
            ...mcq.mcqs.slice(0, currentQuestionIndex),
            ...mcq.mcqs.slice(currentQuestionIndex + 1)
        ];
        
        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        });

        setAnswers(prev => {
            const newAnswers = {...prev};
            delete newAnswers[currentQuestionIndex];

            return Object.fromEntries(
                Object.entries(newAnswers)
                    .map(([key, value]) => {
                        const numKey = Number(key);
                        return [numKey > currentQuestionIndex ? numKey - 1 : numKey, value];
                    })
            );
        });    

        setDeleteQuestion(false);
        setIsSubmitted(false);

        if (currentQuestionIndex >= updatedMcqs.length && updatedMcqs.length > 0) {
            setCurrentQuestionIndex(updatedMcqs.length - 1);
        } else if (updatedMcqs.length === 0) {
            setCurrentQuestionIndex(0);
        }

        setCanMove(true);
    }

    const handleEditQuestion = async (updatedQuestion: MCQ) => {
        setShouldEdit(true);
        
        const updatedMcqs = [
            ...mcq.mcqs.slice(0, currentQuestionIndex),
            updatedQuestion,
            ...mcq.mcqs.slice(currentQuestionIndex + 1)
        ]

        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        })

        setEditingQuestion(false);
        setCanMove(true);
    }

    const handleEditQuestionClick = (): void => {
        setEditingQuestion(true)
    }

    const handleAddOptionClick = (): void => {
        setCanMove(false);
        setAddingOption({ text: "", isCorrect: false });
    };

    const handleSaveNewOption = async () => {
        if (!addingOption) return;
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        const newIndex = currentQuestion.options.length;
        
        currentQuestion.options.push(addingOption.text);
        if (addingOption.isCorrect) {
            currentQuestion.answers.push(newIndex);
        }
        
        setAddingOption(null);

        setCanMove(true)
    };

    const handleDeleteOption = (index: number, e: React.MouseEvent): void => {
        e.stopPropagation();
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        
        currentQuestion.options = currentQuestion.options.filter((_, i) => i !== index);
        currentQuestion.answers = currentQuestion.answers = currentQuestion.answers
            .filter(answerIndex => answerIndex !== index)
            .map(answerIndex => answerIndex > index ? answerIndex - 1 : answerIndex);

        if (!location.pathname.includes("sample-quiz")) saveChanges(correction.filter(x => x.correct === "correct").length);
    };

    const saveChanges = async (currentScore: number) => {
        const token = localStorage.getItem("accessToken");

        try {
            await axiosInstance.put(`http://localhost:3000/api/quiz/${mcq._id}`, 
            {
                title: mcq.title,
                category: mcq.category,
                mcqs: mcq.mcqs,
                score: currentScore
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch(err) {
            console.log(err)
        }
    }
    
    const handleSubmit = (): void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        
        const selectedForThisQuestion = currentQuestion.selected || [];
        const correctAnswers = currentQuestion.answers;

        const isCorrect = 
            selectedForThisQuestion.length === correctAnswers.length &&
            selectedForThisQuestion.every(val => correctAnswers.includes(val));

        setIsSubmitted(true);
        
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: isCorrect
        }));

        if (isCorrect) {
            score.current += 1;
        }

        const updatedMcqs = [...mcq.mcqs];
        updatedMcqs[currentQuestionIndex] = {
            ...currentQuestion,
            answered: true
        };

        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        });
    };

    const handleNext = (): void => {
        if (currentQuestionIndex < mcq.mcqs.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setIsSubmitted(!!mcq.mcqs[nextIndex].answered);
        }
    };

    const handlePrevious = (): void => {
        if (currentQuestionIndex > 0) {
            const prevIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIndex);
            setIsSubmitted(!!mcq.mcqs[prevIndex].answered);
        }
    };

    const handleStartOver = (): void => {
        setIsSubmitted(false);
        setCurrentQuestionIndex(0);
        score.current = 0;
        setShowScore(false);
        setAnswers({});
        
        mcq.mcqs.map(m => m.selected = []);
        mcq.mcqs.map(m => m.answered = false)
    };

    const isCorrectAnswer = (index: number): boolean => {
        return mcq.mcqs[currentQuestionIndex].answers.includes(index);
    };

    const handleShowScore = (): void => {
        const finalScore = correction.filter(x => x.correct === "correct").length;
        score.current = finalScore
        setShowScore(true);
    };

    const handleSaveAttempt = async (): Promise<void> => {
        if (!userId) {
            try {
                const userResponse = await axiosInstance.get("http://localhost:3000/api/users")

                userId = userResponse.data.user._id;
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }

        const finalScore = correction.filter(x => x.correct === "correct").length;

        const mcqAttempt = {
            mcqAttempts: {
                userId,
                mcqSetId: mcq._id,
                title: mcq.title,
                numberOfQuestions: mcq.mcqs.length,
                score: finalScore,
                answers,
                timestamp: new Date(),
            },
        };

        try {
            await axiosInstance.post("/attempt/mcq", mcqAttempt);
            await saveChanges(finalScore)
            dispatch({ type: "SAVE_ATTEMPT", payload: { id: mcq._id as string, score: score.current } })
            navigate("/quiz", { replace: true })
            toast.success("Attempt saved with success!")
        } catch (error: any) {
            toast.error(error)
            throw(error)
        }
    };

    const handleSaveQuestion = async (): Promise<void> => {
        setSavingQuestion(true);
        try {
            const response = await axiosInstance.post("/quiz", {
                title: mcq.title,
                category: mcq.category[0].toLocaleUpperCase() + mcq.category.substring(1),
                mcqs: mcq.mcqs,
                explanation: mcq.explanation,
                score: score.current
            });

            dispatch({type: "ADD_MCQS", payload: {mcq: mcq, id: response.data.id}})

            toast.success("MCQs saved succesfully!")
        } catch (error) {
            console.error("Failed to save quiz:", error);
        } finally {
            setSavingQuestion(false);
            navigate('/quiz', {replace: true})
        }
    };

    if (showScore) {
        return (
            <ScoreDisplay
                score={score.current}
                totalQuestions={mcq.mcqs.length}
                onSaveAttempt={handleSaveAttempt}
                savingAttempt={savingAttempt.current}
                onStartOver={handleStartOver}
            />
        );
    }

    return (
        <div className={`${answers[currentQuestionIndex] != undefined ? answers[currentQuestionIndex] ? "border-t-8 border-t-green-600 dark:border-t-green-600" : "border-t-8 border-t-red-600 dark:border-t-red-600" : ""} max-w-4xl mx-auto p-6 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-300 dark:border-transparent`}>
            {addingOption && (
                <AddOption
                    addingOption={addingOption}
                    setAddingOption={setAddingOption}
                    onClose={() => {setCanMove(true); setAddingOption(null)}}
                    onSave={handleSaveNewOption}
                />
            )}

            {deleteQuestion && (
                <DeleteQuestion 
                    del={deleteQuestion} 
                    setDel={setDeleteQuestion} 
                    n={currentQuestionIndex + 1} 
                    handleDeleteQuestion={handleDeleteQuestion} 
                    setCanMove={setCanMove}
                />
            )}

            {editingQuestion && (
                <EditQuestion 
                    questionData={mcq.mcqs[currentQuestionIndex]}
                    onClose={() => { setCanMove(true); setEditingQuestion(false) }}
                    onSave={handleEditQuestion}
                />
            )}

            <div className="flex justify-between">
                <h3 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
                    Question {currentQuestionIndex + 1} of {mcq.mcqs.length}
                </h3>
                <div
                    onClick={() => { setCanMove(false); setDeleteQuestion(true) }} 
                    className="flex justify-center items-center w-10 h-10 cursor-pointer transition-full duration-300 hover:bg-red-500 hover:text-white rounded-full">
                    <X className="text-2xl dark:text-white" />
                </div>
            </div>

            {/* label */}
            <span className="text-[10px] font-bold uppercase px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                {mcq.mcqs[currentQuestionIndex].label || "No label"}
            </span>

            <div className="mt-2 mb-6 flex justify-between">
                <p 
                    className="text-xl font-semibold text-gray-700 dark:text-gray-300">{mcq.mcqs[currentQuestionIndex].question}</p>
                <Edit 
                    onClick={() => { setCanMove(false); handleEditQuestionClick() }}
                    className="dark:text-gray-300 mt-1 cursor-pointer hover:text-gray-500" />
            </div>
            
            <div className="space-y-4 mb-6">
                {mcq.mcqs[currentQuestionIndex].options.map((option, index) => {
                    const currentQuestion = mcq.mcqs[currentQuestionIndex];
                    
                    return (
                        <QuestionOption
                            key={`${currentQuestion.id}-${index}`}
                            option={option}
                            index={index}
                            isSubmitted={!!currentQuestion.answered}
                            isCorrectAnswer={isCorrectAnswer(index)}
                            isSelected={currentQuestion.selected?.includes(index) || false}
                            onOptionClick={() => handleOptionClick(index)}
                            onDeleteClick={(e) => handleDeleteOption(index, e)}
                        />
                    );
                })}
                <button
                    onClick={handleAddOptionClick}
                    className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-500 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    Add Option
                </button>
            </div>

            <button
                onClick={handleSubmit}
                disabled={
                    // Disable if the 'selected' array is empty or undefined
                    !(mcq.mcqs[currentQuestionIndex].selected?.length) || 
                    // Disable if the question is already marked as answered in the data
                    mcq.mcqs[currentQuestionIndex].answered ||
                    // Disable if the local isSubmitted state is true (backup safety)
                    isSubmitted
                }
                className="mt-4 bg-pink-500 py-3 px-6 rounded-lg w-full text-lg text-white disabled:bg-gray-300 disabled:dark:bg-zinc-500 disabled:cursor-not-allowed hover:bg-pink-600 transition-all"
            >
                Submit
            </button>

            {mcq.mcqs[currentQuestionIndex].answered && (
                <div className="mt-6 p-5 bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-500 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                            Explanation
                        </span>
                    </div>
                    <p className="text-zinc-700 dark:text-gray-200 leading-relaxed text-sm md:text-base">
                        {mcq.mcqs[currentQuestionIndex].explanation}
                    </p>
                </div>
            )}

            <Navigation
                currentIndex={currentQuestionIndex}
                totalQuestions={mcq.mcqs.length}
                isSubmitted={isSubmitted}
                isSample={isSample}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onShowScore={handleShowScore}
                onSaveQuiz={handleSaveQuestion}
                savingQuestion={savingQuestion}
                canMove={canMove}
            />
        </div>
    );
};

export default Questions;