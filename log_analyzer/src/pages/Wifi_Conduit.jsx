  import './wifi.css'
  import { useState, useEffect } from "react";
  import Upload from "../components/Wifi_Conduit/Upload"
  import Table from "../components/Wifi_Conduit/Table"
  import Menu from "../components/Wifi_Conduit/Menu"

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

    const [testResults, setTestResults] = useState([]);
    const [Results, setfetchResult] = useState([]);

    const [Antenne, setSelectedAntenneDelta] = useState(0);
    const [Bande, setselectedBande] = useState("");

    const [filteredResults ,setFilteredResults] = useState([]);


    console.log("selectedAntenne:", Antenne);
    console.log("selectedFrequency:", Bande);
    
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


    return (
      <>
      <Navbar></Navbar>
        <Menu></Menu>   
        <div className="pr-35 pl-60 mb-10">
          <div className="flex justify-between mt-10">
            <Upload></Upload> 
            <Delta setSelectedAntenneDelta={setSelectedAntenneDelta} setselectedBande={setselectedBande} setfetchResult={setfetchResult}></Delta>
          </div>
            <Filters setSelectedFrequency={setSelectedFrequency} setSelectedAntenne={setSelectedAntenne} setVisibility={setVisibility} setSelectedCaisson={setSelectedCaisson}></Filters>
            <Table testResults={testResults} selectedFrequency={selectedFrequency} selectedAntenne={selectedAntenne} selectedVisibility={selectedVisibility} setFilteredResults={setFilteredResults} setSelectedCaisson={setSelectedCaisson}></Table>
            <Powergraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Powergraph>
            <Evmgraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Evmgraph>
            <Rssigraph filteredResults={filteredResults} selectedCaisson={selectedCaisson}></Rssigraph>
            <Deltagraph Results={Results} selectedCaisson={selectedCaisson}></Deltagraph>
        </div> 
      </>
    )
  }

  export default  Wifi_Conduit
