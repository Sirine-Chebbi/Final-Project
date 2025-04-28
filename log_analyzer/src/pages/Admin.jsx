import Nav from '../components/Admin/Nav';
import Tablerole from '../components/Admin/Tablerole';
import Tableuser from '../components/Admin/Tableuser';
import Ajouteru from "../components/Admin/Ajouteru";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from "react"

const Admin = () => {

  const [User, setVisibilityuser] = useState(false);
  const [Hidden, setVisibility] = useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      <div className="bg-linear-to-br from-gray-950 to-sky-600 h-fit">
        <Nav></Nav>
        <Ajouteru trigger={User} setVisibilityuser={setVisibilityuser}></Ajouteru>
        <div className="mt-20 flex justify-center">
          <Tableuser User={User} setVisibilityuser={setVisibilityuser} Hidden={Hidden} setVisibility={setVisibility}></Tableuser>
        </div>
        <div className="mt-10">
          <Tablerole></Tablerole>
        </div>
      </div>
    </>
  )
}

export default Admin