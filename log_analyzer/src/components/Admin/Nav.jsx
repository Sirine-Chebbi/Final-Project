import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { authService } from "../../Services/authService"

const Nav = (props) => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      showToast('success', 'Succès', 'Déconnexion réussie');
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Logout error:", error);
      showToast('error', 'Erreur', 'Échec de la déconnexion');
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <header className="">
        <div className="p-10" id="upload">
          <div className="flex h-16 items-center justify-between">
            <div className="md:flex ml-5">
                <img
                  className="h-40"
                  alt="sagemcom"
                  src="../src/assets/logo.png"
                />
            </div>
            <div className="bg-cyan-800/10 rounded-3xl w-120 h-20 mr-15 flex items-center justify-between p-10">
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
                Déconnecter
              </button>
              
              <NavLink to="/wifi" className="text-cyan-400 cursor-pointer group flex items-center gap-2 hover:text-cyan-300 transition-colors">
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
                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
                Mode
              </NavLink>
              
              <button onClick={() => props.setShowProfile(!props.showProfile)} className="text-cyan-400 cursor-pointer group flex items-center gap-2 hover:text-cyan-300 transition-colors">
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
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

Nav.propTypes = {
  setShowProfile: PropTypes.func.isRequired,
  showProfile: PropTypes.bool.isRequired
}

export default Nav;