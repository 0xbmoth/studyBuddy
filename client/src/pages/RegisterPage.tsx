import { Helmet } from "react-helmet-async"
import Register from "../components/authentication/Register"

export default function SignupPage() {
  return (
    <div className="bg-pink-100 h-screen">
      <Helmet>
        <title>Signup</title>
      </Helmet>
      <div className="bg-white relative top-10 x-auto flex w-full h-[90%] max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
          <div className="hidden bg-auto lg:block lg:w-1/2">
            <img className="h-[100%]" src="register.jpg" alt="" />
          </div>
          <div className="w-full px-6 py-8 md:px-8 lg:w-1/2 overflow-scroll">
              <div className="flex justify-center mx-auto">
                  <img className="w-auto h-7 sm:h-8" src="/gifs/computer.gif" alt=""/>
              </div>
              <Register/>
          </div>
      </div>
    </div>
  )
}