import { MCQ } from "../../../types/mcq";
import { useReducer, useState } from "react";
import { initialState, reducer } from "../../../reducer/store";
import { axiosInstance } from "../../../services/auth.service";

interface SaveProps {
    mcqs: MCQ[];
    title: string,
    category: string,
}

export default function SaveQuiz({title, category, mcqs}: SaveProps) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [, dispatch] = useReducer(reducer, initialState)

    const save = async () => {
        setLoading(true)

        try {
            await axiosInstance.post(
                `http://localhost:3000/api/quiz`, 
                {
                    title,
                    category,
                    mcqs
                });
            setSaved(true);
            dispatch({type: "ADD_MCQS", payload: {title, category, mcqs}})
        } catch (error: any) {
            setLoading(false)
            if (error.response) {
                setError(true)
                console.error('Error:', error.response.data.message || 'An error occurred');
            } else {
                setError(true)
                console.error('Error:', (error as Error).message || 'An error occurred');
            }
        }
    };
    return (
        <div className="flex justify-end">
            <button onClick={save} className={`hover:bg-[#333 transition py-3 px-8 rounded-lg text-white bg-[#2D2D2D] w-fit ${loading ? "cursor-not-allowed bg-gray-500" : saved? "cursor-not-allowed bg-green-500" : error ? "cursor-not-allowed bg-red-500" : ""}`}>
                {loading ? "Saving..." : error ? "Error" : saved ? "Saved" : "Save"}
            </button>
        </div>
    )
}
