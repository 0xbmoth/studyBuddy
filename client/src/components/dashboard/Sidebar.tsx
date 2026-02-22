import { NavLink } from "react-router-dom"
import { sidebar } from "../../utils/constants"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface SidebarProps {
    isSidebarOpen: boolean
}

export default function Sidebar({isSidebarOpen}: SidebarProps) {

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64 sm:w-64" : "w-0 sm:w-64 hidden"
      } z-[99] dark:bg-[#1F1F1F] bg-white border text-white min-h-screen top-0 left-0 fixed transition-all duration-300 ease-in-out`}
    >
      {isSidebarOpen && (
        <div className="p-4 mt-16">
          {sidebar.map(element => (
            <NavLink to={'/' + element.link} key={element.id} className="text-black dark:text-white p-4 flex gap-4 rounded-lg hover:bg-yellow-100 dark:hover:bg-[#2F2F2F]">
              <FontAwesomeIcon style={{marginTop: "5px"}} icon={element.icon} />
              <p className="">
                {element.name}
              </p>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
