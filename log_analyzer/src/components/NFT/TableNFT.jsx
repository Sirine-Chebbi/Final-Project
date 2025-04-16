import PropTypes from 'prop-types';
import { useEffect } from 'react';

const TableNFT = ({ testResults, antenne, mesure, bande, setSelectedMin, setSelectedMax, setFilteredResults}) => {
  var filteredResults = testResults;

  // Step 1: Filter by mesure
  if (mesure) {
    filteredResults = filteredResults.filter((result) => result.mesure == mesure);
  }

  // Step 2: Filter by antenne
  if (antenne) {
    filteredResults = filteredResults.filter((result) => result.antenne == antenne);
  }

  // Step 3: Filter by bande
  if (bande) {
    filteredResults = filteredResults.filter((result) => result.bande == bande + "G");
  } 

  const minLimit = Math.min(...filteredResults.map((result) => parseFloat(result.lim_min)));
  const maxLimit = Math.max(...filteredResults.map((result) => parseFloat(result.lim_max)));
  

  useEffect(() => {
    if (minLimit === Infinity || maxLimit === -Infinity) {
      setSelectedMin(0);
      setSelectedMax(0);
      return;
    }
    
    setSelectedMin(minLimit);
    setSelectedMax(maxLimit);
    setFilteredResults(filteredResults);
  }, [minLimit, maxLimit, filteredResults, setSelectedMin, setSelectedMax, setFilteredResults]);

  console.log("Filtered Results:", filteredResults);
  console.log(mesure, antenne, bande);
  

  return (
    <>
      <div className="mb-10 flex-auto overflow-x-auto rounded-xl border-cyan-400 border-2 max-h-150 p-10 hover:scale-101 duration-200 hover:shadow-cyan-400 shadow-2xl mt-10 ">
        <table className="table-fixed text-white text-lg w-full">
          <thead className="text-cyan-400">
            <tr className=" items-stretch text-2xl">
              <th className="font-bold whitespace-nowrap pb-8 pt-2">Bande</th>
              <th className="font-medium whitespace-nowrap pb-8 pt-2">Antenne</th>
              <th className="font-medium whitespace-nowrap pb-8 pt-2">Power</th>
              <th className="font-medium whitespace-nowrap pb-8 pt-2">Limite Min</th>
              <th className="font-medium whitespace-nowrap pb-8 pt-2">Limite Max</th>
            </tr>
          </thead>
          <tbody className="divide-y text-lg text-center divide-cyan-400">
            {filteredResults.map((result, index) => (
              <tr key={index} className="text-xl">
                <td className="py-2">{result.bande}</td>
                <td>{result.antenne}</td>
                <td>{result.power}</td>
                <td>{result.lim_min}</td>
                <td>{result.lim_max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

TableNFT.propTypes = {
  testResults: PropTypes.arrayOf(
    PropTypes.shape({
      bande: PropTypes.string.isRequired,
      antenne: PropTypes.string.isRequired,
      mesure: PropTypes.string,
      power: PropTypes.string.isRequired,
      lim_min: PropTypes.string.isRequired, // Corrected key
      lim_max: PropTypes.string.isRequired, // Corrected key
    })
  ).isRequired,
  antenne: PropTypes.string,
  mesure: PropTypes.string,
  bande: PropTypes.string,
  setSelectedMin: PropTypes.func.isRequired, 
  setSelectedMax: PropTypes.func.isRequired, 
  setFilteredResults: PropTypes.array.isRequired,
};

export default TableNFT;