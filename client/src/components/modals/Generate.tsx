import { Modal } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "../../types/flashcard";
import { MCQ, MCQs } from "../../types/mcq";
import { axiosInstance } from "../../services/auth.service";

interface GenerateProps {
  isOpen: boolean;
  setIsOpen: (e: boolean) => void;
  isGenerateOpen: boolean;
  setCategory: (e: string) => void;
  setTitle: (e: string) => void;
  setLoading: (e: boolean) => void;
  setQuiz?: (f: MCQ[] | Flashcard[]) => void;
  setFlashcard?: (f: Flashcard[]) => void;
  quiz: MCQ[] | Flashcard[] | undefined;
  type: string;
}

export default function Generate({
  isOpen,
  setIsOpen,
  isGenerateOpen,
  setCategory,
  setTitle,
  setLoading,
  setQuiz,
  setFlashcard,
  type,
}: GenerateProps) {
  const [form, setForm] = useState({
    topicName: "",
    numberOfQuestions: "",
    category: "",
  });
  const [language, setLanguage] = useState("french");
  const [format, setFormat] = useState("pdf");
  const [extractedText, setExtractedText] = useState<string | undefined>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files![0];
    const formData = new FormData();
    formData.append("pdf", selectedFile, selectedFile.name);

    try {
      const response = await axiosInstance.post("http://localhost:3000/api/generate/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setExtractedText(response.data.extractedText);
    } catch (error) {
      console.log(error);
    }
  }

  async function generate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setIsGenerating(true);
    setIsGenerated(false);

    setTitle(form.topicName);
    setCategory(form.category);

    const requestData = {
      lesson: extractedText,
      module: form.topicName,
      subject: form.category,
      type,
      language,
      n: form.numberOfQuestions,
    };

    try {
      const response = await axiosInstance.post("http://localhost:3000/api/generate", requestData);
      const parsedData = response.data.aiResponse;

      setLoading(false);
      setIsGenerating(false);
      setIsGenerated(true);
      setIsOpen(false);

      if (type === "quiz" && setQuiz) {
        setQuiz(parsedData.questions);

        const formattedData: MCQs = {
          mcqs: parsedData.questions.map((q: MCQ, index: number) => ({
              id: index + 1,
              question: q.question,
              options: q.options,
              answers: q.answers,
              explanation: q.explanation,
              label: q.label
          })),
          title: form.topicName,
          category: form.category,
        };

      navigate('/quiz-sample', { state: { locationQuiz: formattedData } })
      } else if (type === "flashcard" && setFlashcard) {
        setFlashcard(parsedData.questions);
      }

    } catch (error) {
      setLoading(false);
      setIsGenerating(false);
      setIsGenerated(false);
      console.error("Error generating quiz/flashcards:", error);
    }
  }

  const handleCancel = () => {
    setIsOpen(false);
    setIsGenerated(false);
  };

  useEffect(() => {
    if (isGenerated) {
      setIsOpen(false);
    }
  }, [isGenerated, setIsOpen]);

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)} aria-labelledby="modal-title" aria-describedby="modal-description">
      <div className="dark:text-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center space-y-6 lg:space-y-0 lg:space-x-8">
            {isGenerateOpen && (
              <div className="w-full lg:w-2/3">
                <form onSubmit={generate} className="bg-gray-100 dark:bg-[#1F1F1F] p-4 rounded-lg">
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
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-lg dark:text-white">Number of Questions</label>
                        <input
                          type="number"
                          name="numberOfQuestions"
                          placeholder="Number of Questions"
                          value={form.numberOfQuestions}
                          onChange={handleInputChange}
                          className="mt-1 p-2 w-full h-10 rounded-lg dark:bg-[#474646]"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-lg dark:text-white">Language</label>
                        <select
                          onChange={(e) => setLanguage(e.target.value)}
                          name="language"
                          id="language"
                          className="mt-1 p-2 w-full h-10 rounded-lg dark:text-gray-400 dark:bg-[#474646]"
                        >
                          <option value="french">French</option>
                          <option value="english">English</option>
                        </select>
                      </div>
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
                              <option value="pdf">PDF</option>
                              <option value="text">Text</option>
                          </select>
                      </div>

                      {
                        format == "text"
                        ?
                        <div className="flex-1">
                          <label className="block text-lg dark:text-white">Paste a text:</label>
                          <input
                              type="text"
                              name="text"
                              id="pdf"
                              onChange={(e) => setExtractedText(e.target.value)}
                              className="mt-1 p-2 w-full rounded-lg dark:bg-[#474646]"
                          />
                        </div>
                        :
                        <div className="flex-1">
                          <label className="block text-lg dark:text-white">Upload PDF:</label>
                          <input
                              type="file"
                              name="pdf"
                              accept="application/pdf"
                              id="pdf"
                              onChange={handlePdf}
                              className="mt-1 p-2 w-full rounded-lg dark:bg-[#474646]"
                          />
                        </div>
                      }
                    </div>
                    
                    <div className="flex gap-8">
                      <button className="dark:text-black bg-gray-200 mt-4 p-2 flex-1 rounded-lg hover:bg-gray-300 transition" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 mt-4 p-2 ${
                          isGenerating
                            ? "bg-gray-500 text-white rounded-lg cursor-not-allowed"
                            : isGenerated
                            ? "bg-green-500 text-white rounded-lg cursor-not-allowed"
                            : "bg-blue-500 text-white rounded-lg transition hover:bg-blue-600 dark:bg-[#474646] dark:hover:bg-[#302f2f]"
                        }`}
                        disabled={isGenerating || isGenerated}
                      >
                        {isGenerating
                          ? "Generating..."
                          : isGenerated
                          ? "Generated"
                          : `Generate ${type === "quiz" ? "Quiz" : "Flashcards"}`}
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
