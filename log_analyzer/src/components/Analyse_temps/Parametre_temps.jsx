import  { useState } from "react";
import PropTypes from "prop-types";

function Parametre_temps({ tempsResults, setOperation, setEquipe }) {

  const [op, setOp] = useState("");
  const [eq, setEq] = useState("");

  const handleChange = () => {
    setOperation(op);
    setEquipe(eq);
    alert("Equipe: " + eq + "\nOperation: " + op);
  }

  const handleReset = () => {
    document.getElementById("operation").value = "";
    document.getElementById("equipe").value = "";
    setOperation("");
    setEquipe("");
    alert("Operation et Equipe ont été réinitialisées.");
  }
  

  return (
    <>
      <div className="mt-20 flex justify-between gap-5">
        <div className="place-items-center gap-5">
          <input
            type="text"
            id="input1"
            placeholder="Referance"
            value={"Referance: " + tempsResults[0]?.reference || ''}
            className="border-3 border-green-400 w-fit rounded-2xl text-xl p-3 h-14 font-medium text-green-400 outline-none mb-5"
          />
          <br />
          <input
            type="text"
            id="input2"
            placeholder="Nom"
            value={"Nom: " + tempsResults[0]?.nom || ''}
            className="border-3 border-orange-500 rounded-2xl text-xl p-3 h-14 font-medium text-orange-500 outline-none w-140"
          />
        </div>
        <div>
          <input
            type="text"
            id="equipe"
            onChange={(e) => {setEq(e.target.value)}}
            placeholder="Equipe"
            className="border-3 border-red-400 w-50 p-5 rounded-2xl text-xl font-medium text-red-400 h-15 outline-none"
          />
          <input
            type="text"
            id="operation"
            onChange={(e) => {setOp(e.target.value)}}
            placeholder="Operation"
            className=" ml-5 border-3 border-red-400 w-50 p-5 rounded-2xl text-xl font-medium text-red-400 h-15 outline-none"
          />
          <button
            onClick={() => {
              handleChange();
            }}
            className="text-black border-3 hover:border-red-400 hover:text-red-400  bg-red-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-35 ml-5 text-xl px-4 py-2 cursor-pointer"
          >
            Enregistrer
          </button>
          <button
          onClick={() => {handleReset()}}
            className=" ml-5 cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}




Parametre_temps.propTypes = {
  tempsResults: PropTypes.array.isRequired,
  setOperation: PropTypes.func.isRequired,
  setEquipe: PropTypes.func.isRequired,
};

export default Parametre_temps;
