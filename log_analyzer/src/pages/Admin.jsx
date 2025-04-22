import { NavLink } from "react-router-dom";

const Admin = () => {
  return (
    <>
      <div className="bg-linear-to-br  from-gray-950 to-sky-600">
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
        <div className="p-10 flex justify-between ml-20 mr-20">
          <div className="w-280 overflow-x-auto rounded-xl h-150 border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 max-h-max hover:scale-102 duration-200">
            <table className="min-w-full divide-y divide-cyan-400">
              <thead className="bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Prenom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400 bg-gray-900">
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zerzr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    zzerzer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-10">
            <div className="mb-10 w-60 h-60 overflow-y-hidden rounded-xl text-2xl border-2 text-center border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 hover:scale-102 duration-200">
              <h1 className="text-white font-medium">Nombre Des Utilisateurs</h1>
              <h1 className="text-white text-9xl">30</h1>
            </div>
            <div className="w-60 h-60 overflow-y-hidden rounded-xl text-2xl border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 hover:scale-102 duration-200">
              <button className="cursor-pointer justify-items-center text-center">
                <h1 className="text-white font-medium mb-3">Ajouter Un Utilisateur</h1>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="white" className="size-30">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-10">
          <div className="w-350 justify-self-center overflow-x-auto rounded-xl h-160 border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 bg-gray-900 max-h-max hover:scale-102 duration-200">
            <table className="min-w-full divide-y divide-cyan-400">
              <thead className="bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="py-4 text-center text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Nom Du Role
                  </th>
                  <th
                    scope="col"
                    className="py-4 text-center text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Page Accessible
                  </th>
                  <th
                    scope="col"
                    className="*py-4 text-center text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400 bg-gray-900">
                <tr className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white text-center">
                    zzerzer
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white text-center">
                    ezrezr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white text-center">
                    zerzzer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Admin