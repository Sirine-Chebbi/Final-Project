import { useState, useEffect, useRef } from "react";
import { Toast } from 'primereact/toast';

const Tablerole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  const showErrorToast = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Erreur",
      detail: message,
      life: 4000,
    });
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showErrorToast("Token d'authentification manquant");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/auth/roles/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        showErrorToast("Erreur lors du chargement des rôles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      showErrorToast("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <div className="w-350 grid justify-self-center overflow-x-auto rounded-xl border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 bg-gray-900 max-h-fit duration-200">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-cyan-400">
            <thead className="bg-gray-900 text-center">
              <tr>
                <th scope="col" className="py-4 px-6 text-center text-xl font-bold text-cyan-400 whitespace-nowrap">
                  Nom Du Rôle
                </th>
                <th scope="col" className="py-4 px-6 text-center text-xl font-bold text-cyan-400 whitespace-nowrap">
                  Page Accessible
                </th>
                <th scope="col" className="py-4 px-6 text-center text-xl font-bold text-cyan-400 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-400 bg-gray-900">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-800 text-xl text-center">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {role.name || "Nom non disponible"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {role.accessible_pages ? 
                        role.accessible_pages.join(", ") : 
                        "Aucune page spécifiée"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      <div className="flex gap-5 justify-center">
                        <button className="rounded-xl p-3 bg-green-900 cursor-pointer group hover:bg-green-400 duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 group-hover:stroke-green-900"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                        <button className="p-3 bg-red-900 rounded-xl cursor-pointer group hover:bg-red-500 duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
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
                  <td colSpan={3} className="px-6 py-4 text-center text-white">
                    Aucun rôle trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Tablerole;