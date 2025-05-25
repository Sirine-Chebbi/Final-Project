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
import MeasureGraph from "../components/Wifi_Conduit/Graphs/MeasureGraph"
import Delta from "../components/Wifi_Conduit/Delta"
import Filters from "../components/Wifi_Conduit/Filters"
import api from '../Services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/authService";
import Profile from "../components/Admin/Profile"
import Ai from '../components/Wifi_Conduit/Ai';

function Wifi_Conduit() {

  const MEASURES = [
    { value: "freq_error_avg", label: "Freq Error Avg (ppm)" },
    { value: "lo_leakage_dbc", label: "LO Leakage DBC VSA1 (dBc)" },
    { value: "lo_leakage_margin", label: "LO Leakage Margin VSA1 (dB)" },
    { value: "margin_db_lo_a", label: "Margin LO A VSA1 (dB)" },
    { value: "margin_db_lo_b", label: "Margin LO B VSA1 (dB)" },
    { value: "margin_db_up_a", label: "Margin UP A VSA1 (dB)" },
    { value: "margin_db_up_b", label: "Margin UP B VSA1 (dB)" },
    { value: "obw_mhz", label: "OBW MHZ VSA1 (MHz)" },
    { value: "violation_percentage", label: "Violation % VSA1 (%)" },
    { value: "number_of_avg", label: "Number of Avg" },
    { value: "spatial_stream", label: "Spatial Stream" },
    { value: "amp_err_db", label: "Amp Error DB VSA1 (dB)" },
    { value: "cable_loss_db", label: "Cable Loss DB RET1 (dB)" },
    { value: "data_rate", label: "Data Rate (Mbps)" },
    { value: "evm_avg_db", label: "EVM Avg DB (dB)" },
    { value: "evm_db_avg", label: "EVM dB Avg S1 (dB)" },
    { value: "phase_err", label: "Phase Error (°)" },
    { value: "phase_noise_rms", label: "Phase Noise RMS (dBc/Hz)" },
    { value: "symbol_clk_err", label: "Symbol Clock Error (ppm)" },
    { value: "tx_power_dbm", label: "Tx Power (dBm)" },
    { value: "lo_leakage_dbc_limit", label: "LO Leakage Limit (dBc)" },
    { value: "lo_leakage_margin_min", label: "LO Leakage Margin Min (dB)" },
    { value: "margin_db_lo_a_min", label: "Margin LO A Min (dB)" },
    { value: "margin_db_lo_b_min", label: "Margin LO B Min (dB)" },
    { value: "margin_db_up_a_min", label: "Margin UP A Min (dB)" },
    { value: "margin_db_up_b_min", label: "Margin UP B Min (dB)" },
    { value: "obw_mhz_min", label: "OBW Min (MHz)" },
    { value: "obw_mhz_max", label: "OBW Max (MHz)" },
    { value: "violation_percentage_min", label: "Violation Min (%)" },
    { value: "violation_percentage_max", label: "Violation Max (%)" },
    { value: "evm_db_max", label: "EVM dB Max S1" },
    { value: "evm_db_min", label: "EVM dB Min S1" },
    { value: "freq_at_margin_lo_a", label: "Freq @ Margin LO A (MHz)" },
    { value: "freq_at_margin_lo_b", label: "Freq @ Margin LO B (MHz)" },
    { value: "freq_at_margin_up_a", label: "Freq @ Margin UP A (MHz)" },
    { value: "freq_at_margin_up_b", label: "Freq @ Margin UP B (MHz)" },
    { value: "freq_error_max", label: "Freq Error Max (ppm)" },
    { value: "freq_error_min", label: "Freq Error Min (ppm)" },
    { value: "lo_leakage", label: "LO Leakage (dBm)" },
    { value: "obw_freq_start", label: "OBW Freq Start (MHz)" },
    { value: "obw_freq_stop", label: "OBW Freq Stop (MHz)" },
    { value: "obw_percentage_11ac", label: "OBW % (11ac)" },
    { value: "obw_percentage_lower", label: "OBW % Lower" },
    { value: "obw_percentage_upper", label: "OBW % Upper" },
    { value: "obw_percentage", label: "OBW %" },
    // Nouvelles mesures ajoutées
    { value: "evm", label: "EVM" },
    { value: "power_rms_avg", label: "Power RMS Avg" },
    { value: "power_rms_max", label: "Power RMS Max" },
    { value: "power_rms_min", label: "Power RMS Min" },
    { value: "power_dbm_rms_avg", label: "Power dBm RMS Avg (dBm)" },
    { value: "power_dbm_rms_max", label: "Power dBm RMS Max (dBm)" },
    { value: "power_dbm_rms_min", label: "Power dBm RMS Min (dBm)" },
    { value: "power_peak_avg", label: "Power Peak Avg" },
    { value: "power_peak_max", label: "Power Peak Max" },
    { value: "power_peak_min", label: "Power Peak Min" },
    { value: "power_pre_avg", label: "Power PRE Avg" },
    { value: "power_pre_max", label: "Power PRE Max" },
    { value: "power_pre_min", label: "Power PRE Min" },
  ];

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
  const [showProfile, setShowProfile] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [statData, setStatData] = useState({});
  const [currentSelectedMeasure, setCurrentSelectedMeasure] = useState(MEASURES[0].value);
  const [minLimit, setMinLimit] = useState("");
  const [maxLimit, setMaxLimit] = useState(""); 

  const [power, setPower] = useState("");
  const [evm, setEvm] = useState("");
  const [rssi, setRssi] = useState("");
  const [rx, setRx] = useState("");

  const [type, setType] = useState("");

  const handleCancelLimits = () => {
    setMinLimit("");
    setMaxLimit("");
  };


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
    await fetchTestResults();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar showProfile={showProfile} setShowProfile={setShowProfile} />
      <Profile trigger={showProfile} showProfile={showProfile} setShowProfile={setShowProfile} />
      <Ai statData={statData} trigger={showAi} showAi={showAi} setShowAi={setShowAi} setPower={setPower} setEvm={setEvm} setRssi={setRssi} setRx={setRx} type={type}></Ai>
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
          currentSelectedMeasureForExport={currentSelectedMeasure}
          minLimitForExport={minLimit} 
          maxLimitForExport={maxLimit} 
          power={power}
          evm={evm}
          rx={rx}
          rssi={rssi}
        />
        <br /><br /><br />
        <div className='flex justify-between text-cyan-400 place-items-center'>
          <div className='border-1 border-cyan-400 w-100 h-0'></div>
          <p className='text-2xl'>Différentes mesures</p>
          <div className='border-1 border-cyan-400 w-100 h-0'></div>
        </div>
        <MeasureGraph
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson} 
          selectedMeasure={currentSelectedMeasure}
          onMeasureChange={setCurrentSelectedMeasure}
          minLimit={minLimit}   
          maxLimit={maxLimit}         
          onMinLimitChange={setMinLimit} 
          onMaxLimitChange={setMaxLimit} 
          onCancelLimits={handleCancelLimits} 
        />
        <div className='flex justify-between text-cyan-400 place-items-center'>
          <div className='border-1 border-cyan-400 w-100 h-0'></div>
          <p className='text-2xl'>POWER - EVM - RSSI - RX_Gainer</p>
          <div className='border-1 border-cyan-400 w-100 h-0'></div>
        </div>
        <br />
        <p id="pwr"></p>
        <Powergraph setStatData={setStatData} filteredResults={filteredResults} selectedCaisson={selectedCaisson} setShowAi={setShowAi} setType={setType}/>
        <p id="evm"></p>
        <Evmgraph setStatData={setStatData} setShowAi={setShowAi} filteredResults={filteredResults} selectedCaisson={selectedCaisson} setType={setType}/>
        <p id="rssi"></p>
        <Rssigraph setStatData={setStatData} setShowAi={setShowAi} filteredResults={filteredResults} selectedCaisson={selectedCaisson} setType={setType}/>
        <p id="deltagraph"></p>
        <Deltagraph setStatData={setStatData} setShowAi={setShowAi} Results={Results} selectedCaisson={selectedCaisson} setType={setType}/>
      </div> 
    </>
  );
}

export default Wifi_Conduit;