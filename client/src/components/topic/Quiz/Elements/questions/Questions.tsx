/* eslint-disable react-hooks/exhaustive-deps */
import { useState, FC, useEffect } from "react";
import { AddingOption, EditingOption, EditingQuestion, MCQ, MCQs } from "../../../../../types/mcq";
import { axiosInstance } from "../../../../../services/auth.service";
import { ScoreDisplay } from "./DisplayScore";
import { QuestionOption } from "./QuestionOption";
import { Navigation } from "./Navigation";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, X } from "lucide-react";
import { AddOption } from "../../../../modals/AddOption";
import { EditOption } from "../../../../modals/EditOption";
import DeleteQuestion from "../../../../modals/DeleteQuestion";
import { EditQuestion } from "../../../../modals/EditQuestion";

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
            explanation: string;
            answered?: boolean;
        }[];
        score: number
    };
    setMcq: (m: MCQs | null) => void;
    userId: string;
    answers: Record<number, boolean>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

const Questions: FC<QuestionsProps> = ({ mcq, setMcq, userId, answers, setAnswers }) => {
    const [showScore, setShowScore] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number[]>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [, setAnswered] = useState<number>(0);
    const [editingOption, setEditingOption] = useState<EditingOption | null>(null);
    const [addingOption, setAddingOption] = useState<AddingOption | null>(null);
    const [, setSavingQuestion] = useState<boolean>(false);
    const [canMove, setCanMove] = useState(true)
    
    const [deleteQuestion, setDeleteQuestion] = useState(false)
    const [shouldDelete, setShouldDelete] = useState(false)

    const [shouldEdit, setShouldEdit] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null);

    const [submitted, setSubmitted] = useState(false);
    const [explanation, setExplanation] = useState("")

    const isSample = useLocation().pathname === '/quiz-sample';

    const navigate = useNavigate();
    const location = useLocation();

    const handleOptionClick = (index: number): void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        const selectedForThisQuestion = selectedOptions[currentQuestion.id as string] || [];
        const isSelected = selectedForThisQuestion.includes(index);

        setSelectedOptions(prev => ({
            ...prev,
            [currentQuestion.id as string]: isSelected
                ? selectedForThisQuestion.filter(i => i !== index)
                : [...selectedForThisQuestion, index]
        }));
    };

    const handleEditOption = (index: number): void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        setEditingOption({
            index,
            text: currentQuestion.options[index],
            isCorrect: currentQuestion.answers.includes(index)
        });

        if (!location.pathname.includes("sample-quiz")) saveChanges();
    };

    const handleSaveOption = async () => {
        setCanMove(true);
        
        if (!editingOption) return;

        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        const { index, text, isCorrect } = editingOption;

        currentQuestion.options[index] = text;
        currentQuestion.answers = isCorrect 
            ? [...new Set([...currentQuestion.answers, index])]
            : currentQuestion.answers.filter(i => i !== index);

        setEditingOption(null);

        if (!location.pathname.includes("sample-quiz")) saveChanges();
    };

    useEffect(() => {
        if (!location.pathname.includes("sample-quiz") && (shouldDelete || shouldEdit)) {
            saveChanges();
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

        const deletedQuestionId = mcq.mcqs[currentQuestionIndex].id;
        
        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        });

        setSelectedOptions(prev => {
            const newSelectedOptions = {...prev};
            delete newSelectedOptions[deletedQuestionId];
            return newSelectedOptions;
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

    const handleEditQuestion = async (question: string) => {
        setShouldEdit(true);

        const toEdit = mcq.mcqs[currentQuestionIndex]

        if (!toEdit) return;

        toEdit.question = question;
        
        const updatedMcqs = [
            ...mcq.mcqs.slice(0, currentQuestionIndex),
            toEdit,
            ...mcq.mcqs.slice(currentQuestionIndex + 1)
        ]

        setMcq({
            ...mcq,
            mcqs: updatedMcqs
        })

        setEditingQuestion(null);

        setCanMove(true);
    }

    const handleEditQuestionClick = (): void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        setEditingQuestion({
            index: currentQuestionIndex,
            text: currentQuestion.question
        })
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

        const selectedForThisQuestion = selectedOptions[currentQuestion.id as string] || [];
        setSelectedOptions(prev => ({
            ...prev,
            [currentQuestion.id as string]: selectedForThisQuestion
                .filter(i => i !== index)
                .map(i => i > index ? i - 1 : i)
        }));

        if (!location.pathname.includes("sample-quiz")) saveChanges();
    };

    const saveChanges = async () => {
        const token = localStorage.getItem("accessToken");

        try {
            await axiosInstance.put(`http://localhost:3000/api/quiz/${mcq._id}`, 
            {
                title: mcq.title,
                category: mcq.category,
                mcqs: mcq.mcqs,
                score: score
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

    const toggleExplanation = async () => {
        setExplanation(mcq.explanation)
    }

    const handleSubmit = () : void => {
        const currentQuestion = mcq.mcqs[currentQuestionIndex];
        const selectedForThisQuestion = selectedOptions[currentQuestion.id as string] || [];
        const isCorrect = selectedForThisQuestion.sort().toString() === currentQuestion.answers.sort().toString();

        setIsSubmitted(true);
        setAnswered(prev => prev + 1);
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: isCorrect
        }));

        if (isCorrect) setScore(prev => prev + 1);

        console.log(isCorrect, score)
        setSubmitted(true);

        currentQuestion.answered = true;
    };

    const handleNext = (): void => {
        setSubmitted(false);

        if (currentQuestionIndex < mcq.mcqs.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsSubmitted(false);
            setSelectedOptions({});
        }
    };

    const handlePrevious = (): void => {
        setSubmitted(false);

        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setIsSubmitted(false);
        }
    };

    const handleStartOver = (): void => {
        setSelectedOptions({});
        setIsSubmitted(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowScore(false);
        setAnswers({});
    };

    const isCorrectAnswer = (index: number): boolean => {
        return mcq.mcqs[currentQuestionIndex].answers.includes(index);
    };

    const handleShowScore = (): void => {
        setShowScore(true);
    };

    const handleSaveAttempt = async (): Promise<void> => {
        const mcqAttempt = {
            mcqAttempts: {
                userId,
                mcqSetId: mcq._id,
                title: mcq.title,
                numberOfQuestions: mcq.mcqs.length,
                score,
                answers,
                timestamp: new Date(),
            },
        };

        try {
            await axiosInstance.post("/attempt/mcq", mcqAttempt);
            await saveChanges()
            navigate("/quiz", { replace: true })
        } catch (error) {
            console.error("Failed to save attempt:", error);
        }
    };

    const handleSaveQuestion = async (): Promise<void> => {
        setSavingQuestion(true);
        try {
            await axiosInstance.post("/quiz", {
                title: mcq.title,
                category: mcq.category,
                mcqs: mcq.mcqs,
                explanation: mcq.explanation,
                score: mcq.score
            });
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
                score={score}
                totalQuestions={mcq.mcqs.length}
                onSaveAttempt={handleSaveAttempt}
                onStartOver={handleStartOver}
            />
        );
    }

    return (
        <div className={`${answers[currentQuestionIndex] != undefined ? answers[currentQuestionIndex] ? "border-t-8 border-t-green-600 dark:border-t-green-600" : "border-t-8 border-t-red-600 dark:border-t-red-600" : ""} max-w-4xl mx-auto p-6 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-lg border border-gray-300 dark:border-transparent`}>
            {editingOption && (
                <EditOption
                    editingOption={editingOption}
                    onClose={() => {setCanMove(true); setEditingOption(null)}}
                    onSave={handleSaveOption}
                    setEditingOption={setEditingOption}
                />
            )}

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
                    editingQuestion={editingQuestion}
                    setEditingQuestion={setEditingQuestion}
                    onSave={handleEditQuestion}
                    onClose={() => { setCanMove(true); setEditingQuestion(null) }}
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

            <div className="mb-6 flex justify-between">
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{mcq.mcqs[currentQuestionIndex].question}</p>
                <Edit 
                    onClick={() => { setCanMove(false); handleEditQuestionClick() }}
                    className="dark:text-gray-300 mt-1 cursor-pointer hover:text-gray-500" />
            </div>
            
            <div className="space-y-4 mb-6">
                {mcq.mcqs[currentQuestionIndex].options.map((option, index) => (
                    <QuestionOption
                        key={index}
                        option={option}
                        index={index}
                        isSubmitted={isSubmitted || mcq.mcqs[currentQuestionIndex].answered as boolean}
                        isCorrectAnswer={isCorrectAnswer(index)}
                        isSelected={selectedOptions[mcq.mcqs[currentQuestionIndex].id]?.includes(index)}
                        onOptionClick={() => handleOptionClick(index)}
                        onEditClick={() => {setCanMove(false); handleEditOption(index)}}
                        onDeleteClick={(e) => handleDeleteOption(index, e)}
                    />
                ))}
                
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
                disabled={!selectedOptions[mcq.mcqs[currentQuestionIndex].id]?.length || isSubmitted || answers[currentQuestionIndex] !== undefined}
                className="mt-4 bg-blue-500 py-3 px-6 rounded-lg w-full text-lg text-white disabled:bg-gray-300 disabled:dark:bg-zinc-500 disabled:cursor-not-allowed hover:bg-blue-600 transition-all"
            >
                Submit
            </button>

            {
                mcq.mcqs[currentQuestionIndex].answered &&
                <div className="p-4">
                    <p className="dark:text-white text-zinc-700">
                        {mcq.mcqs[currentQuestionIndex].explanation}
                    </p>
                </div>
            }

            <Navigation
                currentIndex={currentQuestionIndex}
                totalQuestions={mcq.mcqs.length}
                isSubmitted={isSubmitted}
                isSample={isSample}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onShowScore={handleShowScore}
                onSaveQuiz={handleSaveQuestion}
                canMove={canMove}
            />
        </div>
    );
};

export default Questions;