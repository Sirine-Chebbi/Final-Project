import { useState } from "react";
import axios from "axios";

const UploadNFT = () => {
  const [files, setFiles] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setFiles(event.target.files);
    setMessage(""); // Reset message when new files are selected
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage("Veuillez sélectionner au moins un fichier.");
      return;
    }
  
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append("nft_files", file);
      console.log("Fichier ajouté:", file.name, file.size, file.type);
    });
  
    try {
      setIsUploading(true);
      setMessage("Analyse des fichiers...");
      
      const response = await axios.post(
        "http://127.0.0.1:8000/api/wifi-nft/upload-nft-results/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: progress => {
            setMessage(`Envoi... ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        }
      );
  
      console.log("Réponse complète:", response);
      
      if (response.data.errors) {
        setMessage(
          `${response.data.message}\n` +
          `Erreurs: ${response.data.errors.join('\n')}`
        );
      } else {
        setMessage(response.data.message);
        setTimeout(() => window.location.reload(), 2000);
      }
  
    } catch (error) {
      console.error("Erreur complète:", error);
      let errorDetails = "";
      
      if (error.response) {
        errorDetails = `Serveur: ${error.response.status}\n${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorDetails = "Pas de réponse du serveur";
      } else {
        errorDetails = error.message;
      }
      
      setMessage(`Échec: ${errorDetails}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-none justify-center justify-self-center w-300 hover:scale-105 duration-200">
      <div className="border-2 flex justify-between border-cyan-400 p-3 rounded-2xl shadow-lg hover:shadow-cyan-400">
        <div className="flex gap-10 text-xl ml-5">
          <svg
            className="mx-auto"
            width="45"
            height="55"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Votre SVG ici */}
          </svg>
          <h4 className="text-cyan-400 place-self-center">
            Télécharger les logs ici !
          </h4>
        </div>
        
        {message && (
          <div className="flex items-center">
            <p className="text-l text-cyan-400 mx-auto max-w-xs">
              {message}
              {isUploading && " (en cours...)"}
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
            <div className={`flex w-40 h-9 px-2 flex-col hover:text-cyan-300 hover:bg-gray-950 hover:border-2 p-5 ${
              isUploading ? 'bg-cyan-500' : 'bg-cyan-300'
            } rounded-xl mt-2 text-black font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none`}>
              {files?.length > 0 ? `${files.length} fichier(s)` : 'Choisir les fichiers'}
            </div>
          </label>
          <button
            onClick={handleUpload}
            disabled={isUploading || !files || files.length === 0}
            className={`flex w-28 h-9 px-2 flex-col hover:text-cyan-300 hover:bg-gray-950 hover:border-2 p-5 ${
              isUploading ? 'bg-cyan-500' : 'bg-cyan-300'
            } rounded-xl mt-2 text-black font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none`}
          >
            {isUploading ? 'Envoi...' : 'Télécharger'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadNFT;