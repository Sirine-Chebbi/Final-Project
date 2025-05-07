import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useRef, useEffect, useState, } from "react";
import { jwtDecode } from "jwt-decode";
import { GetUser } from '../Services/Userservice';
import PropTypes from 'prop-types';

const Navbar = (props) => {

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [Drop, setdrop] = useState(true);
  const navigate = useNavigate();
  const toast = useRef(null);
  const token = localStorage.getItem("access_token");
  const [datauser , setdataUser] = useState([]);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  let userData = null;

  if (token) {
    try {
      userData = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const fetchUser = async () => {
    const data = await GetUser(userData.matricule);
    setdataUser(data);
    setNom(data.nom);
    setPrenom(data.prenom);
  };

  
  useEffect(() => {
    fetchUser();
  },[])

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
                {<img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png" />}
            </div>
            <div className="flex place-items-center gap-15 mr-20 text-xl">
              <NavLink
                to="/tmp"
                className={({ isActive }) =>
                  `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                  }`
                }
              >
                Analyse temps
              </NavLink>
              <NavLink
                to="/nft"
                className={({ isActive }) =>
                  `hover:scale-115 duration-200 font-bold hover:text-cyan-300  ${isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                  }`
                }
              >
                Divers Testeurs
              </NavLink>
              <NavLink
                to="/wifi"
                className={({ isActive }) =>
                  `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                  }`
                }
              >
                Wifi Conduit
              </NavLink>
              <NavLink
                to="/test"
                className={({ isActive }) =>
                  `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${isActive ? "text-cyan-400 scale-115 hover:text-cyan-400" : "text-cyan-400/40 line-through"
                  }`
                }
              >
                Environnement De Test
              </NavLink>
              <div className="relative text-left">
                <div className="flex gap-3 place-items-center">
                  <button type="button" className="cursor-pointer inline-flex w-full justify-center gap-x-2 rounded-md bg-gray-900 px-3 py-2 font-semibold text-cyan-400">
                    {nom + " " + prenom}
                  </button>
                  <div className="p-1 hover:bg-gray-900 rounded-md">
                  <svg onClick={() => setdrop(!Drop)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(86.5% 0.127 207.078)" className="size-10 cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  </div>
                </div>
                <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-md bg-gray-900 outline-none" hidden={Drop}>
                  <div className="py-1 text-cyan-400">
                    <button onClick={() => props.setShowProfile(true)}  className="flex px-4 py-2 text-md text-cyan-400 cursor-pointer group place-items-center gap-2 hover:text-cyan-400 hover:bg-gray-800 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="oklch(78.9% 0.154 211.53)" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Profile
                    </button>
                    <NavLink to="/Admin">
                    <button className={`flex px-4 py-2 text-md text-cyan-400 cursor-pointer group place-items-center gap-2 hover:text-cyan-400 hover:bg-gray-800 w-full ${datauser.role != "1" ? 'hidden' : ''} `}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    Admin Dashboard
                    </button>
                    </NavLink>
                    <button
                      onClick={() => { handleLogout() }} className="flex px-4 py-2 text-md text-cyan-400 cursor-pointer place-items-center gap-2 hover:text-cyan-400 hover:bg-gray-800 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.8" stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
Navbar.propTypes = {
  setShowProfile: PropTypes.func.isRequired,
  showProfile: PropTypes.bool.isRequired
}

export default Navbar;