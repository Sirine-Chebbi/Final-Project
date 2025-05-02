import { useState } from "react";
import api from "../../Services/api";
import { useNavigate } from "react-router-dom";
import { authService } from "../../Services/authService";

const UploadTemps = ({ onUploadSuccess }) => {
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
      formData.append("files", file);
    });

    try {
      setIsUploading(true);
      setMessage("Analyse des fichiers...");

      const response = await api.post(
        "temps-test/upload-temps-test/",
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
        await onUploadSuccess();
      }

    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      
      if (error.response?.status === 401) {
        try {
          const newToken = await authService.refreshToken();
          localStorage.setItem('access_token', newToken);
          await handleUpload();
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
            <g id="File">
              <path
                id="icon"
                d="M31.6497 10.6056L32.2476 10.0741L31.6497 10.6056ZM28.6559 7.23757L28.058 7.76907L28.058 7.76907L28.6559 7.23757ZM26.5356 5.29253L26.2079 6.02233L26.2079 6.02233L26.5356 5.29253ZM33.1161 12.5827L32.3683 12.867V12.867L33.1161 12.5827ZM31.8692 33.5355L32.4349 34.1012L31.8692 33.5355ZM24.231 11.4836L25.0157 11.3276L24.231 11.4836ZM26.85 14.1026L26.694 14.8872L26.85 14.1026ZM11.667 20.8667C11.2252 20.8667 10.867 21.2248 10.867 21.6667C10.867 22.1085 11.2252 22.4667 11.667 22.4667V20.8667ZM25.0003 22.4667C25.4422 22.4667 25.8003 22.1085 25.8003 21.6667C25.8003 21.2248 25.4422 20.8667 25.0003 20.8667V22.4667ZM11.667 25.8667C11.2252 25.8667 10.867 26.2248 10.867 26.6667C10.867 27.1085 11.2252 27.4667 11.667 27.4667V25.8667ZM20.0003 27.4667C20.4422 27.4667 20.8003 27.1085 20.8003 26.6667C20.8003 26.2248 20.4422 25.8667 20.0003 25.8667V27.4667ZM23.3337 34.2H16.667V35.8H23.3337V34.2ZM7.46699 25V15H5.86699V25H7.46699ZM32.5337 15.0347V25H34.1337V15.0347H32.5337ZM16.667 5.8H23.6732V4.2H16.667V5.8ZM23.6732 5.8C25.2185 5.8 25.7493 5.81639 26.2079 6.02233L26.8633 4.56274C26.0191 4.18361 25.0759 4.2 23.6732 4.2V5.8ZM29.2539 6.70608C28.322 5.65771 27.7076 4.94187 26.8633 4.56274L26.2079 6.02233C26.6665 6.22826 27.0314 6.6141 28.058 7.76907L29.2539 6.70608ZM34.1337 15.0347C34.1337 13.8411 34.1458 13.0399 33.8638 12.2984L32.3683 12.867C32.5216 13.2702 32.5337 13.7221 32.5337 15.0347H34.1337ZM31.0518 11.1371C31.9238 12.1181 32.215 12.4639 32.3683 12.867L33.8638 12.2984C33.5819 11.5569 33.0406 10.9662 32.2476 10.0741L31.0518 11.1371ZM16.667 34.2C14.2874 34.2 12.5831 34.1983 11.2872 34.0241C10.0144 33.8529 9.25596 33.5287 8.69714 32.9698L7.56577 34.1012C8.47142 35.0069 9.62375 35.4148 11.074 35.6098C12.5013 35.8017 14.3326 35.8 16.667 35.8V34.2ZM5.86699 25C5.86699 27.3344 5.86529 29.1657 6.05718 30.593C6.25217 32.0432 6.66012 33.1956 7.56577 34.1012L8.69714 32.9698C8.13833 32.411 7.81405 31.6526 7.64292 30.3798C7.46869 29.0839 7.46699 27.3796 7.46699 25H5.86699ZM23.3337 35.8C25.6681 35.8 27.4993 35.8017 28.9266 35.6098C30.3769 35.4148 31.5292 35.0069 32.4349 34.1012L31.3035 32.9698C30.7447 33.5287 29.9863 33.8529 28.7134 34.0241C27.4175 34.1983 25.7133 34.2 23.3337 34.2V35.8ZM32.5337 25C32.5337 27.3796 32.532 29.0839 32.3577 30.3798C32.1866 31.6526 31.8623 32.411 31.3035 32.9698L32.4349 34.1012C33.3405 33.1956 33.7485 32.0432 33.9435 30.593C34.1354 29.1657 34.1337 27.3344 34.1337 25H32.5337ZM7.46699 15C7.46699 12.6204 7.46869 10.9161 7.64292 9.62024C7.81405 8.34738 8.13833 7.58897 8.69714 7.03015L7.56577 5.89878C6.66012 6.80443 6.25217 7.95676 6.05718 9.40704C5.86529 10.8343 5.86699 12.6656 5.86699 15H7.46699ZM16.667 4.2C14.3326 4.2 12.5013 4.1983 11.074 4.39019C9.62375 4.58518 8.47142 4.99313 7.56577 5.89878L8.69714 7.03015C9.25596 6.47133 10.0144 6.14706 11.2872 5.97592C12.5831 5.8017 14.2874 5.8 16.667 5.8V4.2ZM23.367 5V10H24.967V5H23.367ZM28.3337 14.9667H33.3337V13.3667H28.3337V14.9667ZM23.367 10C23.367 10.7361 23.3631 11.221 23.4464 11.6397L25.0157 11.3276C24.9709 11.1023 24.967 10.8128 24.967 10H23.367ZM28.3337 13.3667C27.5209 13.3667 27.2313 13.3628 27.0061 13.318L26.694 14.8872C27.1127 14.9705 27.5976 14.9667 28.3337 14.9667V13.3667ZM23.4464 11.6397C23.7726 13.2794 25.0543 14.5611 26.694 14.8872L27.0061 13.318C26.0011 13.1181 25.2156 12.3325 25.0157 11.3276L23.4464 11.6397ZM11.667 22.4667H25.0003V20.8667H11.667V22.4667ZM11.667 27.4667H20.0003V25.8667H11.667V27.4667ZM32.2476 10.0741L29.2539 6.70608L28.058 7.76907L31.0518 11.1371L32.2476 10.0741Z"
                fill="oklch(0.789 0.154 211.53)"
              />
            </g>
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

export default UploadTemps;