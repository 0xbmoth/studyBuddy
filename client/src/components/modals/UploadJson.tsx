import { Modal } from "@mui/material";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "../../types/flashcard";
import { MCQ, MCQs } from "../../types/mcq";
import { QuestionsUpload, transformQuestions } from "../../types/Uploads";

interface UploadProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  setCategory: (e: string) => void;
  setTitle: (e: string) => void;
  setQuiz: Dispatch<SetStateAction<MCQ[] | undefined>>
//   setFlashcard?: (f: Flashcard[]) => void;
  quiz: MCQ[] | Flashcard[] | undefined;
  type: string;
}

export default function UploadJson({
  isOpen,
  setIsOpen,
  setCategory,
  setTitle,
  setQuiz,
//   setFlashcard,
  type,
}: UploadProps) {
  const [form, setForm] = useState({
    topicName: "",
    numberOfQuestions: "",
    category: "",
  });

  const [extractedText, setExtractedText] = useState<QuestionsUpload>();
  const [, setFormat] = useState("JSON")

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  async function handleJson(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files![0];
    
    if (!selectedFile) {
        console.error('No file selected');
        return;
    }

    try {
        const fileContents = await readFileAsText(selectedFile);
        
        const jsonData: QuestionsUpload = JSON.parse(fileContents);
        console.log(jsonData)

        setExtractedText(jsonData)
        
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
    }
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error('File reading failed'));
            }
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsText(file);
    });
  }

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setCategory(form.category); 
    setTitle(form.topicName);
  
    const mcqs = transformQuestions(extractedText?.questions || []);
    
    setQuiz(mcqs);

    const formattedData: MCQs = {
        mcqs: mcqs,
        title: form.topicName,
        category: form.category,
      };

    navigate('/quiz-sample', { state: { locationQuiz: formattedData } })
  };
  

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)} aria-labelledby="modal-title" aria-describedby="modal-description">
      <div className="dark:text-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center space-y-6 lg:space-y-0 lg:space-x-8">
            {isOpen && (
              <div className="w-full lg:w-2/3">
                <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-[#1F1F1F] p-4 rounded-lg">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-lg dark:text-white">Topic Name:</label>
                      <input
                        type="text"
                        name="topicName"
                        value={form.topicName}
                        onChange={handleInputChange}
                        className="mt-1 p-2 w-full rounded-lg dark:bg-[#474646]"
                        placeholder="Enter topic name"
                      />
                    </div>

                    <div>
                      <label className="block text-lg dark:text-white">Category:</label>
                      <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        className="mt-1 p-2 w-full rounded-lg dark:bg-[#474646]"
                        placeholder="Enter category"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="text-lg dark:text-white">Choose a format</label>
                          <select onChange={(e) => setFormat(e.target.value)} name="format" id="format" className="mt-1 p-2 w-full h-10 rounded-lg dark:bg-[#474646]">
                              <option value="pdf">JSON</option>
                              <option value="text">Text</option>
                          </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-lg dark:text-white">Upload JSON:</label>
                            <input
                                type="file"
                                name="json"
                                accept=".json,application/json"
                                id="json"
                                onChange={handleJson}
                                className="mt-1 p-2 w-full rounded-lg dark:bg-[#474646]"
                            />
                        </div>
                      
                    </div>
                    
                    <div className="flex gap-8">
                      <button className="dark:text-black bg-gray-200 mt-4 p-2 flex-1 rounded-lg hover:bg-gray-300 transition" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 mt-4 p-2 border-zinc-500 hover:bg-zinc-900 duration-300 border-2 rounded-lg"
                      >
                        {`Upload ${type === "quiz" ? "Quiz" : "Flashcards"}`}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
