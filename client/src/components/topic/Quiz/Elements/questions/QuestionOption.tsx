import { faTrashCan, faCheckCircle, faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, MouseEvent } from 'react';

interface QuestionOptionProps {
    option: string;
    index: number;
    isSubmitted: boolean;
    isCorrectAnswer: boolean;
    isSelected: boolean;
    onOptionClick: () => void;
    onDeleteClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const QuestionOption: FC<QuestionOptionProps> = ({
    option,
    isSubmitted,
    isCorrectAnswer,
    isSelected,
    onOptionClick,
    onDeleteClick
}) => {
    // Determine the status string for screen readers
    const getStatusText = () => {
        if (!isSubmitted) return isSelected ? "Selected" : "Not selected";
        if (isCorrectAnswer) return isSelected ? "Correctly selected" : "Correct answer (not selected)";
        return isSelected ? "Incorrectly selected" : "Incorrect answer";
    };

    // Helper to keep the JSX clean - handles your specific color logic
    const getContainerStyles = () => {
        if (!isSubmitted) {
            return isSelected
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-1 ring-pink-500"
                : "border-gray-300 dark:border-zinc-700 hover:border-gray-500 cursor-pointer";
        }

        // AFTER SUBMISSION LOGIC:
        if (isCorrectAnswer) {
            // Always show the correct answer as Green
            return "border-green-500 dark:border-green-300 bg-green-50 dark:bg-green-900/10";
        }

        if (isSelected && !isCorrectAnswer) {
            // If user picked it but it's wrong, show Red
            return "border-red-500 dark:border-red-300 bg-red-50 dark:bg-red-900/10";
        }

        // Otherwise, dim the non-relevant options
        return "border-gray-200 dark:border-zinc-800 opacity-60";
    };

    const getTextColorStyles = () => {
        if (!isSubmitted) {
            return isSelected 
                ? "text-pink-700 dark:text-pink-300 font-medium" 
                : "text-gray-800 dark:text-gray-300";
        }

        if (isCorrectAnswer) {
            return "text-green-700 dark:text-green-400 font-medium";
        }

        if (isSelected && !isCorrectAnswer) {
            return "text-red-700 dark:text-red-400 font-medium";
        }

        return "text-gray-500";
    };

    return (
        <div
            role="checkbox"
            aria-checked={isSelected}
            aria-disabled={isSubmitted}
            tabIndex={isSubmitted ? -1 : 0}
            onClick={!isSubmitted ? onOptionClick : undefined}
            onKeyDown={(e) => e.key === ' ' && !isSubmitted && onOptionClick()}
            className={`group justify-between dark:bg-[#2b2a2a] flex items-center p-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-pink-400 ${getContainerStyles()}`}
        >
            <div className="flex items-center gap-3">
                {/* Visual icons for status */}
                {isSubmitted && (
                    <FontAwesomeIcon 
                        icon={isCorrectAnswer ? faCheckCircle : isSelected ? faTimesCircle : faCircle} 
                        className={isCorrectAnswer ? "text-green-500" : isSelected ? "text-red-500" : "text-gray-400 opacity-40"}
                    />
                )}

                <div className="flex flex-col">
                    <span className={`text-lg transition-all ${getTextColorStyles()}`}>
                        {option}
                    </span>
                    
                    {/* Visually hidden text for screen readers */}
                    <span className="sr-only">
                        {getStatusText()}
                    </span>
                </div>
            </div>

            <div className="flex gap-2">
                {!isSubmitted && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteClick(e); }} 
                        type="button"
                        aria-label={`Delete option: ${option}`}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                )}
                
                {/* Badge for "Your Choice" to make incorrect selections obvious */}
                {isSubmitted && isSelected && !isCorrectAnswer && (
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                        Your Choice
                    </span>
                )}
            </div>
        </div>
    );
};