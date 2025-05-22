import PropTypes from "prop-types";
import { useState } from "react";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const Tableuser = (props) => {  
  const [prenom, setPrenom] = useState('');
  const [Poste, setPoste] = useState('');
  const toast = useRef(null); // For Toast notifications


  const resetSearch = () => {
    setPrenom('');
    setPoste('');
    document.getElementById("valuePoste").value = '';
    document.getElementById("valuePrenom").value = '';
  }

  return (
    <>
      <Toast ref={toast} />
      <div>
        <div className="justify-between flex">
          <div className="flex place-items-center gap-3 mb-10">
            <h1
              onClick={() => {
                props.setVisibility(!props.Hidden);
                resetSearch();
              }}
              className="text-cyan-400 -mb-5 text-2xl font-medium place-items-center flex gap-3 hover:bg-cyan-200/20 cursor-pointer p-3 rounded-2xl h-20 duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-13"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Chercher
            </h1>
            <input
              type="text"
              id="valuePrenom"
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prenom"
              className={`${
                props.Hidden ? "opacity-100 ml-10" : "opacity-0 pointer-events-none"
              } border-cyan-400 border-b-2 p-3 text-xl text-cyan-400 outline-none w-80 duration-200 -ml-10`}
            />
            <input
              type="text"
              id="valuePoste"
              placeholder="poste"
              onChange={(e) => setPoste(e.target.value)}
              className={`${
                props.Hidden ? "opacity-100 ml-10" : "opacity-0 pointer-events-none"
              } border-cyan-400 border-b-2 p-3 text-xl text-cyan-400 outline-none w-80 duration-200 -ml-10`}
            />
          </div>
          <button
            onClick={() => props.setVisibilityuser(!props.User)}
            className="outline-none hover:bg-gray-900 hover:text-cyan-400 mr-5 mt-10 border-2 border-cyan-400 h-15 p-5 rounded-tr-2xl rounded-tl-2xl duration-200 hover:h-20 cursor-pointer font-medium text-xl bg-cyan-400"
          >
            Ajouter Un utilisateur
          </button>
        </div>

        <div className="w-350 overflow-x-auto rounded-xl border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 bg-gray-900 max-h-140 duration-200">
          {props.loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-cyan-400">
              <thead className="bg-gray-900 text-center">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Prenom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Matricule
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Poste
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xl font-bold text-cyan-400 whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400 bg-gray-900">
                {props.users.length > 0 ? (
                  props.users
                    .filter(user =>
                      user.prenom?.toLowerCase().includes(prenom.toLowerCase()) &&
                      user.poste?.toLowerCase().includes(Poste.toLowerCase())
                    )
                    .map((user) => (
                      <tr
                        key={user.matricule}
                        className={`hover:bg-gray-800 text-xl text-center ${user.role == "1" ? "hidden" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.nom || "Nom non disponible"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.prenom || "Prénom non disponible"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.matricule || "Matricule non disponible"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.poste || "Poste non disponible"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          <div className="flex gap-5 justify-center">
                            <button 
                              onClick={() => {
                                props.setVisibilitymod(!props.Mod);
                                props.setMatricule(user.matricule);
                              }} 
                              className="rounded-xl p-3 bg-green-900 cursor-pointer group hover:bg-green-400 duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="oklch(79.2% 0.209 151.711)"
                                className="size-6 group-hover:stroke-green-900"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {
                                props.setVisibilitydelete(!props.Delete);
                                props.setMatricule(user.matricule);
                              }} 
                              className="p-3 bg-red-900 rounded-xl cursor-pointer group hover:bg-red-500 duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="oklch(70.4% 0.191 22.216)"
                                className="size-6 group-hover:stroke-red-900"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={5} 
                      className="px-6 py-4 text-center text-white"
                    >
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

Tableuser.propTypes = {
  setVisibility: PropTypes.func.isRequired,
  Hidden: PropTypes.bool.isRequired,
  setVisibilityuser: PropTypes.func.isRequired,
  setVisibilitymod: PropTypes.func.isRequired,
  User: PropTypes.bool.isRequired,
  setVisibilitydelete: PropTypes.func.isRequired,
  Delete: PropTypes.bool.isRequired,
  Mod: PropTypes.bool.isRequired,
  setMatricule: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  loading: PropTypes.string.isRequired,
};

export default Tableuser;