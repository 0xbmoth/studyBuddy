import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { useReducer } from "react";
import { initialState, reducer } from "./reducer/store";
import { StateContext } from "./context/context";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      <div>
        <ToastContainer position="bottom-center" limit={4} />
        <Outlet />
      </div>
    </StateContext.Provider>
  )
}