  import './wifi.css'
  import { useState, useEffect } from "react";
  import Upload from "../components/Wifi_Conduit/Upload"
  import Table from "../components/Wifi_Conduit/Table"
  import Menu from "../components/Wifi_Conduit/Menu"
  import Profile from "../components/Admin/Profile"
  import ExportAllGraphs from "../components/Wifi_Conduit/Graphs/ExportAllGraphs";

  import Rssigraph from "../components/Wifi_Conduit/Graphs/Rssigraph"
  import Powergraph from "../components/Wifi_Conduit/Graphs/Powergraph"
  import Evmgraph from "../components/Wifi_Conduit/Graphs/Evmgraph"
  import Deltagraph from "../components/Wifi_Conduit/Graphs/Deltagraph"

  import Delta from "../components/Wifi_Conduit/Delta"
  import Filters from "../components/Wifi_Conduit/Filters"

  import axios from "axios";
  import Navbar from '../components/Navbar';

  function Wifi_Conduit() {

    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [selectedAntenne, setSelectedAntenne] = useState(""); 
    const [selectedCaisson, setSelectedCaisson] = useState(""); 
    const [selectedVisibility, setVisibility] = useState("hidden");
    const [selectedRessource, setSelectedRessource] = useState("");

    const [testResults, setTestResults] = useState([]);
    const [Results, setfetchResult] = useState([]);

    const [filteredResults ,setFilteredResults] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showProfile, setShowProfile] = useState(false);

    
    useEffect(() => {
      const fetchTestResults = async () => {
        try {
          setLoading(true);
          const response = await axios.get("http://127.0.0.1:8000/api/wifi-conduit/results/without-delta-desc/");
          setTestResults(response.data.results);
        } catch (error) {
          console.error("Error fetching test results", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTestResults();
    }, []);
  
    if (loading) return <div>Loading...</div>;

    return (
      <>
      <Navbar showProfile={showProfile} setShowProfile={setShowProfile}></Navbar>
      <Profile trigger={showProfile} showProfile={showProfile} setShowProfile={setShowProfile}></Profile>
        <Menu></Menu>   
        <div className="pr-30 pl-60 mb-10">
          <div className="flex justify-between mt-10">
            <Upload></Upload> 
            <Delta setfetchResult={setfetchResult}></Delta>
          </div>
            <Filters testResults={testResults} setSelectedFrequency={setSelectedFrequency} setSelectedAntenne={setSelectedAntenne} setVisibility={setVisibility} setSelectedCaisson={setSelectedCaisson} setSelectedRessource={setSelectedRessource}></Filters>
            <Table testResults={testResults} selectedFrequency={selectedFrequency} selectedAntenne={selectedAntenne} selectedVisibility={selectedVisibility} setFilteredResults={setFilteredResults} setSelectedCaisson={setSelectedCaisson} selectedRessource={selectedRessource}></Table>
            <ExportAllGraphs
                  filteredResults={filteredResults}
                  selectedCaisson={selectedCaisson}
                  Results={Results}
            />
            <p id="pwr"></p>
            <Powergraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Powergraph>
            <p id="evm"></p>
            <Evmgraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Evmgraph>
            <p id="rssi"></p>
            <Rssigraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Rssigraph>
            <p id="deltagraph"></p>
            <Deltagraph Results={Results} selectedCaisson={selectedCaisson}></Deltagraph>
        </div> 
      </>
    )
  }

  export default  Wifi_Conduit
