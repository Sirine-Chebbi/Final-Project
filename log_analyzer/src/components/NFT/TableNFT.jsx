import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';

const TableNFT = ({ 
  testResults = [], 
  antenne, 
  mesure, 
  bande, 
  setSelectedMin, 
  setSelectedMax, 
  setFilteredResults 
}) => {
  const filteredResults = useMemo(() => {
    let results = [...testResults];
    
    if (mesure) {
      results = results.filter(result => 
        String(result.mesure).toLowerCase() === String(mesure).toLowerCase()
      );
    }
    
    if (antenne) {
      results = results.filter(result => {
        const antValue = String(result.antenne).toLowerCase();
        return antValue === String(antenne).toLowerCase();
      });
    }
    
    if (bande) {
      const bandeNum = bande.replace('G', '');
      results = results.filter(result => {
        const resultBande = String(result.bande || '').replace('G', '');
        return resultBande === bandeNum;
      });
    }
    
    return results;
  }, [testResults, mesure, antenne, bande]);

  const { minLimit, maxLimit } = useMemo(() => {
    if (filteredResults.length === 0) return { minLimit: 0, maxLimit: 0 };

    const limits = filteredResults.reduce((acc, result) => {
      const min = parseFloat(result.lim_min) || 0;
      const max = parseFloat(result.lim_max) || 0;
      return {
        min: Math.min(acc.min, min),
        max: Math.max(acc.max, max)
      };
    }, { min: Infinity, max: -Infinity });

    return {
      minLimit: limits.min === Infinity ? 0 : limits.min,
      maxLimit: limits.max === -Infinity ? 0 : limits.max
    };
  }, [filteredResults]);

  useEffect(() => {
    setSelectedMin(minLimit);
    setSelectedMax(maxLimit);
    setFilteredResults(filteredResults);
  }, [minLimit, maxLimit, filteredResults, setSelectedMin, setSelectedMax, setFilteredResults]);

  useEffect(() => {
    console.log('Filtres appliqués:', { mesure, antenne, bande });
    console.log('Résultats filtrés:', filteredResults);
  }, [filteredResults, mesure, antenne, bande]);

  return (
    <div className="mb-10 flex-auto overflow-x-auto rounded-xl border-cyan-400 border-2 max-h-150 p-10 hover:scale-101 duration-200 hover:shadow-cyan-400 shadow-2xl mt-10">
      <table className="table-fixed text-white text-lg w-full">
        <thead className="text-cyan-400">
          <tr className="items-stretch text-2xl">
            <th className="font-bold whitespace-nowrap pb-8 pt-2">Bande</th>
            <th className="font-medium whitespace-nowrap pb-8 pt-2">Antenne</th>
            <th className="font-medium whitespace-nowrap pb-8 pt-2">Mesure</th>
            <th className="font-medium whitespace-nowrap pb-8 pt-2">Power</th>
            <th className="font-medium whitespace-nowrap pb-8 pt-2">Limite Min</th>
            <th className="font-medium whitespace-nowrap pb-8 pt-2">Limite Max</th>
          </tr>
        </thead>
        <tbody className="divide-y text-lg text-center divide-cyan-400">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <tr key={index} className="text-xl">
                <td className="py-2">{result.bande}</td>
                <td>{result.antenne}</td>
                <td>{result.mesure}</td>
                <td>{result.power}</td>
                <td>{result.lim_min}</td>
                <td>{result.lim_max}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-4 text-cyan-400">
                Aucune donnée disponible pour les filtres :
                <br />
                Mesure: {mesure || 'Aucun'}, 
                Antenne: {antenne || 'Aucun'}, 
                Bande: {bande || 'Aucun'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TableNFT.propTypes = {
  testResults: PropTypes.arrayOf(
    PropTypes.shape({
      bande: PropTypes.string,
      ant: PropTypes.string,
      antenne: PropTypes.string,
      mesure: PropTypes.string,
      power: PropTypes.string,
      lim_min: PropTypes.string,
      lim_max: PropTypes.string,
    })
  ),
  antenne: PropTypes.string,
  mesure: PropTypes.string,
  bande: PropTypes.string,
  setSelectedMin: PropTypes.func.isRequired,
  setSelectedMax: PropTypes.func.isRequired,
  setFilteredResults: PropTypes.func.isRequired,
};

TableNFT.defaultProps = {
  testResults: [],
};

export default TableNFT;