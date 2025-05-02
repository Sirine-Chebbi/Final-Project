import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Services/api';
import { authService } from '../Services/authService';
import Navbar from '../components/Navbar';
import UploadTemps from '../components/Analyse_temps/UploadTemps';
import Parametre_temps from '../components/Analyse_temps/Parametre_temps';
import Table_temps from '../components/Analyse_temps/Table_temps';
import Graph_temps from '../components/Analyse_temps/Graph_temps';
import Profile from "../components/Admin/Profile"

const Temps = () => {
    const [tempsResults, setTempsResults] = useState([]);
    const [operation, setOperation] = useState("");
    const [equipe, setEquipe] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);


    const fetchTestResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                navigate('/');
                return;
            }

            const response = await api.get("temps-test/get-temps-test/");
            setTempsResults(response.data.results || []);
        } catch (error) {
            console.error("Error fetching test results", error);
            
            if (error.response?.status === 401) {
                try {
                    const newToken = await authService.refreshToken();
                    localStorage.setItem('access_token', newToken);
                    const retryResponse = await api.get("temps-test/get-temps-test/");
                    setTempsResults(retryResponse.data.results || []);
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
                <UploadTemps onUploadSuccess={fetchTestResults} />
                <Parametre_temps 
                    tempsResults={tempsResults} 
                    setOperation={setOperation} 
                    setEquipe={setEquipe} 
                />
                <Table_temps tempsResults={tempsResults} />
                <Graph_temps 
                    tempsResults={tempsResults} 
                    operation={operation} 
                    equipe={equipe}
                />
            </div>
        </>
    );
};

export default Temps;