import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token");

      if (!refreshToken || !accessToken) {
        showToast('warn', 'Attention', 'Aucun token trouvé');
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        showToast('success', 'Succès', 'Déconnexion réussie');
        setTimeout(() => navigate("/"), 1500); // Wait for toast to show
      } else {
        const errorData = await response.json();
        showToast('error', 'Erreur', errorData.detail || 'Échec de la déconnexion');
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast('error', 'Erreur', 'Erreur lors de la déconnexion');
    }
  };
  return (
    <>
    <Toast ref={toast} position="top-center" />

    <header className="">
      <div className="p-10" id="upload">
        <div className="flex h-16 items-center justify-between">
          <div className="md:flex ml-5">
            <NavLink to="/">
              { <img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png"/> }  
            </NavLink>
          </div>
          <div className="flex gap-15 mr-20 text-xl">
          <NavLink 
              to="/tmp" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                }`
              }
            >
              Analyse temps
            </NavLink>
            <NavLink 
              to="/nft" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300  ${
                  isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                }`
              }
            >
              Divers Testeurs
            </NavLink>
            <NavLink 
              to="/wifi" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                }`
              }
            >
              Wifi Conduit
            </NavLink>
            <NavLink 
              to="/test" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                }`
              }
            >
              Environnement De Test
            </NavLink>
            <button
                onClick={handleLogout}
                className="text-cyan-400 cursor-pointer group flex items-center gap-2 hover:text-cyan-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-10 group-hover:scale-110 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </button>
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

export default Navbar;