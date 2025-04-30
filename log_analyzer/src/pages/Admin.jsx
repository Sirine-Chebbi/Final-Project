import Nav from '../components/Admin/Nav';
/*import Tablerole from '../components/Admin/Tablerole';*/
import Tableuser from '../components/Admin/Tableuser';
import Ajouteru from "../components/Admin/Ajouteru";
import Deleteuser from '../components/Admin/deleteuser';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, useRef } from "react"
import { Toast } from "primereact/toast";
import Modifieruser from '../components/Admin/Modiferuser';


const Admin = () => {

  const [User, setVisibilityuser] = useState(false);
  const [Delete, setVisibilitydelete] = useState(false);
  const [Hidden, setVisibility] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [add, setAdd] = useState(false);
  const [Matricule, setMatricule] = useState("");
  const [Mod, setVisibilitymod] = useState("");
  


  const showErrorToast = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Erreur",
      detail: message,
      life: 4000,
    });
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
};


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
    } else {
      const decoded = jwtDecode(token);
      if (decoded.role != "admin") {
        navigate('/');
      }
    }
  }, [navigate]);

  const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          showErrorToast("Token d'authentification manquant");
          return;
        }
  
        const response = await fetch("http://127.0.0.1:8000/api/auth/users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          showErrorToast("Erreur lors du chargement des utilisateurs");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        showErrorToast("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    fetchUsers(); 
  },[]);

  if (add) {
    fetchUsers();
    setAdd(false);
    showToast('success', 'Utilisateurs Mis à jour avec succés');
  }
  

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <div className="bg-linear-to-br from-gray-950 to-sky-600 pb-30 h-screen min-h-fit">
        <Nav></Nav>
        <Modifieruser setAdd={setAdd} Matricule={Matricule} trigger={Mod} setVisibilitymod={setVisibilitymod}></Modifieruser>
        <Ajouteru setAdd={setAdd} trigger={User} setVisibilityuser={setVisibilityuser}></Ajouteru>
        <Deleteuser setAdd={setAdd} Matricule={Matricule} trigger={Delete} setVisibilitydelete={setVisibilitydelete}></Deleteuser>
        <div className="mt-20 flex justify-center">
          <Tableuser Mod={Mod} setVisibilitymod={setVisibilitymod} setMatricule={setMatricule} users={users} loading={loading} Delete={Delete} setVisibilitydelete={setVisibilitydelete}  User={User} setVisibilityuser={setVisibilityuser} Hidden={Hidden} setVisibility={setVisibility}></Tableuser>
        </div>
        {/*<div className="mt-10 flex justify-center">
          <Tablerole></Tablerole>
        </div>*/}
      </div>
    </>
  )
}

export default Admin