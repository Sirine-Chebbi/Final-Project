import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Services/api'; // Importez votre instance API configurée
import { authService } from '../Services/authService';
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState(""); 
  const [showProfile, setShowProfile] = useState(false);


  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await api.get("wifi-nft/get-nft-results/");
      setTestResults(response.data.results || []);
    } catch (error) {
      console.error("Error fetching test results", error);
      
      if (error.response?.status === 401) {
        try {
          // Tentative de rafraîchissement du token
          const newToken = await authService.refreshToken();
          // Réessayer la requête avec le nouveau token
          const retryResponse = await api.get("wifi-nft/get-nft-results/");
          setTestResults(retryResponse.data.results || []);
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

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar showProfile={showProfile} setShowProfile={setShowProfile}></Navbar>
      <Profile trigger={showProfile} showProfile={showProfile} setShowProfile={setShowProfile}></Profile>
      <div className="ml-40 mr-40 mt-10">
        <UploadNFT onUploadSuccess={fetchTestResults} />
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
        <Nftgraph 
          filteredResults={filteredResults} 
          min={min} 
          max={max} 
          selectedPosition={selectedPosition}
        />
      </div>
    </>
  );
};

export default NFT;