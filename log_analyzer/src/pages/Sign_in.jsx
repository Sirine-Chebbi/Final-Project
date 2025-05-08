import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Toast } from "primereact/toast";
import { authService } from "../Services/authService"

const Sign_in = () => {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toastBL = useRef(null);

  const showErrorToast = (message) => {
    toastBL.current.show({
      severity: "error",
      summary: "Erreur",
      detail: message,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!matricule.trim()) {
      showErrorToast("Veuillez entrer votre matricule");
      setLoading(false);
      return;
    }

    if (!password) {
      showErrorToast("Veuillez entrer votre mot de passe");
      setLoading(false);
      return;
    }

    try {
      const data = await authService.login(matricule, password);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/wifi");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showErrorToast(error.response?.data?.detail || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toastBL} position="top-center" />
      <header>
        <div className="p-10 fixed" id="upload">
          <div className="flex h-16 items-center justify-between">
            <div className="md:flex ml-5">
              <img
                className="h-40"
                alt="sagemcom"
                src="/assets/logo.png"
              />
            </div>
          </div>
        </div>
      </header>
      <div className="bg-[url(/assets/bg-signin.jpg)] bg-cover h-screen flex justify-center place-items-center">
        <form onSubmit={handleLogin} className="mt-15">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-cyan-400 w-240 h-150 m-auto grid justify-items-center p-10">
            <h2 className="text-cyan-400 mt-5 text-5xl font-medium">
              Bienvenue
            </h2>

            <input
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              type="text"
              placeholder="Matricule"
              className="border-b-2 border-cyan-400 text-cyan-400 text-2xl pb-1 outline-none w-130 h-11 mt-8"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Mot de passe"
              className="border-b-2 border-cyan-400 text-cyan-400 text-2xl pb-1 outline-none w-130 h-11 mt-8"
            />

            <div className="gap-10 items-center flex mt-8">
              <h1 className="text-cyan-400 text-4xl font-medium">
                Se Connecter
              </h1>
              <button
                type="submit"
                className="border-2 border-cyan-400 rounded-2xl h-15 group hover:bg-cyan-400 duration-300 cursor-pointer p-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="oklch(0.789 0.154 211.53)"
                  className="size-10 group-hover:stroke-gray-900"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Sign_in;
