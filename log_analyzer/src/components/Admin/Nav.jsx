import { NavLink } from "react-router-dom";

const Nav = () => {
  return (
    <header className="">
          <div className="p-10" id="upload">
            <div className="flex h-16 items-center justify-between">
              <div className="md:flex ml-5">
                <a className="block" href="/wifi">
                  <img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png" />
                </a>
              </div>
              <div className="bg-black/40 rounded-3xl w-120 h-20 mr-15 flex items-center justify-between p-10">
                <NavLink to="/">
                  <button className="text-cyan-400 cursor-pointer group flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 group-hover:scale-110">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    Déconnecter
                  </button>
                </NavLink>
                <NavLink to="/wifi">
                  <button className="text-cyan-400 cursor-pointer group flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 group-hover:scale-110">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Mode
                  </button>
                </NavLink>
                <button className="text-cyan-400 cursor-pointer group flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 group-hover:scale-110">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Profile
                </button>
              </div>
            </div>
          </div>
        </header>
  )
}

export default Nav