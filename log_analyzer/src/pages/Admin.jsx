import Nav from '../components/Admin/Nav';
import Tablerole from '../components/Admin/Tablerole';
import Tableuser from '../components/Admin/Tableuser';
import Ajouteru from "../components/Admin/Ajouteru";

import {useState} from "react"

const Admin = () => {
  
    const [User, setVisibilityuser] = useState(false);
    const [Hidden, setVisibility] = useState(false);

  return (
    <>
      <div className="bg-linear-to-br from-gray-950 to-sky-600 h-screen">
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