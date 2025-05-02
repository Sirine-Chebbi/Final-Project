import { useState } from "react";
import api from "../../Services/api"; // Utilisez votre instance API configurée
import { useNavigate } from "react-router-dom";

const Uploadtest = ({ onUploadSuccess }) => {
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
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]); // Utilisez le nom de champ attendu par votre API
    }

    try {
      setIsUploading(true);
      setMessage("Envoi des fichiers en cours...");

      const response = await api.post(
        "environnement-test/upload_test_condition/",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message || "Fichiers envoyés avec succès");
      
      if (onUploadSuccess) {
        await onUploadSuccess(); // Rafraîchit les données parentes
      }

      // Réinitialiser après succès
      setFiles(null);

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
        error.message || 
        "Erreur lors de l'envoi des fichiers"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-none justify-between bg-gray-950 w-90 hover:scale-105 duration-200 mt-15">
      <div className="py-6">
        <div className="grid border-2 border-cyan-400 p-7 rounded-lg">
          <svg
            className="mx-auto"
            width="45"
            height="55"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG inchangé */}
          </svg>
          <div className="grid gap-5 mt-2">
            <h4 className="text-center text-cyan-400 text-l font-medium leading-snug">
              Télécharger les logs ici !
            </h4>
            
            {message && (
              <p className="mt-4 text-l text-cyan-400 mx-auto">
                {message}
                {isUploading && "..."}
              </p>
            )}

            <div className="flex items-center justify-center gap-4">
              <label>
                <input 
                  multiple 
                  onChange={handleFileChange} 
                  type="file" 
                  hidden 
                  disabled={isUploading}
                />
                <div className={`
                  flex w-40 h-9 px-2 flex-col p-4 rounded-xl mt-2 font-semibold 
                  leading-4 items-center justify-center cursor-pointer focus:outline-none
                  ${
                    isUploading 
                      ? 'bg-cyan-600 text-gray-300' 
                      : 'bg-cyan-400 hover:text-cyan-400 hover:bg-gray-950 hover:border-2 border-cyan-400 text-black'
                  }
                `}>
                  {files?.length > 0 ? `${files.length} fichier(s)` : 'Choisir les fichiers'}
                </div>
              </label>
              
              <button
                onClick={handleUpload}
                disabled={isUploading || !files || files.length === 0}
                className={`
                  flex w-28 h-9 px-2 flex-col p-4 rounded-xl mt-2 font-semibold 
                  leading-4 items-center justify-center cursor-pointer focus:outline-none
                  ${
                    isUploading || !files || files.length === 0
                      ? 'bg-cyan-600 text-gray-300 cursor-not-allowed'
                      : 'bg-cyan-400 hover:text-cyan-400 hover:bg-gray-950 hover:border-2 border-cyan-400 text-black'
                  }
                `}
              >
                {isUploading ? 'Envoi...' : 'Télécharger'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploadtest;