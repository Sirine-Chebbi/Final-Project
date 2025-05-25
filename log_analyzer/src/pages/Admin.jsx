import Nav from '../components/Admin/Nav';
import Tableuser from '../components/Admin/Tableuser';
import Ajouteru from "../components/Admin/Ajouteru";
import Deleteuser from '../components/Admin/Deleteuser';

import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from "../Services/api"
import { useState, useEffect, useRef } from "react"
import { Toast } from "primereact/toast";
import Modifieruser from '../components/Admin/Modiferuser';
import Adminprofile from '../components/Admin/Adminprofile';
import Track from '../components/Admin/track';


const Admin = () => {
  const [User, setVisibilityuser] = useState(false);
  const [Delete, setVisibilitydelete] = useState(false);
  const [Hidden, setVisibility] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  const [users, setUsers] = useState([]);
  const [track, setTrack] = useState([]);

  const [loading, setLoading] = useState(true);
  const [add, setAdd] = useState(false);
  const [Matricule, setMatricule] = useState("");
  const [Mod, setVisibilitymod] = useState("");

  const [showProfile, setShowProfile] = useState(false);



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
    const verifyAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== "admin") {
          navigate('/');
        }

        await api.get('auth/verify/');
      } catch (error) {
        console.error("Auth verification error:", error);
        navigate('/');
      }
    };

    verifyAuth();
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

  const fetchtrack = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showErrorToast("Token d'authentification manquant");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/track/list/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrack(data);
      } else {
        showErrorToast("Erreur lors du chargement des historique");
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
    fetchtrack();
  }, []);

  if (add) {
    fetchUsers();
    setAdd(false);
    showToast('success', 'Utilisateurs Mis à jour avec succés');
  }


  return (
    <>
      <Toast ref={toast} position="top-center" />
      <div className="bg-[url(/assets/Dashboard.jpg)] bg-cover pb-30 h-screen min-h-fit">
        <Nav showProfile={showProfile} setShowProfile={setShowProfile}></Nav>
        <Adminprofile setAdd={setAdd} trigger={showProfile} showProfile={showProfile} setShowProfile={setShowProfile}></Adminprofile>
        <Modifieruser setAdd={setAdd} Matricule={Matricule} trigger={Mod} setVisibilitymod={setVisibilitymod}></Modifieruser>
        <Ajouteru setAdd={setAdd} trigger={User} setVisibilityuser={setVisibilityuser}></Ajouteru>
        <Deleteuser setAdd={setAdd} Matricule={Matricule} trigger={Delete} setVisibilitydelete={setVisibilitydelete}></Deleteuser>
        <div className="mt-15 flex justify-center mb-20">
          <Tableuser Mod={Mod} setVisibilitymod={setVisibilitymod} setMatricule={setMatricule} users={users} loading={loading} Delete={Delete} setVisibilitydelete={setVisibilitydelete} User={User} setVisibilityuser={setVisibilityuser} Hidden={Hidden} setVisibility={setVisibility}></Tableuser>
        </div>
        <Track track={track} loading={loading}></Track>
        {/*<div className="mt-10 flex justify-center">
          <Tablerole></Tablerole>
        </div>*/}
      </div>
    </>
  )
}

export default Admin