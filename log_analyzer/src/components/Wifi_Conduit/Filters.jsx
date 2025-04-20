import { useState, useRef } from "react";
import PropTypes from "prop-types";

const Filters = ({
  testResults,
  setSelectedFrequency,
  setVisibility,
  setSelectedAntenne,
  setSelectedCaisson,
}) => {
  const [frequence, setFrequence] = useState("");
  const [antenne, setAntenne] = useState("");
  const [caisson, setCaisson] = useState("");
  const inputRef = useRef(null);

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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setCaisson("");
    handleClickAnnulerCaisson();
  };

  const clearFilter = () => {
    setSelectedFrequency("");
    setSelectedAntenne("");
    setAntenne("");
    setCaisson("");
    setFrequence("");
  };

  const handleAnnuler = () => {
    clearFilter();
    handleVisibility("hidden");
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        id="inputc"
        placeholder="Caisson"
        onChange={(e) => setCaisson(e.target.value)}
        className="border-3 border-red-400 w-50 p-5 rounded-2xl text-xl font-medium text-red-400 h-15 mb-5 mt-10 outline-none"
      />

      <button
        onClick={() => handleClickCaisson(caisson)}
        className="text-black border-3 hover:border-red-400 hover:text-red-400  bg-red-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-35 ml-5 text-xl px-4 py-2 cursor-pointer"
      >
        Enregistrer
      </button>
      <button
        onClick={() => annulerCaisson()}
        className=" ml-5 cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75"
      >
        Annuler
      </button>
      <div className="flex gap-5 -mb-20">
        <div className="border-cyan-500 border-3 h-15 rounded-2xl font-bold w-40">
          <select
            onChange={(e) => setFrequence(e.target.value)}
            name="frequence"
            id="select"
            className=" max-h- text-xl text-cyan-400 p-3 outline-none "
            value={frequence}
          >
            <option value="">Fréquence</option>
            {[...new Set(testResults.map((result) => result.frequence))]
              .filter((frequence) => frequence)
              .map((frequenceUnique, index) => (
                <option
                  className="text-white bg-gray-800"
                  key={index}
                  value={frequenceUnique}
                >
                  {frequenceUnique}
                </option>
              ))}
          </select>
        </div>
        <div className="border-cyan-500 border-3 h-15 rounded-2xl font-bold w-40">
          <select
            onChange={(a) => setAntenne(a.target.value)}
            name="antenne"
            id="select"
            className="max-h- text-xl text-cyan-400 p-3 outline-none "
            value={antenne}
          >
            <option value="">Antenne</option>
            {[...new Set(testResults.map((result) => result.ant))]
              .filter((antenne) => antenne)
              .map((antenneUnique, index) => (
                <option
                  className="text-white bg-gray-800"
                  key={index}
                  value={antenneUnique}
                >
                  {antenneUnique}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleFilter}
          className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer"
        >
          Filtrer
        </button>
        <button
          onClick={handleAnnuler}
          className="cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75"
        >
          Annuler
        </button>
      </div>
    </>
  );
};

Filters.propTypes = {
  testResults: PropTypes.arrayOf(
    PropTypes.shape({
      frequence: PropTypes.number.isRequired,
      antenne: PropTypes.number.isRequired,
    })
  ).isRequired,
  setSelectedFrequency: PropTypes.func.isRequired,
  setVisibility: PropTypes.func.isRequired,
  setSelectedAntenne: PropTypes.func.isRequired,
  setSelectedCaisson: PropTypes.string,
};

export default Filters;
