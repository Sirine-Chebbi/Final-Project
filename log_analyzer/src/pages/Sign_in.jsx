import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Toast } from "primereact/toast";

const Sign_in = () => {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toastBL = useRef(null); // Ref pour le toast

  const showErrorToast = (message) => {
    toastBL.current.show({
      severity: "error",
      summary: "Erreur",
      detail: message,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) {
      showErrorToast("Veuillez entrer votre matricule");
      return;
    }

    if (!password) {
      showErrorToast("Veuillez entrer votre mot de passe");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matricule, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        if (data.role == "admin") {
          navigate("/admin");
        } else {
          navigate("/wifi");
        }
      } else {
        const errorData = await response.json();
        if (errorData.detail) {
          if (errorData.detail.includes("matricule")) {
            showErrorToast("Matricule inexistant !");
          } else if (errorData.detail.includes("mot de passe")) {
            showErrorToast("Mot de passe incorrect !");
          } else {
            showErrorToast(errorData.detail || "Erreur lors de la connexion");
          }
        } else {
          showErrorToast("Erreur lors de la connexion");
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
      showErrorToast("Erreur de connexion au serveur");
    }
  };

  return (
    <>
      <Toast ref={toastBL} position="top-center" />
      <div className="bg-gradient-to-br from-gray-950 to-sky-600 h-screen">
        <header>
          <div className="p-10" id="upload">
            <div className="flex h-16 items-center justify-between">
              <div className="md:flex ml-5">
                <a className="block" href="/wifi">
                  <img
                    className="h-40"
                    alt="sagemcom"
                    src="../src/assets/logo.png"
                  />
                </a>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleLogin}>
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-cyan-400 w-190 h-150 m-auto grid justify-items-center p-10">
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
