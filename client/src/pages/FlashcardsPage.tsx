import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import { Topic } from "../types/Topic";
import { Flashcard, Flashcards } from "../types/flashcard";
import FlipCard from "../components/topic/Flashcard/FlipCard";
import SaveFlashcards from "../components/topic/Flashcard/SaveFlashcards";
import { axiosInstance } from "../services/auth.service";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Output } from "../types/output";
import DeleteTopic from "../components/modals/DeleteTopic";
import Generate from "../components/modals/Generate";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FlashcardsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ [key: string]: Topic[] }>({});
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [flashcardId, setFlashcardId] = useState("");
  const [flashcard, setFlashcard] = useState<Flashcard[]>();
  const [del, setDel] = useState<boolean>(false);
  const [topicId, setTopicId] = useState("");

  useEffect(() => {
    axiosInstance.get(`/flashcard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    })
      .then((response) => {
        const flashcards = response.data.flashcard;
        const userTopics: Topic[] = flashcards.map((flashcard: Flashcards) => ({
          name: flashcard.title,
          category: flashcard.category,
          numberOfQuestions: flashcard.flashcards.length - 1,
          id: flashcard._id,
        }));

        // Group topics by category
        const groupedCategories = userTopics.reduce((acc, topic) => {
          if (!acc[topic.category]) acc[topic.category] = [];
          acc[topic.category].push(topic);
          return acc;
        }, {} as { [key: string]: Topic[] });

        setCategories(groupedCategories);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axiosInstance.get(`/flashcard/${flashcardId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    })
      .then((response) => {
        setFlashcard(response.data.flashcard.flashcards);
      })
      .catch((err) => {
        console.error("Error fetching flashcard:", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
      });
  }, [flashcardId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  

  return (
    <div className="font-mono dark:bg-[#111111] bg-white min-h-screen overflow-y-hidden">
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex sm:grid transition-all dark:bg-[#111111] duration-300 ${isSidebarOpen ? "sm:ml-64 ml-0 grid-cols-6" : "ml-0 grid-cols-6"} w-full min-h-screen text-gray-700`}>
        <Sidebar isSidebarOpen={isSidebarOpen} />
        
        <div className={`${isSidebarOpen ? "dark:bg-[#111111] sm:col-span-4 col-span-5" : "col-span-6"} flex flex-col mt-16 flex-grow p-4 dark:text-white h-full overflow-x-hidden`}>
          <h1 className="text-5xl mt-4 ml-4">Flashcards</h1>
          
          <div className="flex rounded-lg cursor-pointer gap-4 p-2 w-fit mt-2" onClick={() => setIsOpen(true)}>
            <div className="flex gap-2">
              <span className="text-2xl bg-pink-100 hover:bg-pink-200 transition px-2 dark:bg-[#3b3939] dark:hover:bg-[#2b2929] rounded-md">
                +
              </span>
              <p className="text-xl">Generate Flashcards:</p>
            </div> 
          </div>

          <Generate
            type="flashcard"
            setCategory={setCategory}
            setTitle={setTitle}
            setLoading={setLoading}
            setFlashcard={setFlashcards}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isGenerateOpen={true}
            quiz={flashcards}
          />

          <p className="text-xl mt-4 ml-4">Your topics:</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.keys(categories).map((categoryName) => (
              <div key={categoryName} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors rounded-lg"
                >
                  <span className="text-lg font-semibold bg-pink-400 -rotate-1 px-4">{categoryName}</span>
                  {openCategories[categoryName] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {openCategories[categoryName] && (
                  <div className="relative flex flex-col gap-4 p-4">
                    {categories[categoryName].map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => {
                          setFlashcardId(topic.id);
                          setSelectedTopic(topic.name);
                        }}
                        className="flex justify-between border-pink-500 border-2 p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        <div>
                          <h3 className="text-lg font-bold mb-2">{topic.name}</h3>
                          <div className="flex flex-col space-y-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Questions: {topic.numberOfQuestions + 1}
                            </span>
                          </div>
                        </div>
                        
                        <div
                          onClick={() => {
                            setDel(true);
                            setTopicId(topic.id);
                          }}
                            className="p-1 text-gray-400 hover:text-red-500 cursor-pointer">
                          <p className="rounded-full bg-[#2A2A2A] p-1">
                            <FontAwesomeIcon icon={faTrashCan}/>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <DeleteTopic type={"Flashcard" as Output} topicId={topicId} setDel={setDel} del={del} />
              
          {flashcards && flashcards.length > 0 && 
            <div>
              <SaveFlashcards category={category} title={title} flashcards={flashcards}/>
              <FlipCard flashcards={flashcards} />
            </div>
          }

          <button className={`${loading ? "" : "hidden"}`} type="submit">
            {loading ? 
              <div className="w-16 h-16 mx-auto mt-5 border-4 border-dashed rounded-full animate-spin border-black dark:border-white"></div> 
              : "<>Search</>"
            }
          </button>
          
          {selectedTopic && 
            <div className="flex flex-col">
              <h3 className="text-3xl mt-8 ml-4 font-mono dark:text-white">{selectedTopic}</h3>
              <FlipCard flashcards={flashcard} />
            </div>
          }
        </div>
      </div>
    </div>
  );
}