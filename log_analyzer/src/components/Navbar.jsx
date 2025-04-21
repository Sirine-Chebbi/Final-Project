import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="">
      <div className="p-10" id="upload">
        <div className="flex h-16 items-center justify-between">
          <div className="md:flex ml-5">
            <NavLink to="/">
              { <img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png"/> }  
            </NavLink>
          </div>
          <div className="flex gap-15 mr-20 text-xl">
            <NavLink 
              to="/nft" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-yellow-400 scale-115 hover:text-yellow-400" : "text-cyan-400"
                }`
              }
            >
              Divers Testeurs
            </NavLink>
            <NavLink 
              to="/wifi" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-yellow-400 scale-115 hover:text-yellow-400" : "text-cyan-400"
                }`
              }
            >
              Wifi Conduit
            </NavLink>
            <NavLink 
              to="/test" 
              className={({isActive}) => 
                `hover:scale-115 duration-200 font-bold hover:text-cyan-300 ${
                  isActive ? "text-yellow-400 scale-115 hover:text-yellow-400" : "text-cyan-400"
                }`
              }
            >
              Environnement De Test
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar;