import { faEdit, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, MouseEvent } from 'react';

interface QuestionOptionProps {
    option: string;
    index: number;
    isSubmitted: boolean;
    isCorrectAnswer: boolean;
    isSelected: boolean;
    onOptionClick: () => void;
    onEditClick: () => void;
    onDeleteClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const QuestionOption: FC<QuestionOptionProps> = ({
    option,
    isSubmitted,
    isCorrectAnswer,
    isSelected,
    onOptionClick,
    onEditClick,
    onDeleteClick
}) => {
    return (
        <div
            onClick={onOptionClick}
            className={`justify-between dark:bg-[#2b2a2a] flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                isSubmitted
                    ? isCorrectAnswer
                        ? "border-green-500 dark:border-green-300 bg-green-50"
                        : "border-red-500 dark:border-red-300 bg-red-50"
                    : isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-500"
            }`}
        >
            <label className={`text-lg transition-all ${
                isSubmitted
                    ? isCorrectAnswer
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    : isSelected
                    ? "text-blue-600"
                    : "text-gray-800 dark:text-gray-300"
            }`}>
                {option}
            </label>
            <div className="flex gap-2">
                <button onClick={onEditClick} type="button">
                    <span className="dark:text-white hover:dark:text-zinc-800 hover:bg-gray-200 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faEdit} />
                    </span>
                </button>
                <button onClick={onDeleteClick} type="button">
                    <span className="hover:bg-gray-200 p-2 rounded-lg text-red-500">
                        <FontAwesomeIcon icon={faTrashCan} />
                    </span>
                </button>
            </div>
        </div>
    );
};
