import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import NftFilter from '../components/NFT/NftFilter';
import Nftgraph from '../components/NFT/Nftgraph';
import TableNFT from '../components/NFT/TableNFT';
import UploadNFT from '../components/NFT/UploadNft';
import Profile from "../components/Admin/Profile"
import axios from 'axios';

const NFT = () => {
  const [testResults, setTestResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [antenne, setSelectedAntenne] = useState("");
  const [mesure, setSelectedMesure] = useState("");
  const [bande, setSelectedBande] = useState("");
  const [min, setSelectedMin] = useState("");
  const [max, setSelectedMax] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(""); 
  const [showProfile, setShowProfile] = useState(false);


  const fetchTestResults = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/wifi-nft/get-nft-results/"
      );
      setTestResults(response.data.results || []);
    } catch (error) {
      console.error("Error fetching test results", error);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  return (
    <>
      <Navbar showProfile={showProfile} setShowProfile={setShowProfile}></Navbar>
      <Profile trigger={showProfile} showProfile={showProfile} setShowProfile={setShowProfile}></Profile>
      <div className="ml-40 mr-40 mt-10">
        <UploadNFT/>
        <NftFilter
          testResults={testResults}
          setSelectedAntenne={setSelectedAntenne}
          setSelectedMesure={setSelectedMesure}
          setSelectedBande={setSelectedBande}
          max={max}
          min={min}
          setSelectedPosition={setSelectedPosition}
        />
        <TableNFT
          testResults={testResults}
          setSelectedMin={setSelectedMin}
          setSelectedMax={setSelectedMax}
          antenne={antenne}
          mesure={mesure}
          bande={bande}
          setFilteredResults={setFilteredResults}
          setSelectedPosition={setSelectedPosition}
        />
        <Nftgraph filteredResults={filteredResults} min={min} max={max} selectedPosition={selectedPosition}/>

      </div>
    </>
  );
};

export default NFT;
