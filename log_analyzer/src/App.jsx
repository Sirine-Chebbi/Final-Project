import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Wifi_Conduit from "./pages/Wifi_Conduit";
import Test_Wifi from "./pages/Test_Wifi";
import Sign_in from "./pages/Sign_in";
import NFT from "./pages/NFT";
import Temps from "./pages/Temps";
import Admin from "./pages/Admin";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";


function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <Routes>
          <Route path="/wifi" element={<Wifi_Conduit />} />
          <Route path="/test" element={<Test_Wifi />} />
          <Route path="/" element={<Sign_in />} />
          <Route path="/nft" element={<NFT />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tmp" element={<Temps />} />
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
