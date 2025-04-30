import PropTypes from 'prop-types';
import { Toast } from "primereact/toast";
import { useRef, useEffect, useState } from "react"
import { GetUser } from '../Services/Userservice';

const Deleteuser = (props) => {

    const [User, setUser] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const response = await GetUser(props.Matricule);
            const data = await response.json();
            setUser(data);
        };

        fetchUser();
    }, [props.Matricule]);


    const toast = useRef(null);

    const showErrorToast = (message) => {
        toast.current.show({
            severity: "error",
            summary: "Erreur",
            detail: message,
            life: 4000,
        });
    };

    const DeleteUsers = async (mat) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                showErrorToast("Token d'authentification manquant");
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${mat}/`, {
                method: "Delete",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                props.setAdd(true);
                props.setVisibilitydelete(false)
            } else {
                showErrorToast("Erreur lors du chargement des utilisateurs");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showErrorToast("Erreur de connexion au serveur");
        }
    };

    return (props.trigger) ? (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
            <Toast ref={toast} position="top-center" />
            <div className="place-self-center duration-200 border-3 border-cyan-400 rounded-2xl overflow-y-auto">
                <div className="backdrop-blur-2xl w-150 h-fit rounded-2xl p-5">
                    <div className='mb-10 text-center'>
                        <h1 className='text-2xl text-cyan-400 p-5'>Supprimer l&apos;utilisateur <span className='text-red-500'>{User.nom} {User.prenom}</span> ?</h1>
                    </div>
                    <div className='flex gap-5'>
                        <button onClick={() => DeleteUsers(props.Matricule)} className='font-bold place-self-center w-80 grid border-2 border-cyan-400 rounded-lg m-1 p-3 text-black bg-cyan-400 hover:bg-black/0 hover:text-cyan-400 cursor-pointer duration-200 hover:shadow-cyan-400 shadow-md font-mono'>Supprimer</button>
                        <button onClick={() => props.setVisibilitydelete(false)} className='font-bold place-self-center w-80 grid border-2 border-red-500 rounded-lg m-1 p-3 text-black bg-red-500 hover:bg-black/0 hover:text-red-500 cursor-pointer duration-200 hover:shadow-red-500 shadow-md font-mono'>Annuler</button>
                    </div>
                </div>
            </div>
        </div >
    )
        : "";
}

Deleteuser.propTypes = {
    trigger: PropTypes.bool.isRequired,
    setVisibilityuser: PropTypes.func.isRequired,
    setVisibilitydelete: PropTypes.func.isRequired,
    Matricule: PropTypes.string.isRequired,
    setAdd: PropTypes.func.isRequired,
};

export default Deleteuser