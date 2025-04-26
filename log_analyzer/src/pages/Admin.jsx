import Nav from '../components/Admin/Nav';
import Tablerole from '../components/Admin/Tablerole';
import Tableuser from '../components/Admin/Tableuser';

const Admin = () => {

  return (
    <>
      <div className="bg-linear-to-br from-gray-950 to-sky-600 h-screen">
        <Nav></Nav>
        <div className="mt-20 flex justify-center">
          <Tableuser></Tableuser>
        </div>
        <div className="mt-10">
          <Tablerole></Tablerole>
        </div>
      </div>
    </>
  )
}

export default Admin