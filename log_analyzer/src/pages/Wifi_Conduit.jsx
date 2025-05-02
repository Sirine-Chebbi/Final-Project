import './wifi.css'
import { useState, useEffect } from "react";
import Upload from "../components/Wifi_Conduit/Upload"
import Table from "../components/Wifi_Conduit/Table"
import Menu from "../components/Wifi_Conduit/Menu"
import ExportAllGraphs from "../components/Wifi_Conduit/Graphs/ExportAllGraphs";
import Rssigraph from "../components/Wifi_Conduit/Graphs/Rssigraph"
import Powergraph from "../components/Wifi_Conduit/Graphs/Powergraph"
import Evmgraph from "../components/Wifi_Conduit/Graphs/Evmgraph"
import Deltagraph from "../components/Wifi_Conduit/Graphs/Deltagraph"
import Delta from "../components/Wifi_Conduit/Delta"
import Filters from "../components/Wifi_Conduit/Filters"
import api from '../Services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/authService"; // Importez le service d'authentification

function Wifi_Conduit() {
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedAntenne, setSelectedAntenne] = useState(""); 
  const [selectedCaisson, setSelectedCaisson] = useState(""); 
  const [selectedVisibility, setVisibility] = useState("hidden");
  const [selectedRessource, setSelectedRessource] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [Results, setfetchResult] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await api.get("wifi-conduit/results/without-delta-desc/");
      setTestResults(response.data.results);
      // Réinitialiser les résultats filtrés après un nouveau chargement
      setFilteredResults(response.data.results);
    } catch (error) {
      console.error("Error fetching test results", error);
      if (error.response?.status === 401) {
        try {
          const newToken = await authService.refreshToken();
          localStorage.setItem('access_token', newToken);
          const retryResponse = await api.get("wifi-conduit/results/without-delta-desc/");
          setTestResults(retryResponse.data.results);
          setFilteredResults(retryResponse.data.results);
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, [navigate]);

  // Fonction pour rafraîchir les données après un upload réussi
  const handleUploadSuccess = async () => {
    await fetchTestResults(); // Recharge les données
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <Menu />   
      <div className="pr-30 pl-60 mb-10">
        <div className="flex justify-between mt-10">
          <Upload onUploadSuccess={handleUploadSuccess} /> 
          <Delta setfetchResult={setfetchResult} />
        </div>
        <Filters 
          testResults={testResults} 
          setSelectedFrequency={setSelectedFrequency} 
          setSelectedAntenne={setSelectedAntenne} 
          setVisibility={setVisibility} 
          setSelectedCaisson={setSelectedCaisson} 
          setSelectedRessource={setSelectedRessource} 
        />
        <Table 
          testResults={testResults} 
          selectedFrequency={selectedFrequency} 
          selectedAntenne={selectedAntenne} 
          selectedVisibility={selectedVisibility} 
          setFilteredResults={setFilteredResults} 
          setSelectedCaisson={setSelectedCaisson} 
          selectedRessource={selectedRessource} 
        />
        <ExportAllGraphs
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson}
          Results={Results}
        />
        <p id="pwr"></p>
        <Powergraph filteredResults={filteredResults} selectedCaisson={selectedCaisson} />
        <p id="evm"></p>
        <Evmgraph filteredResults={filteredResults} selectedCaisson={selectedCaisson} />
        <p id="rssi"></p>
        <Rssigraph filteredResults={filteredResults} selectedCaisson={selectedCaisson} />
        <p id="deltagraph"></p>
        <Deltagraph Results={Results} selectedCaisson={selectedCaisson} />
      </div> 
    </>
  );
}

export default Wifi_Conduit;