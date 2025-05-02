import Nav from '../components/Admin/Nav';
import Tablerole from '../components/Admin/Tablerole';
import Tableuser from '../components/Admin/Tableuser';
import Ajouteru from "../components/Admin/Ajouteru";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from "react"
import api from "../Services/api"


const Admin = () => {
  const [User, setVisibilityuser] = useState(false);
  const [Hidden, setVisibility] = useState(false);
  const navigate = useNavigate();

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
  return (
    <>
      <div className="bg-linear-to-br from-gray-950 to-sky-600 h-fit">
        <Nav></Nav>
        <Ajouteru trigger={User} setVisibilityuser={setVisibilityuser}></Ajouteru>
        <div className="mt-20 flex justify-center">
          <Tableuser User={User} setVisibilityuser={setVisibilityuser} Hidden={Hidden} setVisibility={setVisibility}></Tableuser>
        </div>

      </div>
    </>
  )
}

export default Admin