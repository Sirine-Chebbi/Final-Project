import './wifi.css'
import { useState, useEffect } from "react";
import Upload from "../components/Wifi_Conduit/Upload"
import Table from "../components/Wifi_Conduit/Table"
import Menu from "../components/Wifi_Conduit/Menu"
import Delta from "../components/Wifi_Conduit/Delta"
import Filters from "../components/Wifi_Conduit/Filters"
import { Graph } from '../components/Wifi_Conduit/Graph';
import axios from "axios";
import Navbar from '../components/Navbar';
  
function Wifi_Conduit() {
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedAntenne, setSelectedAntenne] = useState(""); 
  const [selectedCaisson, setSelectedCaisson] = useState(""); 
  const [Lmax, setLmax] = useState(0);
  const [Lmin, setLmin] = useState(0);     
  const [selectedVisibility, setVisibility] = useState("hidden");
  const [testResults, setTestResults] = useState([]);
  const [Results, setfetchResult] = useState([]);
  const [Mesure, setMesure] = useState("");
  const [Antenne, setselectedAntenne] = useState(0);
  const [Bande, setselectedBande] = useState("");
  const [filteredEvmResults, setFilteredEvmResults] = useState([]);
  const [evmFrequency, setEvmFrequency] = useState("");
  const [evmAntenne, setEvmAntenne] = useState("");

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/wifi-conduit/results/without-delta-desc/");
        setTestResults(response.data.results);
      } catch (error) {
        console.error("Error fetching test results", error);
      }
    };
    fetchTestResults();
  }, []);

  useEffect(() => {
    // Filtrer les résultats EVM
    let filtered = testResults.filter(result => 
      result.evm !== null && !isNaN(parseFloat(result.evm))
    );

    if (evmFrequency) {
      filtered = filtered.filter(result => 
        result.frequence && result.frequence.includes(evmFrequency)
      );
    }

    if (evmAntenne) {
      filtered = filtered.filter(result => 
        result.antenne && result.antenne.toString() === evmAntenne.toString()
      );
    }

    setFilteredEvmResults(filtered);
  }, [testResults, evmFrequency, evmAntenne]);

  return (
    <>
      <Navbar />
      <Menu />   
      <div className="pr-35 pl-60 mb-10">
        <div className="flex justify-between mt-10">
          <Upload />
          <Delta 
            setselectedAntenne={setselectedAntenne} 
            setselectedBande={setselectedBande} 
            setfetchResult={setfetchResult}
          />
        </div>
        
        <Filters 
          setSelectedFrequency={setSelectedFrequency} 
          setSelectedAntenne={setSelectedAntenne} 
          setVisibility={setVisibility} 
          setSelectedCaisson={setSelectedCaisson}
        />
        
        <Table 
          setMesure={setMesure} 
          setLmax={setLmax} 
          setLmin={setLmin} 
          testResults={testResults} 
          selectedFrequency={selectedFrequency} 
          selectedAntenne={selectedAntenne} 
          selectedVisibility={selectedVisibility}
        />
        
        <Graph 
          Results={Results} 
          Bande={Bande} 
          Antenne={Antenne} 
          Mesure={Mesure} 
          Lmin={Lmin} 
          Lmax={Lmax} 
          testResults={testResults} 
          selectedFrequency={selectedFrequency} 
          selectedAntenne={selectedAntenne} 
          selectedCaisson={selectedCaisson}
        />


      </div> 
    </>
  )
}

export default Wifi_Conduit;