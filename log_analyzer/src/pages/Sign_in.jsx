import { NavLink } from 'react-router-dom';

const Sign_in = () => {
  return (
    <>
      <div className="bg-linear-to-br  from-gray-950 to-sky-600 h-screen">
        <header className="">
          <div className="p-10" id="upload">
            <div className="flex h-16 items-center justify-between">
              <div className="md:flex ml-5">
                <a className="block" href="/wifi">
                  <img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png" />
                </a>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-cyan-400 flex-col justify-self-center w-190 h-150 justify-items-center">

          <h2 className="text-cyan-400 mt-20 mb-5 text-5xl font-medium">Bienvenue</h2>
          <input type="text" placeholder="Adresse" className="border-b-2 border-cyan-400 text-cyan-400 mt-15 text-2xl pb-2 outline-none w-130" /><br />
          <input type="text" placeholder="Mot de passe" className="border-b-2 border-cyan-400 text-cyan-400 mt-20 text-2xl pb-2 outline-none w-130" /><br />

          <div className="gap-10 mt-10 items-center flex">
            <h1 className="text-cyan-400 text-4xl mt-20 font-medium">Se Connecter</h1>
            <NavLink to="/admin">
              <button className="border-2 border-cyan-400 rounded-2xl h-15 mt-20 group hover:bg-cyan-400 duration-300 cursor-pointer p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="oklch(0.789 0.154 211.53)" className="size-10 group-hover:stroke-gray-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sign_in
