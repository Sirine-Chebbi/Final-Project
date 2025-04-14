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

  console.log(Antenne);
  console.log(Bande);
  
  

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
          <Delta setselectedAntenne={setselectedAntenne} setselectedBande={setselectedBande} setfetchResult={setfetchResult}></Delta>
        </div>
          <Filters setSelectedFrequency={setSelectedFrequency} setSelectedAntenne={setSelectedAntenne} setVisibility={setVisibility} setSelectedCaisson={setSelectedCaisson}></Filters>
          <Table setMesure={setMesure} setLmax={setLmax} setLmin={setLmin} testResults={testResults} selectedFrequency={selectedFrequency} selectedAntenne={selectedAntenne} selectedVisibility={selectedVisibility}></Table>
          <Graph Results={Results} Bande={Bande} Antenne={Antenne} Mesure={Mesure} Lmin={Lmin} Lmax={Lmax} testResults={testResults} selectedFrequency={selectedFrequency} selectedAntenne={selectedAntenne} selectedCaisson={selectedCaisson}/>
      </div> 
    </>
  )
}

export default  Wifi_Conduit
