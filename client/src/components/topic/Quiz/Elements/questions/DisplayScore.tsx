import { FC } from 'react';

interface ScoreDisplayProps {
    score: number;
    totalQuestions: number;
    onSaveAttempt: () => void;
    savingAttempt: boolean;
    onStartOver: () => void;
}

export const ScoreDisplay: FC<ScoreDisplayProps> = ({
    score,
    totalQuestions,
    onSaveAttempt,
    savingAttempt,
    onStartOver
}) => {

    return (
        <div className="mt-6 text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-white">
                Your score: {score}/{totalQuestions}
            </div>
            <div className="mt-6">
                <button
                    disabled={savingAttempt}
                    onClick={onSaveAttempt}
                    className={`${savingAttempt ? "bg-gray-500" : "bg-green-500"} cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all`}
                >
                    {savingAttempt ? "Saving Attempt" : "Save Attempt"}
                </button>
                <button
                    onClick={onStartOver}
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all ml-2"
                >
                    Start Over
                </button>
            </div>
        </div>
    );
};