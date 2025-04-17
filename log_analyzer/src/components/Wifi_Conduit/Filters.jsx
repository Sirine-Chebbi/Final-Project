import { useState } from 'react';
import PropTypes from 'prop-types'

const Filters = ({ setSelectedFrequency, setVisibility, setSelectedAntenne, setSelectedCaisson}) => {

    const [frequence, setFrequence] = useState("");
    const [antenne, setAntenne] = useState("");
    const [caisson, setCaisson] = useState("");


    const handleClickAntenne = (antenne) => {
        setSelectedAntenne(antenne);
    };

    const handleClickCaisson = (caisson) => {
        setSelectedCaisson(caisson);
        alert("Caisson mis à jour");
    };

    const handleClickAnnulerCaisson = () => {
        setSelectedCaisson("");
        alert("Caisson Annuler");
    };

    const handleClick = (frequency) => {
        setSelectedFrequency(frequency);
    };

    const handleVisibility = (visible) => {
        if (frequence) {
            setVisibility(visible);
        }

    };

    const handleFilter = () => {
        handleVisibility("visible");
        handleClick(frequence);
        handleClickAntenne(antenne);
      };
      

    const annulerCaisson = () => {
        document.getElementById('inputc').value = "";
        setCaisson("");
        handleClickAnnulerCaisson();
    }

    const clearFilter = () => {
        setSelectedFrequency("");
        setSelectedAntenne("");
        document.getElementById("input1").value = "";
        document.getElementById("input2").value = "";
        setAntenne("");
        setCaisson("")
        setFrequence("");
    };

    const handleAnnuler = () => {
        clearFilter();
        handleVisibility("hidden");
      };
      

    return (
        <>
            <input type="text" id="inputc" placeholder="Caisson" onChange={(e) => setCaisson(e.target.value)} className="border-3 border-cyan-400 w-50 p-5 rounded-2xl text-xl font-medium text-cyan-400 h-15 mb-5 mt-10 outline-none" />
            <button onClick={() =>  handleClickCaisson(caisson)} className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-35 ml-5 text-xl px-4 py-2 cursor-pointer">
                    Enregistrer
            </button>
            <button onClick={() => annulerCaisson()} className=" ml-5 cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75">
                    Annuler
                </button>
            <div className='flex gap-5 -mb-20'>
                <input type="text" id="input1" placeholder="Frequance MHz" onChange={(e) => setFrequence(e.target.value)} className="border-3 border-cyan-400 w-50 p-5 rounded-2xl text-xl font-medium text-cyan-400 h-15 outline-none" />

                <input type="number" id="input2" placeholder="Antenne" onChange={(s) => setAntenne(s.target.value)} className="border-3 border-cyan-400 w-40 p-5 rounded-2xl text-xl font-medium text-cyan-400 h-15 outline-none" />

                <button onClick={handleFilter} className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                    Filtrer
                </button>
                <button onClick={handleAnnuler} className="cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75">
                    Annuler
                </button>
            </div>

        </>
    )
}

Filters.propTypes = {
    setSelectedFrequency: PropTypes.func.isRequired,
    setVisibility: PropTypes.func.isRequired,
    setSelectedAntenne: PropTypes.func.isRequired,
    setSelectedCaisson: PropTypes.string,
};

export default Filters