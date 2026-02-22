import { useState } from "react"
import { navLinks } from "../../utils/constants"
import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Navbar() {
  const [toggle, setToggle] = useState(false);

  return (
   <nav className="dark:bg-[#2D2E32] z-[99] p-6 inset-x-0 top-0 flex justify-between items-center py-6 bg-transparent w-full">
      <h1 className="text-4xl font-semibold text-zinc-800 dark:text-gray-300 mr-5">StuddyBuddy</h1>
      <div className="hidden md:flex flex-1 justify-end items-center">
        <ul className="list-none flex justify-end items-center flex-1">
          {
            navLinks.map((nav, index) => (
              <li
                key={index}
              >
                <Link 
                  to={nav.id} 
                  smooth
                  duration={500}
                  className={`font-poppins font-normal cursor-pointer text-[16px] mr-10 dark:text-white`}
                  >
                    {nav.name}
                  </Link>
              </li>
            ))
          }
        </ul>
      </div>


       <div className="relative">
            {/* Menu Button */}
            <div className="md:hidden flex gap-4 flex-1 justify-end items-center">
                <div className="cursor-pointer mt-2" onClick={() => setToggle(prev => !prev )}>
                    <span className="material-symbols-outlined text-3xl">
                        menu
                    </span>
                </div>
            </div>

            {/* Background Overlay */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-[98] transition-opacity ${toggle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

            {/* Sliding Navbar */}
            <div
                className={`${toggle ? 'translate-x-0' : 'translate-x-full'} fixed top-0 right-0 h-full w-64 bg-gradient-to-b bg-white p-6 z-[99] transition-transform duration-300 ease-in-out`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="cursor-pointer dark:text-gray-300" onClick={() => setToggle(false)}>
                        <span className="text-3xl">
                            <FontAwesomeIcon icon={faClose} />
                        </span>
                    </div>
                </div>
                <ul className="list-none flex flex-col justify-start items-start gap-4 p-4">
                  {
                    navLinks.map((nav, index) => (
                      <li
                        key={nav.id}
                      >
                        <Link 
                          to={nav.id} 
                          smooth
                          duration={500}
                          className={`font-poppins font-normal cursor-pointer text-[16px] ${index === navLinks.length - 1 ? 'mb-0' : 'mb-4'} dark:text-white`}>
                          {nav.name}
                        </Link>
                      </li>
                    ))
                  }
                  <div className="flex gap-4 mr-4">
                    <RouterLink to="/login">
                      <button className="border-slate-300 border-2 p-2 rounded-md">Login</button>
                    </RouterLink>
                  </div>
                </ul>
            </div>
        </div>
    </nav>
  )
}
