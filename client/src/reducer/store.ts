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

export const initialState: AppState = {
  user: user ? (user as User) : null,
  theme: theme ? theme : "light",
  flashcards: [],
  mcqs: [],
  flashcardsTopics: [],
  mcqsTopics: [],
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
  | { type: "SET_SCORE"; payload: TitleStat[] };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "USER_SIGNIN":
      return { ...state, user: action.payload };
    case "USER_SIGNOUT":
      localStorage.removeItem("token");
      return { ...state, user: null };
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
      return { ...state, mcqs: action.payload };
    case "GET_MCQS_TOPIC":
      return { ...state, mcqsTopics: action.payload };
    case "DELETE_MCQS_TOPIC": {
      const topics: Topic[] = state.mcqsTopics.filter(
        (topic) => topic.id !== action.payload
      );
      return { ...state, mcqsTopics: topics };
    }
    case "ADD_MCQS":
      return { ...state, mcqs: [...state.mcqs, action.payload] };
    case "REMOVE_MCQS":
      return { ...state, mcqs: [...state.mcqs, action.payload] };
    default:
      return state;
  }
}
