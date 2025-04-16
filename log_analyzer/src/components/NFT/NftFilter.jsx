import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function NftFilter({ testResults, setSelectedAntenne, setSelectedMesure, setSelectedBande, max, min }) {

    const [ant, setAnt] = useState("");
    const [mesure, setMesure] = useState("");
    const [bande, setBande] = useState("");

    const handleClickAntenne = (value) => {
        setSelectedAntenne(value);
    }
    const handleClickMesure = (value) => {
        setSelectedMesure(value);
    }
    const handleClickBande = (value) => {
        setSelectedBande(value);
    }

    const Annuler = () => {
        setBande("");
        setAnt("");
        setMesure("");
        document.getElementById("input1").value = "";
        document.getElementById("input2").value = "";
        document.getElementById("input3").value = "";
        document.getElementById("input4").value = "";
        document.getElementById("select").value = "";
        setSelectedAntenne("");
        setSelectedMesure("");
        setSelectedBande("");
    }

    useEffect(() => {
        document.getElementById("input1").value = min;
        document.getElementById("input2").value = max;
    }, [min, max]);


    return (
        <>
            <div className="mt-20 flex justify-between gap-5">
                <div className="flex place-items-center gap-3">
                    <div className="border-cyan-500 border-3 h-15 rounded-2xl font-bold w-80">
                        <select onChange={(e) => setMesure(e.target.value)} name="" id="select" className="w-70 max-h- text-xl text-cyan-400 flex p-3 place-self-center outline-none">
                            <option value="">Selectionner Une Mesure</option>
                            {testResults.map((result, index) => (
                                <option className='text-black' key={index} value={result.mesure}>{result.mesure}</option>
                            ))}
                        </select>
                    </div>
                    <input type="text" id="input1" placeholder="Limite Min" className="border-3 border-green-400 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-green-400 outline-none" />
                    <input type="text" id="input2" placeholder="Limite Max" className="border-3 border-orange-500 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-orange-500 outline-none" />
                </div>
                <div className='flex place-items-center gap-3'>

                    <input onChange={(e) => setBande(e.target.value)} type="text" id="input4" placeholder="Bande" className="border-3 border-cyan-400 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-cyan-400 outline-none" />

                    <input onChange={(e) => setAnt(e.target.value)} type="text" id="input3" placeholder="Antenne" className="border-3 border-cyan-400 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-cyan-400 outline-none" />

                    <button onClick={() => { handleClickAntenne(ant) || handleClickBande(bande) || handleClickMesure(mesure) }} className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                        Filtrer
                    </button>
                    <button onClick={() => { Annuler() }} className="text-black border-3 hover:border-red-500 hover:text-red-500  bg-red-500 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                        Annuler
                    </button>
                </div>
            </div>
        </>
    )
}

NftFilter.propTypes = {
    testResults: PropTypes.arrayOf(
        PropTypes.shape({
            mesure: PropTypes.string.isRequired,
        })
    ).isRequired,
    setSelectedAntenne: PropTypes.string.isRequired,
    setSelectedBande: PropTypes.string.isRequired,
    setSelectedMesure: PropTypes.string.isRequired,
    max: PropTypes.string.isRequired,
    min: PropTypes.string.isRequired,
};

export default NftFilter