import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"

export default function GetStarted() {
  return (
    <Link to='/register'>
      <button className="button text-[20px]">
        <FontAwesomeIcon icon={faArrowRight} />
        Get started
        <span className="button-span"> ─ for free</span>
      </button>
    </Link>
  )
}
