import PropTypes from 'prop-types';
import { useState, useRef } from "react"
import { Toast } from "primereact/toast";


function Ajouteru(props) {

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [matricule, setMatricule] = useState('');
    const [motdpass, setMotdpass] = useState('');
    const [role, setRole] = useState(2);
    const [poste, setPoste] = useState('');
    const toast = useRef(null);

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const data = {
        "matricule": matricule,
        "nom": nom,
        "prenom": prenom,
        "poste": poste,
        "role_id": role,
        "password": motdpass,
    }

    const AddUser = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                showToast("Token d'authentification manquant");
                return;
            }
            const response = await fetch("http://localhost:8000/api/auth/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showToast('success', 'Utilisateur ajouté avec succés');
                props.setAdd(true);
            } else {
                const errorData = await response.json();
                if (errorData) {
                    if (errorData.matricule) {
                        showToast('warn', 'Attention', "Matricule deja existe !");
                    }
                    else {
                        showToast('warn', 'Attention', errorData.detail || "Erreur lors de la creation");
                    }
                }
            }
        } catch (error) {
            console.error("An error occurred while adding the user:", error);
            showToast('error', 'Erreur', 'Une erreur est survenue');
        }
    }

    return (props.trigger) ? (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
            <Toast ref={toast} position="top-center" />
            <div className="place-self-center duration-200 border-3 border-cyan-400 rounded-2xl overflow-y-auto">
                <div className="backdrop-blur-2xl w-130 h-fit rounded-2xl p-5">
                    <button onClick={() => props.setVisibilityuser(false)} className="p-2 place-self-end grid group cursor-pointer hover:scale-120 duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(78.9% 0.154 211.53)" className="size-12 group-hover:stroke-red-500 duration-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                    <form action={AddUser}>
                        <div className='-mt-10 mb-10'>
                            <h3 className='ml-2 font-mono text-cyan-400 text-xl'>Informations personelles</h3>
                            <input onChange={(e) => setNom(e.target.value)} required type="text" placeholder='Nom' className='m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none' /><br />
                            <input onChange={(e) => setPrenom(e.target.value)} required type="text" placeholder='Prenom' className='m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none' /><br />
                            <input onChange={(e) => setPoste(e.target.value)} required type="text" placeholder='Poste' className='m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none' /><br />
                            <br />

                            <h3 className='ml-2 font-mono text-cyan-400 text-xl'>Informations de connection</h3>
                            <input onChange={(e) => setMatricule(e.target.value)} required type="text" placeholder='Matricule' className='m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none' /><br />
                            <input onChange={(e) => setMotdpass(e.target.value)} required type="text" placeholder='Mot de passe' className='m-2 border-2 border-cyan-400 rounded-lg p-2 text-cyan-400 outline-none' /><br />
                            <div className='m-2 border-2 border-cyan-400 p-2 w-fit rounded-lg '>
                                <select id="" required onChange={(e) => setRole(e.target.value)} className='text-cyan-400 outline-none w-50'>
                                    <option onClick={(e) => setRole(Number(e.target.value))} value="2" className='text-black'>Utilisateur</option>
                                    <option onClick={(e) => setRole(Number(e.target.value))} value="1" className='text-black'>Admin</option>
                                </select>
                            </div>
                        </div>
                        <button className='font-bold place-self-center w-80 grid border-2 border-cyan-400 rounded-lg m-1 p-3 text-black bg-cyan-400 hover:bg-black/0 hover:text-cyan-400 cursor-pointer duration-200 hover:shadow-cyan-400 shadow-md font-mono'>Ajouter</button>
                    </form>
                </div>
            </div>
        </div >
    )
        : "";
}
Ajouteru.propTypes = {
    trigger: PropTypes.bool.isRequired,
    setVisibilityuser: PropTypes.func.isRequired,
    setAdd: PropTypes.func.isRequired
};

export default Ajouteru