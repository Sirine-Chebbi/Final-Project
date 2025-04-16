import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Wifi_Conduit from "./pages/Wifi_Conduit";
import Test_Wifi from "./pages/Test_Wifi";
import Sign_in from "./pages/Sign_in";
import NFT from "./pages/NFT";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/wifi" element={<Wifi_Conduit/>} />
        <Route path="/test" element={<Test_Wifi/>} />
        <Route path="/" element={<Sign_in/>} />
        <Route path="/nft" element={<NFT/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </Router>
  );
}

export default App;
