import { useRef, useState } from "react";
import { getError } from "../../utils/api";
import { ApiError } from "../../types/ApiError";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    
    const errorRef = useRef<HTMLDivElement>(null);
    const { login } = useAuth();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
            
            window.location.href = `/dashboard`;
        } catch (err) {
            setIsLoading(false);

            const message = getError(err as ApiError);
            setError(message);
            toast.error(message);
            
            if (message.toLowerCase().includes("email") || message.toLowerCase().includes("user")) {
                document.getElementById("LoggingEmailAddress")?.focus();
            } else if (message.toLowerCase().includes("password")) {
                document.getElementById("loggingPassword")?.focus();
            } else {
                setTimeout(() => errorRef.current?.focus(), 100);
            }
        }   
    };

    return (
        <div>
            <p className="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
                Welcome back!
            </p>

            {error && (
                <div 
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert" 
                    className="mt-4 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 outline-none focus:ring-2 focus:ring-red-500"
                >
                    <span className="font-bold">Login failed:</span> {error}
                </div>
            )}

            <button 
                type="button"
                aria-label="Sign in with Google"
                className="flex w-full items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                <div className="px-4 py-2">
                    <svg className="w-6 h-6" viewBox="0 0 40 40">
                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107" />
                        <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00" />
                        <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50" />
                        <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2" />
                    </svg>
                </div>
                <span className="w-5/6 px-4 py-3 font-bold text-center">Sign in with Google</span>
            </button>

            <div className="flex items-center justify-between mt-4" aria-hidden="true">
                <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
                <span className="text-xs text-center text-gray-500 uppercase dark:text-gray-400">or login with email</span>
                <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" htmlFor="LoggingEmailAddress">Email Address</label>
                    <input 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        id="LoggingEmailAddress" 
                        autoComplete="email"
                        className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300" 
                        type="email" 
                    />
                </div>

                <div className="mt-4">
                    <div className="flex justify-between">
                        <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" htmlFor="loggingPassword">Password</label>
                        <a href="#" className="text-xs text-gray-500 dark:text-gray-300 hover:underline">Forgot Password?</a>
                    </div>
                    <input 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        id="loggingPassword" 
                        autoComplete="current-password"
                        className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300" 
                        type="password" 
                    />
                </div>

                <div className="flex items-center mt-4">
                    <input 
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        Remember me
                    </label>
                </div>

                <div className="mt-4">
                    <button 
                        disabled={isLoading}
                        aria-busy={isLoading}
                        className={`w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform rounded-lg focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50 ${
                            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-700 hover:bg-pink-500"
                        }`}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </div>

                <p className="mt-3 text-gray-600 text-sm text-center">
                    You don't have an account yet? <a className="text-pink-400" href="/register">Register</a> now.
                </p>
            </form>
        </div>
    );
}