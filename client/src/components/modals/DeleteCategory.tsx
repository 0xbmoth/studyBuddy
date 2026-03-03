import { Modal } from "@mui/material";
import { axiosInstance } from "../../services/auth.service";
import { useApp } from "../../context/context";

interface DeleteCategoryProps {
    del: boolean;
    setDel: (e: boolean) => void,
    category: string,
}

export default function DeleteCategory({del, setDel, category}: DeleteCategoryProps) {
    const { dispatch } = useApp()
    const deleteCategory = () => {
        axiosInstance.delete(`http://localhost:3000/api/quiz/delete-category/${category}`)
            .then(() => {
                setDel(false);

                window.location.reload();
                dispatch({type: "DELETE_MCQS_TOPIC", payload: category})
            })
            .catch((err) => console.log(err))
    }

    return (
        <Modal
            open={del}
            onClose={() => setDel(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col max-w-md gap-2 p-6 rounded-md shadow-md bg-white dark:bg-[#111111] dark:text-gray-100">
                    <h2 className="text-xl font-semibold leading-tight tracking-tight text-center">Delete Category</h2>
                    <p className="flex-1 text-center dark:text-gray-400">Are you sure that you want to delete this category?
                    </p>
                    <div className="flex justify-center gap-3 mt-6 sm:mt-8 sm:flex-row">
                        <button onClick={() => setDel(false)} className="px-6 py-2 rounded-sm">Cancel</button>
                        <button onClick={deleteCategory} className="px-6 py-2 rounded-sm shadow-sm bg-yellow-100 dark:bg-[#1F1F1F] dark:text-white">Confirm</button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
