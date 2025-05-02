import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { GetUser } from '../../Services/Userservice';

function Modifieruser(props) {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [matricule, setMatricule] = useState('');
    const [role, setRole] = useState(0);
    const [poste, setPoste] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setconfirmPassword] = useState('');
    const toast = useRef(null);

    const [user, setUser] = useState({});

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const fetchUser = async () => {
        const data = await GetUser(props.Matricule);
        setNom(data.nom);
        setPrenom(data.prenom);
        setMatricule(data.matricule);
        setPoste(data.poste);
        setRole(data.role);
        setUser(data);
    };

    useEffect(() => {
        fetchUser();
    }, [props.Matricule]);

    const resetvalues = async () => {
        fetchUser();
        setPassword("");
        setconfirmPassword("");
    };


    const data = {
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        poste: poste,
        role: role,
    };

    const passworddata = {
        matricule: matricule,
        new_password: password,
        confirm_password: confirmpassword
    };



    const ModUsers = async (mat) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            showToast("Token d'authentification manquant");
            return;
        }
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${mat}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                showToast('success', 'Utilisateur modifié avec succès');
                props.setAdd(true);
            } else {
                showToast('warn', 'Attention', 'Erreur de serveur lors de la modification utilisateur');
            }
    
            if (confirmpassword !== "") {
                const passwordResponse = await fetch(`http://127.0.0.1:8000/api/auth/change-password/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passworddata),
                });
    
                if (passwordResponse.ok) {
                    showToast('success', 'Mot de passe mis à jour avec succès');
                    props.setAdd(true);
                } else {
                    showToast('warn', 'Attention', 'Erreur de serveur lors du changement de mot de passe');
                }
            }
    
        } catch (error) {
            console.error("An error occurred:", error);
            showToast('error', 'Erreur', 'Une erreur est survenue');
        }

        props.setVisibilitymod(false)
        props.setAdd(true)
    };
    
        return props.trigger ? (
            <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
                <Toast ref={toast} position="top-center" />
                <div className="place-self-center duration-200 border-3 border-cyan-400 rounded-2xl overflow-y-auto">
                    <div className="backdrop-blur-2xl w-130 h-fit rounded-2xl p-5">
                        <div className='mb-10'>
                            <h3 className='ml-2 font-mono text-cyan-400 text-xl'>Informations personelles</h3>
                            <input onChange={(e) => setNom(e.target.value)} required type="text" value={nom} placeholder='Nom' className={`m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none ${user.nom !== nom ? 'border-red-500' : ''}`}
                            /><br />
                            <input onChange={(e) => setPrenom(e.target.value)} required type="text" value={prenom} placeholder='Prenom' className={`m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none ${user.prenom !== prenom ? 'border-red-500' : ''}`}
                            /><br />
                            <input onChange={(e) => setPoste(e.target.value)} required type="text" value={poste} placeholder='Poste' className={`m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none ${user.poste !== poste ? 'border-red-500' : ''}`}
                            /><br />
                            <br />

                            <h3 className='ml-2 font-mono text-cyan-400 text-xl'>Informations de connection</h3>
                            <input disabled onChange={(e) => setMatricule(e.target.value)} required type="text" value={matricule} placeholder='Matricule' className={`m-2 border-2 border-cyan-400/60 rounded-lg p-2 text-cyan-400/60 outline-none`}
                            /><br />
                            <input onChange={(e) => setPassword(e.target.value)} type="text" placeholder='Nouveau Mot de passe' className={`m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none `}
                            /><br />
                            <input onChange={(e) => setconfirmPassword(e.target.value)} type="text" placeholder='Confirmé le Mot de passe' className={`m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none ${password !== confirmpassword ? 'border-red-500' : ''}`}
                            /><br />
                            <div className='m-2 border-2 border-cyan-400 p-2 w-fit rounded-lg '>
                                <select required onChange={(e) => setRole(e.target.value)} value={role} className={`text-cyan-400 outline-none w-50 ${user.role !== role ? 'text-red-500' : ''}`}
                                >
                                    <option value="1" className='text-black'>Admin</option>
                                    <option value="2" className='text-black'>Utilisateur</option>
                                </select>
                            </div>
                        </div>
                        <div className='flex gap-5'>
                            <button onClick={() => {password == confirmpassword ? ModUsers(props.Matricule) : showToast('error', 'Erreur', 'Mot de passe est incorrecte !')}} className='font-bold place-self-center w-80 grid border-2 border-cyan-400 rounded-lg m-1 p-3 text-black bg-cyan-400 hover:bg-black/0 hover:text-cyan-400 cursor-pointer duration-200 hover:shadow-cyan-400 shadow-md font-mono'
                            >
                                Modifier
                            </button>
                            <button onClick={() => props.setVisibilitymod(false) | resetvalues()} className='font-bold place-self-center w-80 grid border-2 border-red-500 rounded-lg m-1 p-3 text-black bg-red-500 hover:bg-black/0 hover:text-red-500 cursor-pointer duration-200 hover:shadow-red-500 shadow-md font-mono'
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : "";
    }

    Modifieruser.propTypes = {
        trigger: PropTypes.bool.isRequired,
        setVisibilitymod: PropTypes.func.isRequired,
        setAdd: PropTypes.func.isRequired,
        Matricule: PropTypes.string.isRequired,
    };

    export default Modifieruser;
