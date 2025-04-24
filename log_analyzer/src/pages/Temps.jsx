import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UploadTemps from '../components/Analyse_temps/UploadTemps';
import Parametre_temps from '../components/Analyse_temps/Parametre_temps';
import Table_temps from '../components/Analyse_temps/Table_temps';
import Graph_temps from '../components/Analyse_temps/Graph_temps';

const Temps = () => {

    const [tempsResults, setTempsResults] = useState([]);
    const [operation, setOperation] = useState("");
    const [equipe, setEquipe] = useState("");

    const fetchTestResults = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/temps-test/get-temps-test/");
            setTempsResults(response.data.results);
        } catch (error) {
            console.error("Error fetching test results", error);
        }
    };

    useEffect(() => {
        fetchTestResults();
    }, []);

    return (
        <>
            <Navbar></Navbar>
            <div className="ml-40 mr-40 mt-10">
                <UploadTemps />
                <Parametre_temps tempsResults={tempsResults} setOperation={setOperation} setEquipe={setEquipe} />
                <Table_temps tempsResults={tempsResults} />
                <Graph_temps tempsResults={tempsResults} operation={operation} equipe={equipe}/>
            </div>

        </>
    )
}

export default Temps