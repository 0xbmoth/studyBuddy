import { faBars, faClose, faMoon, faSignOutAlt, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useReducer, useState } from "react";
import { getTheme } from "../../utils/theme";
import { initialState, reducer } from "../../reducer/store";
import { useAuth } from "../../hooks/useAuth";

interface NavbarProps {
    isSidebarOpen: boolean,
    toggleSidebar: () => void
}

export default function Navbar({isSidebarOpen, toggleSidebar}: NavbarProps) {
    const [theme, setTheme] = useState<string>(getTheme())
    const { logout } = useAuth();
    
    const checked = getTheme() === "light";
    const [, dispatch] = useReducer(reducer, initialState)
    
    const handleThemeSwitch = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    }

    useEffect(() => {
        dispatch({ type: 'CHANGE_THEME',  payload: theme })
    }, [theme])

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [theme])

    return (
        <div className="w-screen flex justify-between items-center fixed dark:bg-[#1F1F1F] z-[100] bg-white p-4 shadow-lg">
            <div className="flex items-center">
                <button
                    className="p-1 mr-4 rounded-md text-white bg-[#2F2F2F]"
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={isSidebarOpen ? faClose : faBars} />
                    
                </button>
                <h1 className="text-2xl font-semibold dark:text-white text-zinc-800 font-serif">StudyBuddy,</h1>
                <span className="text-zinc-600 dark:text-gray-200 mt-1 ml-4 hidden md:block">Generates MCQs and Flashcards, Previews PDFs</span>
            </div>
            <label htmlFor="Toggle1" className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800">
                <span>{(theme === "dark" && <FontAwesomeIcon icon={faMoon} inverse />) || (theme === "light" && <FontAwesomeIcon icon={faMoon}/>)}</span>
                <span className="relative">
                    <input id="Toggle1" type="checkbox" className="hidden peer" onChange={handleThemeSwitch} checked = {checked} />
                    <div className="w-10 h-6 rounded-full shadow-inner dark:bg-gray-600 bg-gray-400 peer-checked:dark:bg-white transition"></div>
                    <div className="absolute inset-y-0 left-0 w-4 h-4 m-1 rounded-full shadow peer-checked:right-0 peer-checked:left-auto bg-gray-300"></div>
                </span>
                <span className="color-white">{(theme === "dark" && <FontAwesomeIcon icon={faSun} inverse />) || (theme === "light" && <FontAwesomeIcon icon={faSun}/>)}</span>
            </label>

            {/* Logout */}
            <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1.5 sm:border-dashed rounded-lg sm:bg-red-50 sm:dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-medium sm:border border-red-200 dark:border-red-800"
                aria-label="Log out of your account"
            >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
    )
}
