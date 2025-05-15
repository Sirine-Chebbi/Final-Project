import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { jwtDecode } from "jwt-decode";
import { GetUser } from '../../Services/Userservice';


function Adminprofile(props) {

    const [password, setPassword] = useState('');
    const [confirmpassword, setconfirmPassword] = useState('');
    const [oldpassword, setoldPassword] = useState('');
    const [visible, setvisibleState] = useState(true);
    const [matricule, setMatricule] = useState('');
    const [poste, setPoste] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [Mod, setMod] = useState(true);

    const toast = useRef(null);
    const token = localStorage.getItem("access_token");

    let userData = null;

    if (token) {
        try {
            userData = jwtDecode(token);
        } catch (error) {
            console.error("Invalid token", error);
        }
    }

    const [user, setUser] = useState({});

    const fetchUser = async () => {
        try {
            const data = await GetUser(userData.matricule);  // plus besoin de .json()
            setNom(data.nom);
            setPrenom(data.prenom);
            setMatricule(data.matricule);
            setPoste(data.poste);
            setUser(data);
        } catch (err) {
            console.error("Erreur lors de la récupération de l'utilisateur", err);
            showToast('error', 'Erreur', 'Impossible de charger les données de profil.');
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);


    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const passworddata = {
        old_password: oldpassword,
        new_password: password,
        confirm_password: confirmpassword,
    };

    const ModPassword = async () => {
        if (!token) {
            showToast("Token d'authentification manquant");
            return;
        }

        try {
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
                    document.getElementById("pass").value = "";
                    document.getElementById("pass1").value = "";
                    document.getElementById("pass2").value = "";
                } else {
                    showToast('warn', 'Attention', 'Erreur de serveur lors du changement de mot de passe');
                }
            }
        }
        catch (error) {
            console.error("An error occurred:", error);
            showToast('error', 'Erreur', 'Une erreur est survenue');
        }

    };

    const Moddata = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            showToast("Token d'authentification manquant");
            return;
        }
        const data = {
            nom: nom,
            prenom: prenom,
            poste: poste,
            matricule: matricule,
        };
        try {
            const response = await fetch(`http://localhost:8000/api/auth/users/${user.matricule}/`, {
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
                props.setShowProfile(!props.showProfile);
                fetchUser();

            } else {
                showToast('warn', 'Attention', 'Erreur de serveur lors de la modification utilisateur');
            }
        }
        catch (error) {
            console.error("An error occurred:", error);
            showToast('error', 'Erreur', 'Une erreur est survenue');
        }
    }

    const resetpass = () => {
        setPassword("");
        setconfirmPassword("");
        setoldPassword("");
        if (!visible) {
            setvisibleState(!visible);
        }
        document.getElementById("pass").value = "";
        document.getElementById("pass1").value = "";
        document.getElementById("pass2").value = "";
        setNom(user.nom);
        setPrenom(user.prenom);
        setMatricule(user.matricule);
        setPoste(user.poste);
        setMod(true);
    }

    const check = () => {
        if (
            user.nom !== nom ||
            user.prenom !== prenom ||
            user.poste !== poste ||
            user.matricule !== matricule
        ) {
            setMod(false);
        } else {
            setMod(true);
        }
    };

    useEffect(() => {
        check();
    }, [nom, prenom, poste, matricule]);


    return props.trigger ? (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
            <Toast ref={toast} position="top-center" />
            <div className="place-self-center duration-200 border-3 border-cyan-400 rounded-2xl overflow-y-auto">
                <div className="backdrop-blur-2xl w-160 h-fit rounded-2xl p-5">
                    <div className='flex justify-self-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="oklch(78.9% 0.154 211.53)" className="size-40">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <div className='mb-10 mt-5 justify-center flex'>
                        <table>
                            <tr>
                                <td className='p-2'>
                                    <input onChange={(e) => { setNom(e.target.value); if (user.nom !== e.target.value) { setMod(false) } else { check() }; }} required type="text" value={nom} placeholder='nom' className={`m-2 border-b-2 border-cyan-400 p-2 w-50 text-cyan-400 outline-none ${user.nom !== nom ? 'border-red-500' : ''}`} />
                                </td>
                                <td className='p-2'>
                                    <input onChange={(e) => { setPrenom(e.target.value); if (user.prenom !== e.target.value) { setMod(false) } else { check() }; }} required type="text" value={prenom} placeholder='prenom' className={`m-2 border-b-2 border-cyan-400 p-2 text-cyan-400 outline-none ${user.prenom !== prenom ? 'border-red-500' : ''}`} />
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2'>
                                    <input onChange={(e) => { setPoste(e.target.value); if (user.poste !== e.target.value) { setMod(false) } else { check() }; }} required type="text" value={poste} placeholder='poste' className={`m-2 border-b-2 border-cyan-400 p-2 text-cyan-400 outline-none ${user.poste !== poste ? 'border-red-500' : ''}`}
                                    />
                                </td>
                                <td className='p-2'>
                                    <input onChange={(e) => { setMatricule(e.target.value); if (user.matricule !== e.target.value) { setMod(false) } else { check() }; }} required type="text" value={matricule} placeholder='matricule' className={`m-2 border-b-2 border-cyan-400 p-2 text-cyan-400 outline-none ${user.matricule !== matricule ? 'border-red-500' : ''}`}
                                    />
                                </td>
                            </tr>
                            <tr hidden={visible}>
                                <td className='p-2 pt-10'>
                                    <input onChange={(e) => { setoldPassword(e.target.value) }} required id="pass" type="text" placeholder='Mot de passe recente' className={`m-2 border-2 rounded-lg border-cyan-400 p-2 text-cyan-400 outline-none`}
                                    />
                                </td>
                                <td className='p-2 pt-10'>
                                    <input onChange={(e) => { setPassword(e.target.value) }} required id="pass1" type="text" placeholder='Nouvelle Mot de passe' className={`m-2 border-2 border-cyan-400 p-2 rounded-lg text-cyan-400/60 outline-none`}
                                    />
                                </td>
                            </tr>
                            <tr hidden={visible}>
                                <td className='p-2'>
                                    <input onChange={(e) => { setconfirmPassword(e.target.value) }} required id="pass2" type="text" placeholder='Confirmer Mot de passe' className={`m-2 border-2 rounded-lg border-cyan-400 p-2 text-cyan-400 outline-none ${password !== confirmpassword ? 'border-red-500' : ''}`}
                                    />
                                </td>
                                <td className='p-2'>
                                    <button onClick={() => ModPassword()} className='font-bold place-self-center w-60 grid border-2 border-cyan-400 rounded-lg p-2 text-black bg-cyan-400 hover:bg-black/0 hover:text-cyan-400 cursor-pointer duration-200 hover:shadow-cyan-400 shadow-md font-mono'>Changer</button>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div className='flex gap-5 mb-2'>
                            <button onClick={() => setvisibleState(!visible)} className='font-bold place-self-center w-80 grid border-2 border-cyan-400 rounded-lg m-1 p-3 text-black bg-cyan-400 hover:bg-black/0 hover:text-cyan-400 cursor-pointer duration-200 hover:shadow-cyan-400 shadow-md font-mono'
                            >
                                Change votre Mot de passe
                            </button>
                            <button onClick={() => Moddata()} hidden={Mod} className='font-bold place-self-center w-40 grid border-2 border-emerald-500 rounded-lg m-1 p-3 text-black bg-emerald-400 hover:bg-black/0 hover:text-emerald-400 cursor-pointer duration-200 hover:shadow-emerald-400 shadow-md font-mono'
                            >
                                Modifier
                            </button>
                            <button onClick={() => props.setShowProfile(!props.showProfile) | resetpass()} className={`font-bold place-self-center  ${Mod ? 'w-80' : 'w-40'} grid border-2 border-red-500 rounded-lg m-1 p-3 text-black bg-red-500 hover:bg-black/0 hover:text-red-500 cursor-pointer duration-200 hover:shadow-red-500 shadow-md font-mono`}
                            >
                                Quitter
                            </button>
                    </div>
                </div>
            </div>
        </div>
    ) : "";
}

Adminprofile.propTypes = {
    trigger: PropTypes.bool.isRequired,
    setShowProfile: PropTypes.func.isRequired,
    showProfile: PropTypes.bool.isRequired,
    setAdd: PropTypes.func.isRequired
};


export default Adminprofile;
