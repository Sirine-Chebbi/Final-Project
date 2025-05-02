import { useState } from "react";
import api from "../../Services/api";
import { useNavigate } from "react-router-dom";

const UploadNFT = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFiles(event.target.files);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage("Veuillez sélectionner au moins un fichier.");
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append("nft_files", file);
    });

    try {
      setIsUploading(true);
      setMessage("Envoi des fichiers en cours...");

      const response = await api.post(
        "wifi-nft/upload-nft-results/",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
          onUploadProgress: progress => {
            const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
            setMessage(`Envoi... ${percentCompleted}%`);
          }
        }
      );

      setMessage(response.data.message || "Fichiers envoyés avec succès");
      
      if (onUploadSuccess) {
        await onUploadSuccess(); // Rafraîchit les données parentes
      }

      // Réinitialiser la sélection de fichiers après un délai
      setTimeout(() => {
        setFiles(null);
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      
      if (error.response?.status === 401) {
        try {
          const newToken = await authService.refreshToken();
          localStorage.setItem('access_token', newToken);
          await handleUpload(); // Réessaye avec le nouveau token
          return;
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          navigate('/');
          return;
        }
      }

      setMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Erreur lors de l'envoi des fichiers"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ml-auto mr-auto w-300 hover:scale-105 duration-200">
      <div className="border-2 flex justify-between border-cyan-400 p-3 rounded-2xl shadow-lg hover:shadow-cyan-400">
        <div className="flex gap-10 text-xl ml-5">
          <svg
            className="mx-auto"
            width="45"
            height="55"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG inchangé */}
          </svg>
          <h4 className="text-cyan-400 place-self-center">
            Télécharger les logs ici !
          </h4>
        </div>

        {message && (
          <div className="flex items-center">
            <p className="text-l text-cyan-400 mx-auto max-w-xs">
              {message}
              {isUploading && "..."}
            </p>
          </div>
        )}

        <div className="flex gap-10 mr-5">
          <label>
            <input
              multiple
              onChange={handleFileChange}
              type="file"
              hidden
              disabled={isUploading}
            />
            <div className={`
              flex w-40 h-9 px-2 flex-col p-5 rounded-xl mt-2 
              text-black font-semibold leading-4 items-center justify-center 
              cursor-pointer focus:outline-none
              ${
                isUploading 
                  ? 'bg-cyan-500' 
                  : 'bg-cyan-300 hover:text-cyan-300 hover:bg-gray-950 hover:border-2'
              }`}
            >
              {files?.length > 0 ? `${files.length} fichier(s)` : 'Choisir les fichiers'}
            </div>
          </label>
          
          <button
            onClick={handleUpload}
            disabled={isUploading || !files || files.length === 0}
            className={`
              flex w-28 h-9 px-2 flex-col p-5 rounded-xl mt-2 
              text-black font-semibold leading-4 items-center justify-center 
              cursor-pointer focus:outline-none
              ${
                isUploading || !files || files.length === 0
                  ? 'bg-cyan-500 cursor-not-allowed' 
                  : 'bg-cyan-300 hover:text-cyan-300 hover:bg-gray-950 hover:border-2'
              }`}
          >
            {isUploading ? 'Envoi...' : 'Télécharger'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadNFT;