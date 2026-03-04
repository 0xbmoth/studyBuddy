import { jwtDecode } from "jwt-decode";
import { User } from "../types/User";
import { getTheme } from "../utils/theme";
import { Flashcards } from "../types/flashcard";
import { MCQs } from "../types/mcq";
import { Topic } from "../types/Topic";
import { TitleStat } from "../types/Attempts";

export type AppState = {
  user: User | null;
  theme: string;
  flashcards: Flashcards[];
  mcqs: MCQs[];
  flashcardsTopics: Topic[];
  mcqsTopics: Topic[];
};

const user = localStorage.getItem("token")
  ? jwtDecode(localStorage.getItem("token")!)
  : null;

const theme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")!
  : getTheme();

const localMcqs = localStorage.getItem("mcqs") 
  ? JSON.parse(localStorage.getItem("mcqs")!) 
  : [];

const localMcqTopics = localStorage.getItem("mcqsTopics") 
  ? JSON.parse(localStorage.getItem("mcqsTopics")!) 
  : [];

const localFlashcardTopics = localStorage.getItem("flashcardTopics") 
  ? JSON.parse(localStorage.getItem("flashcardTopics")!) 
  : [];

export const initialState: AppState = {
  user: user ? (user as User) : null,
  theme: theme ? theme : "light",
  flashcards: [],
  mcqs: localMcqs,
  flashcardsTopics: localFlashcardTopics,
  mcqsTopics: localMcqTopics,
};

export type Action =
  | { type: "USER_SIGNIN"; payload: User }
  | { type: "USER_SIGNOUT" }
  | { type: "CHANGE_THEME"; payload: string }
  | { type: "GET_FLASHCARDS"; payload: Flashcards[] }
  | { type: "GET_FLASHCARDS_TOPIC"; payload: Topic[] }
  | { type: "DELETE_FLASHCARDS_TOPIC"; payload: string }
  | { type: "ADD_FLASHCARDS"; payload: Flashcards }
  | { type: "REMOVE_FLASHCARDS"; payload: Flashcards }
  | { type: "GET_MCQS"; payload: MCQs[] }
  | { type: "GET_MCQS_TOPIC"; payload: Topic[] }
  | { type: "DELETE_MCQS_TOPIC"; payload: string }
  | { type: "ADD_MCQS"; payload: MCQs }
  | { type: "REMOVE_MCQS"; payload: MCQs }
  | { type: "SET_SCORE"; payload: TitleStat[] }
  | { type: "UPDATE_MCQ_CATEGORY", payload: { id: string, category: string } }
  | { type: "DELETE_MCQ_CATEGORY", payload: string }
  | { type: "SAVE_ATTEMPT", payload: { id: string, score: number } }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "USER_SIGNIN":
      return { ...state, user: action.payload };
    case "USER_SIGNOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("mcqs");
      localStorage.removeItem("mcqsTopics");
      return { ...state, user: null, mcqs: [], mcqsTopics: [] };
    case "CHANGE_THEME":
      localStorage.setItem("theme", action.payload);
      return { ...state, theme: action.payload };
    case "GET_FLASHCARDS":
      return { ...state, flashcards: action.payload };
    case "GET_FLASHCARDS_TOPIC":
      return { ...state, flashcardsTopics: action.payload };
    case "DELETE_FLASHCARDS_TOPIC": {
      const topics: Topic[] = state.flashcardsTopics.filter(
        (topic) => topic.id !== action.payload
      );
      return { ...state, flashcardsTopics: topics };
    }
    case "ADD_FLASHCARDS":
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case "REMOVE_FLASHCARDS":
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case "GET_MCQS":
      localStorage.setItem("mcqs", JSON.stringify(action.payload));
      return { ...state, mcqs: action.payload };
    case "GET_MCQS_TOPIC":
      localStorage.setItem("mcqsTopics", JSON.stringify(action.payload));
      return { ...state, mcqsTopics: action.payload };
    case "DELETE_MCQS_TOPIC": {
      const filteredTopics = state.mcqsTopics.filter(
        (topic) => topic.id !== action.payload
      );

      console.log(filteredTopics)
      localStorage.setItem("mcqsTopics", JSON.stringify(filteredTopics));

      return { ...state, mcqsTopics: filteredTopics };
    }
    case "ADD_MCQS":
      const newQuiz = action.payload;
      const updatedMcqs = [...state.mcqs, newQuiz];

      const newTopic: Topic = {
        name: newQuiz.title,
        category: newQuiz.category,
        numberOfQuestions: newQuiz.mcqs?.length || 0,
        id: newQuiz._id || Math.random().toString(),
        score: `0/${newQuiz.mcqs?.length || 0}`
      };

      const updatedTopics = [newTopic, ...state.mcqsTopics];
      
      localStorage.setItem("mcqs", JSON.stringify(updatedMcqs))
      localStorage.setItem("mcqsTopics", JSON.stringify(updatedTopics));

      return { ...state, mcqs: updatedMcqs, mcqsTopics: updatedTopics };
    
    case "SAVE_ATTEMPT":
      let newMcqState = state.mcqs.map((item: any) => 
        (item._id === action.payload.id || item.id === action.payload.id)
        ? { ...item, score: action.payload.score }
        : item
      )
      
      let newTopicState = state.mcqsTopics.map((item: any) => 
        (item._id === action.payload.id || item.id === action.payload.id)
        ? { ...item, score: `${action.payload.score}/${item.numberOfQuestions}` }
        : item
      )

      localStorage.setItem("mcqs", JSON.stringify(newMcqState))
      localStorage.setItem("mcqsTopics", JSON.stringify(newTopicState));

      return { ...state, mcqs: newMcqState, mcqsTopics: newTopicState }
    
    case "REMOVE_MCQS":
      return { ...state, mcqs: [...state.mcqs, action.payload] };

    case "UPDATE_MCQ_CATEGORY":
      return {
        ...state,
        mcqs: state.mcqs.map((item: any) =>
          item._id === action.payload.id
            ? { ...item, category: action.payload.category }
            : item
        ),
        
        mcqsTopics: state.mcqsTopics.map((topic: any) =>
          topic.id === action.payload.id
            ? { ...topic, category: action.payload.category }
            : topic
        ),
      };

      case "DELETE_MCQ_CATEGORY":
        let mcqsAfterDeletion = state.mcqs.filter((item: any) =>
          item.category != action.payload
        )

        let topicAfterDeletion = state.mcqsTopics.filter((topic: any) =>
          topic.category != action.payload
        )

        localStorage.setItem("mcqs", JSON.stringify(mcqsAfterDeletion))
        localStorage.setItem("mcqsTopics", JSON.stringify(topicAfterDeletion));
        
        return {
          ...state,
          mcqs: mcqsAfterDeletion,
          
          mcqsTopics: topicAfterDeletion,
        };
    default:
      return state;
  }
}
