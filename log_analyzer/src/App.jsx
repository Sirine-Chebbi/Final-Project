import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Wifi_Conduit from "./pages/Wifi_Conduit";
import Test_Wifi from "./pages/Test_Wifi";
import Sign_in from "./pages/Sign_in";
import NFT from "./pages/NFT";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Wifi_Conduit/>} />
        <Route path="/test" element={<Test_Wifi/>} />
        <Route path="/Sign_in" element={<Sign_in/>} />
        <Route path="/nft" element={<NFT/>} />
      </Routes>
    </Router>
  );
}

export default App;
