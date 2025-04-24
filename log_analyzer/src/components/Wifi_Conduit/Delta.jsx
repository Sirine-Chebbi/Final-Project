import { useEffect, useState, useMemo } from "react";
import "./delta.css"
import axios from "axios";
import PropTypes from 'prop-types'

export const Delta = ({ setfetchResult }) => {

    const [value, setValue] = useState(2);
    const [Results, setTestResults] = useState([]);
    const [Antenne, setAntenne] = useState(0);
    const [Bande, setBande] = useState("");

    const changeValue = (amount) => {
        setValue((prev) => Math.max(2, prev + amount));
    };

    const filterResult = () => {
        setAntenne(document.getElementById("antenne").value);
        setBande(value + "G");
    };

    const reset = () => {
        setAntenne(0);
        document.getElementById("antenne").value = "";
        setBande("");
    };


    const filteredResults = useMemo(() => {
        let results = [...Results];

        if (Antenne != 0 && Bande != "") {
            results = Antenne || Bande
                ? Results.filter((result) => (result.ant == Antenne) && (result.type_gega == Bande))
                : Results;

        } else {
            results = Antenne || Bande
                ? Results.filter((result) => (result.type_gega == Bande) || (result.ant == Antenne))
                : Results;
        }

        return results;
    }, [Results, Antenne, Bande]);


    useEffect(() => {
        setfetchResult(filteredResults);
    }, [filteredResults, setfetchResult]);



    useEffect(() => {
        const fetchTestResults = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/wifi-conduit/results/with-delta-desc/");
                setTestResults(response.data.results);
            } catch (error) {
                console.error("Error fetching test results", error);
            }
        };
        fetchTestResults();
    }, []);

    return (
        <div>
            <div className='flex gap-5 justify-end'>
                <div className="border-3 border-yellow-400 w-35 p-5 rounded-2xl text-xl font-medium text-yellow-400 h-15 outline-none text-center">
                    <div className="-mt-2"></div>
                    <button className="cursor-pointer text-red-500 mr-5 text-2xl font-bold" onClick={() => changeValue(-1)}>-</button>
                    <span>{value}G</span>
                    <button className="cursor-pointer text-green-500 ml-5 text-2xl font-bold" onClick={() => changeValue(1)}>+</button>
                </div>

                <input type="number" id="antenne" placeholder="Antenne" className="border-3 border-yellow-400 w-40 p-5 rounded-2xl text-xl font-medium text-yellow-400 h-15 outline-none" />

                <button onClick={() => filterResult()} className="text-black border-3 hover:border-yellow-400 hover:text-yellow-400  bg-yellow-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                    Filtrer
                </button>
                <button onClick={() => reset()} className="cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75">
                    Annuler
                </button>
            </div>

            <div id="delta" className=" flex-auto overflow-x-auto rounded-xl border-3 border-yellow-400 max-h-75 mt-5 p-2 w-200 mb-10">
                <table className="min-w-full text-white text-sm text-center">
                    <thead className="text-lg text-yellow-400">
                        <tr>
                            <td className="p-3">Bande</td>
                            <td className="p-3">Signal</td>
                            <td className="p-3">Antenne</td>
                            <td className="p-4">RX-Gainerror</td>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-400 text-lg">
                        {filteredResults.map((result, index) => (
                            <tr key={index}>
                                <td className="py-2">{result.type_gega}</td>
                                <td>{result.description}</td>
                                <td>{result.ant}</td>
                                <td>{result.delta}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

Delta.propTypes = {
    setfetchResult: PropTypes.array,
};

export default Delta