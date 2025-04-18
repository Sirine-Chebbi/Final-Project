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

  return (
    <div className="mb-10 flex-auto overflow-x-auto rounded-xl h-160 border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 max-h-max hover:scale-102 duration-200">
      <table className="min-w-full divide-y divide-cyan-400">
        <thead className="bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
            Nom  Fichier
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Mesure
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Valeur
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Unité
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Statut
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Min
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Max
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Bande
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Antenne
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap">
              Durée
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-400 bg-gray-900">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.source_file}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.mesure}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.valeur}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.unite || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.status === 0 ? 'OK' : result.status === 1 ? 'KO' : 'Non fait'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.lim_min}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.lim_max}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.bande || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.antenne }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                  {result.duree ? `${result.duree} ms` : '-'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="px-6 py-4 text-center text-lg text-cyan-400">
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
      antenne: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      mesure: PropTypes.string,
      valeur: PropTypes.number,
      lim_min: PropTypes.number,
      lim_max: PropTypes.number,
      duree: PropTypes.number,
      unite: PropTypes.string,
      status: PropTypes.number,
      source_file: PropTypes.string,
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