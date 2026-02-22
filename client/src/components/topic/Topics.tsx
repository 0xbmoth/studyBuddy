import { useState } from "react";
import { Topic } from "../../types/Topic";
import { Output } from "../../types/output";
import { ChevronDown, ChevronUp } from "react-feather";
import { Trash } from "lucide-react";
import DeleteTopic from "../modals/DeleteTopic";
import DeleteCategory from "../modals/DeleteCategory";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface TopicsProps {
  topics: Topic[];
  type: Output;
  mcqLength: number
}

export default function Topics({ type, topics }: TopicsProps) {
  const [del, setDel] = useState<boolean>(false);
  const [topicId, setTopicId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [quizId, setQuizId] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState("");

  const groupedTopics = topics.reduce((acc, topic) => {
    acc[topic.category] = acc[topic.category] || [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic.name);
    setQuizId(topic.id);
    setIsModalOpen(true);
    setNumberOfQuestions(topic.numberOfQuestions);
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const startQuiz = () => {
    setIsModalOpen(false);
    window.location.href = `/quiz/${quizId}`;
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Object.keys(groupedTopics).map((categoryName) => (
        <div key={categoryName} className="rounded-lg overflow-hidden">
          {/* Category Button */}
          <button
            onClick={() => toggleCategory(categoryName)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors rounded-lg"
          >
            <span className="text-lg font-semibold bg-pink-400 px-4">{categoryName}</span>
            {openCategories[categoryName] ? (
              <div className="">
                <ChevronUp className="w-5 h-5" />
                <Trash
                 onClick={() => handleDeleteCategory(categoryName)}
                 className="w-5 h-5 mt-4 hover:text-pink-400 rounded-full " />
              </div>
            ) : (
              <div className="">
                <ChevronDown className="w-5 h-5" />
              </div>
            )}
          </button>

          {/* Topics List */}
          {openCategories[categoryName] && (
            <div className="flex flex-col gap-4 p-4">
              {groupedTopics[categoryName].map((topic) => (
                <div
                  key={topic.id}
                  className="relative border-pink-500 border-2 p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Delete Button */}
                  <span
                    onClick={() => {
                      setDel(true);
                      setTopicId(topic.id);
                    }}
                    className="absolute bottom-2 right-2 bg-[#2A2A2A] p-1 rounded-full text-gray-400 hover:text-red-500 cursor-pointer "
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </span>

                  {/* Topic Details */}
                  <div onClick={() => handleTopicClick(topic)} className="cursor-pointer">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-bold mb-2">{topic.name}</h3>
                      <h3>{topic.score}</h3>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Questions: {topic.numberOfQuestions + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <DeleteTopic type={type} topicId={topicId} setDel={setDel} del={del} />

      <DeleteCategory
        del={isDeleteCategoryModalOpen}
        setDel={setIsDeleteCategoryModalOpen}
        category={categoryToDelete}
      />

      {/* Modal for starting the quiz */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="border-2 border-pink-500 bg-white p-6 rounded-lg dark:bg-[#1F1F1F] w-[80%] sm:w-[50%] text-center">
            <h2 className="text-xl font-semibold mb-4">Do you want to start the quiz for "{selectedTopic}"?</h2>
            <p className="mb-8">You will answer {numberOfQuestions + 1} questions.</p>
            <div className="flex justify-around">
              <button
                onClick={startQuiz}
                className="bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-700"
              >
                Yes, Start Quiz
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all ease-in-out duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
