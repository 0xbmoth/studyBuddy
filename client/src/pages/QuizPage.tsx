/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import Topics from "../components/topic/Topics";
import { MCQ, MCQs } from "../types/mcq";
import { axiosInstance } from "../services/auth.service";
import { Upload } from "lucide-react";
import UploadJson from "../components/modals/UploadJson";
import Generate from "../components/modals/Generate";
import { useApp } from "../context/context";

export default function QuizPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<MCQ[]>();
  const [, setTitle] = useState("");
  const [, setCategory] = useState("");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [quizId, ] = useState("")
  const [mcq, setMcq] = useState<MCQs>();
  const { state, dispatch } = useApp();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  useEffect(() => {
    if (state.mcqs.length > 0) {
      const selectMcq = state.mcqs.find((m: MCQs) => m._id === quizId);
      setMcq(selectMcq);

      if (state.mcqsTopics.length == 0) {
        const sortedMcqs = state.mcqs.sort((x: any, y: any) => 
          new Date(y.updatedAt).getTime() - new Date(x.updatedAt).getTime()
        );

        const userTopics = sortedMcqs.map((m: any) => ({
          name: m.title,
          category: m.category,
          numberOfQuestions: m.mcqs?.length || 0,
          id: m._id,
          score: `${m.score || 0}/${m.mcqs?.length || 0}`
        }));

        dispatch({type: 'GET_MCQS_TOPIC', payload: userTopics})
      }
      return;
    }

    axiosInstance.get(`/quiz`)
    .then((response) => {
      const mcqsRaw = response.data.mcq;

      const sortedMcqs = mcqsRaw.sort((x: any, y: any) => 
        new Date(y.updatedAt).getTime() - new Date(x.updatedAt).getTime()
      );

      const userTopics = sortedMcqs.map((m: any) => ({
        name: m.title,
        category: m.category,
        numberOfQuestions: m.mcqs?.length || 0,
        id: m._id,
        score: `${m.score || 0}/${m.mcqs?.length || 0}`
      }));

      dispatch({type: "GET_MCQS", payload: sortedMcqs})
      dispatch({type: 'GET_MCQS_TOPIC', payload: userTopics})
    }).catch((err) => console.log(err))
    
  }, [])

  return (
    <div className="font-mono dark:bg-[#111111] bg-white min-h-screen overflow-x-hidden">

      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex sm:grid transition-all duration-300 ${isSidebarOpen ? "sm:ml-64 ml-0 grid-cols-6" : "ml-0 grid-cols-6"} w-full h-screen text-gray-700`}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} />
      
        <div
          className={`${
            isSidebarOpen ? "sm:col-span-4 col-span-5" : "col-span-6"
          } flex flex-col mt-16 flex-grow p-4 dark:text-white`}
        >

          <h1 className="text-5xl mt-4 ml-4">Quiz</h1>
          <div className="flex justify-between w-full rounded-lg cursor-pointer p-2 mt-2">
            <div 
              className="flex gap-2"
              onClick={() => setIsGenerateOpen(true)}
            >
              <span className="text-2xl bg-pink-100 hover:bg-pink-200 transition px-2 dark:bg-[#3b3939] dark:hover:bg-[#2b2929] rounded-md">
                +
              </span>
              <p className="text-xl">Generate a Quiz:</p>
            </div>
            <div 
              className="flex gap-2"
              onClick={() => setIsUploadOpen(true)}  
            >
              <div className="rounded-lg bg-pink-100 hover:bg-pink-200 transition px-2 dark:bg-[#3b3939] dark:hover:bg-[#2b2929]">
                <Upload className="mt-1" />
              </div>
              <p className="text-xl">Upload your Quiz</p>
            </div>
          </div>

          <p className="text-xl mt-4 ml-4">Your topics:</p>
          {state.mcqsTopics && <Topics mcqLength={mcq && mcq.mcqs ? mcq.mcqs.length : 0} type='quiz' />}

          <Generate
            type="quiz"
            setCategory={setCategory}
            setTitle={setTitle}
            setLoading={setLoading}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setQuiz={setQuiz}
            isOpen={isGenerateOpen}
            setIsOpen={setIsGenerateOpen}
            isGenerateOpen={true}
            quiz={quiz}
          />

          <UploadJson 
            isOpen={isUploadOpen}
            setIsOpen={setIsUploadOpen}
            setCategory={setCategory}
            setTitle={setTitle}
            type="quiz"  
          />

          <button className={`${loading ? "" : "hidden"}`} type="submit">
            {loading ? <div className="w-16 h-16 mx-auto mt-5 border-4 border-dashed rounded-full animate-spin border-black dark:border-white"></div> : "<>Search</>"}
          </button>

        </div>
      </div>
    </div>
  );
}
