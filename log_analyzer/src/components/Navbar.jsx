import { Link } from "react-router-dom";

const Navbar = () => {

  return (
    <header className="">
      <div className="p-10" id="upload">
        <div className="flex h-16 items-center justify-between">
          <div className="md:flex ml-5">
            <Link to="/">
              { <img className="h-40 justify-self: start;" alt="sagemcom" src="../src/assets/logo.png"/> }  
            </Link>
          </div>
          <div className="flex gap-15 mr-20 text-xl">
            <Link to="/nft" className="hover:scale-115 duration-200 text-cyan-400 font-bold hover:text-cyan-300 hover:border-b-2">Divers Testeurs</Link>
            <Link to="/wifi" className="hover:scale-115 duration-200 text-cyan-400 font-bold hover:text-cyan-300 hover:border-b-2">Wifi Conduit</Link>
            <Link to="/test" className="hover:scale-115 duration-200 text-cyan-400 font-bold hover:text-cyan-300 hover:border-b-2">Environnement De Test</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar