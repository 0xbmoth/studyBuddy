import { useState } from "react";
import { X, CheckCircle, Circle } from "lucide-react";
import { MCQ } from "../../types/mcq";

interface EditQuestionProps {
    questionData: MCQ;
    onClose: () => void;
    onSave: (updatedQuestion: MCQ) => Promise<void>;
}

export const EditQuestion = ({ 
    questionData, 
    onClose, 
    onSave 
}: EditQuestionProps) => {
    const [localQuestion, setLocalQuestion] = useState<MCQ>({ ...questionData });

    const handleToggleAnswer = (index: number) => {
        const isCorrect = localQuestion.answers.includes(index);
        setLocalQuestion({
            ...localQuestion,
            answers: isCorrect 
                ? localQuestion.answers.filter(i => i !== index) 
                : [...localQuestion.answers, index]
        });
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...localQuestion.options];
        newOptions[index] = value;
        setLocalQuestion({ ...localQuestion, options: newOptions });
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1f1f1f] w-full max-w-2xl p-6 rounded-2xl shadow-2xl border dark:border-zinc-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Edit Question Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                        <X className="dark:text-white" size={20} />
                    </button>
                </div>

                {/* Label */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-400">Label</label>
                    <input
                        type="text"
                        onChange={(e) => setLocalQuestion({ ...localQuestion, label: e.target.value })}
                        value={localQuestion.label}

                        className="w-full p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                </div>

                {/* Question Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-400">Question Text</label>
                    <textarea
                        value={localQuestion.question}
                        onChange={(e) => setLocalQuestion({ ...localQuestion, question: e.target.value })}
                        className="w-full p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        rows={3}
                    />
                </div>

                {/* Options Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-400">Options (Click icon to mark correct)</label>
                    <div className="space-y-3">
                        {localQuestion.options.map((option, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <button 
                                    onClick={() => handleToggleAnswer(idx)}
                                    className={`transition-colors ${localQuestion.answers.includes(idx) ? 'text-green-500' : 'text-gray-300'}`}
                                >
                                    {localQuestion.answers.includes(idx) ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="flex-1 p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-400">Explanation</label>
                    <textarea
                        value={localQuestion.explanation}
                        onChange={(e) => setLocalQuestion({ ...localQuestion, explanation: e.target.value })}
                        className="w-full p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white italic text-sm"
                        placeholder="Why is this the correct answer?"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-700">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(localQuestion)} 
                        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-pink-500/20"
                    >
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );
};