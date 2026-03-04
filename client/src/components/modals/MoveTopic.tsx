import { useState } from "react";
import { Modal } from "@mui/material";
import { axiosInstance } from "../../services/auth.service";
import { toast } from "react-toastify";
import { useApp } from "../../context/context"; // Import your context hook

interface MoveTopicProps {
  move: boolean;
  setMove: (e: boolean) => void;
  topicId: string;
}

export default function MoveTopic({ move, topicId, setMove }: MoveTopicProps) {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [updating, setUpdating] = useState(false)

  // Get unique categories from existing MCQs
  const existingCategories = Array.from(
    new Set(state.mcqs.map((m: any) => m.category).filter(Boolean))
  );

  const handleMove = async () => {
    const categoryToSend = isCreatingNew ? newCategoryName : selectedCategory;

    if (!categoryToSend) {
      toast.error("Please select or enter a category");
      return;
    }

    try {
        setUpdating(true);

        await axiosInstance.put(`/quiz/category/${topicId}`, {
            category: categoryToSend,
        });

        dispatch({ type: "UPDATE_MCQ_CATEGORY", payload: { id: topicId, category: categoryToSend } });
      
        toast.success("Category updated successfully!");
        setUpdating(false);
        setMove(false);
        resetForm();
    } catch (err: any) {
        setUpdating(false);
        toast.error(`${err}.`);
    }
  };

  const resetForm = () => {
    setIsCreatingNew(false);
    setSelectedCategory("");
    setNewCategoryName("");
  };

  return (
    <Modal open={move} onClose={() => setMove(false)}>
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex flex-col w-full max-w-md gap-4 p-6 rounded-md shadow-md bg-white dark:bg-[#1a1a1a] dark:text-gray-100">
          <h2 className="text-xl font-semibold text-center">Move to Category</h2>
          
          <div className="space-y-4">
            {!isCreatingNew ? (
                <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Existing Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border rounded-md bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    <option value="">-- Choose a category --</option>
                    {existingCategories.map((cat: any) => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button 
                    onClick={() => setIsCreatingNew(true)}
                    className="text-xs text-pink-500 hover:text-pink-400 text-left font-semibold"
                >
                    + Create a new category instead
                </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">New Category Name</label>
                <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="p-2 border rounded-md bg-white text-gray-900 dark:bg-[#2a2a2a] dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-pink-500 outline-none"
                    autoFocus
                />
                <button 
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline text-left"
                >
                    ← Back to existing categories
                </button>
                </div>
            )}
            </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setMove(false)} className="px-4 py-2 text-sm hover:bg-gray-200 hover:dark:bg-zinc-700 rounded transition-all">
              Cancel
            </button>
            <button 
              onClick={handleMove}
              disabled={updating}
              className={`${updating ? "bg=gray-400 dark:bg-gray-700" : "bg-pink-100 dark:bg-pink-900 dark:text-white"} px-6 py-2 text-sm font-medium rounded-md dark:hover:bg-pink-700 hover:bg-pink-200 transition`}
            >
              {updating ? "Updating..." : "Update Category"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}