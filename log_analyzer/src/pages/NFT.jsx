import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import NftFilter from '../components/NFT/NftFilter';
import TableNFT from '../components/NFT/TableNFT';
import UploadNFT from '../components/NFT/UploadNft';
import axios from 'axios';

const NFT = () => {

  const [testResults, setTestResults] = useState([]);
  const [antenne, setSelectedAntenne] = useState("");
  const [mesure, setSelectedMesure] = useState("");
  const [bande, setSelectedBande] = useState("");
  const [min, setSelectedMin] = useState("");
  const [max, setSelectedMax] = useState("");

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/wifi-nft/get-nft-results/");
        setTestResults(response.data);
      } catch (error) {
        console.error("Error fetching test results", error);
      }
    };

    fetchTestResults();
  }, []);

  return (
    <>
      <Navbar></Navbar>
      <div className="ml-40 mr-40 mt-10">
        <UploadNFT></UploadNFT>
        <NftFilter testResults={testResults} setSelectedAntenne={setSelectedAntenne} setSelectedMesure={setSelectedMesure} setSelectedBande={setSelectedBande} max={max} min={min}></NftFilter>
        <TableNFT testResults={testResults} antenne={antenne} mesure={mesure} bande={bande} setSelectedMin={setSelectedMin} setSelectedMax={setSelectedMax}></TableNFT>
      </div>
    </>
  )
}

export default NFT