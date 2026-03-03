import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { AppProvider } from "./context/context";

export default function App() {
  
  return (
    <AppProvider>
      <div>
        <ToastContainer 
          position="bottom-center" 
          hideProgressBar={false}
          limit={4} />
        <Outlet />
      </div>
    </AppProvider>
  )
}