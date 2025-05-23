import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as XLSX from 'xlsx';

const Table = ({
  selectedFrequency, selectedAntenne, testResults, setFilteredResults, selectedRessource
}) => {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState("Power");

  const handleSelectChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const filteredResults = useMemo(() => {
    let results = [...testResults];

    if (selectedAntenne != "" && selectedFrequency != "") {
      results = selectedFrequency || selectedAntenne
        ? testResults.filter((result) => (result.frequence == selectedFrequency) && (result.ant == selectedAntenne))
        : testResults;
    } else {
      results = selectedFrequency || selectedAntenne
        ? testResults.filter((result) => (result.frequence == selectedFrequency) || (result.ant == selectedAntenne))
        : testResults;
    }

    return results;
  }, [testResults, selectedFrequency, selectedAntenne]);

  // Move the filteredResults update to useEffect
  useEffect(() => {
    setFilteredResults(filteredResults);
  }, [filteredResults, setFilteredResults]);

  useEffect(() => {
    if (filteredResults.length > 0) {
      // Remove direct DOM access - use state instead
      if (filteredResults[0].limit_max == null || filteredResults[0].limit_min == null) {
        setMax(0);
        setMin(0);
      } else {
        if (selectedMetric == "Evm") {
          setMin(filteredResults[0].evm_min);
          setMax(filteredResults[0].evm_max);
        }
        else if (selectedMetric == "Rssi") {
          setMin(filteredResults[0].rssi_min);
          setMax(filteredResults[0].rssi_max);
        }
        else {
          setMin(filteredResults[0].limit_min);
          setMax(filteredResults[0].limit_max);
        }
      }
    }
  }, [filteredResults, selectedMetric]);

const exportToExcel = () => {
  const exportData = filteredResults.map((row) => ({
    ...row,
    ressource: selectedRessource, // Add the selectedRessource field to each row
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Test Results");

  XLSX.writeFile(workbook, "test_results.xlsx");
};


return (
  <>
    <div className="flex gap-5 justify-end mt-5">

      <div className="border-cyan-400 border-3 w-35 rounded-2xl text-center">
      <select
        name=""
        id="metric-select"
        value={selectedMetric}
        onChange={handleSelectChange}
        className="text-xl text-cyan-400 font-mono outline-none w-30 flex h-14 justify-self-center font-bold"
      >
        <option className="text-black" value="Power">
          Power
        </option>
        <option className="text-black" value="Evm">
          Evm
        </option>
        <option className="text-black" value="Rssi">
          Rssi
        </option>
      </select>
      </div>
      

      <div className="flex flex-wrap gap-5">
        <div
          className={`text-xl font-mono border-orange-600 border-3 text-orange-600 p-4 h-15 ound w-fit font-bold rounded-2xl duration-200`}
        >
          <p className="font-bold">Limite Min: {min}</p>
        </div>
        <div
          className={`text-xl font-mono border-green-600 border-3 p-4 text-green-600 ound h-15 w-fit font-bold rounded-2xl duration-200`}
        >
          <p className="font-bold">Limite Max: {max}</p>
        </div>
      </div>
    </div>

    <br />
    <button
      onClick={exportToExcel}
      className="bg-green-600 hover:bg-gray-900/0 hover:text-green-600 border-2 border-green-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer duration-200"
    >
      Exporter en Excel
    </button>
    <br />
    <br />
    <div className="mb-10 flex-auto overflow-x-auto rounded-xl border-cyan-400 border-2 max-h-160 p-5 hover:scale-101 duration-200 hover:shadow-cyan-400 shadow-2xl">
      <table className="min-w-full divide-gray-200 text-white text-sm text-center">
        <thead className="ltr:text-left rtl:text-right text-lg text-cyan-400">
          <tr>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              Nom du fichier
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">Bande</th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              Frequence
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">Ant</th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">Ressource</th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">Evm</th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">Rssi</th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_rms_avg
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_rms_max
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_rms_min
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_dbm_rms_avg
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_dbm_rms_max
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_dbm_rms_min
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_peak_avg
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_peak_max
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_peak_min
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_pre_avg
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_pre_max
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              power_pre_min
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              error_message
            </th>
            <th className="px-4 py-4 font-medium whitespace-nowrap">
              test_time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredResults.map((result, index) => (
            <tr key={index}>
              <td className="px-4 py-2">{result.nom_fichier}</td>
              <td className="px-4 py-2">{result.bande}</td>
              <td className="px-4 py-2">{result.frequence}</td>
              <td className="px-4 py-2">{result.ant}</td>
              <td className="px-4 py-2">{result.ressource}</td>
              <td className="px-4 py-2">{result.evm}</td>
              <td className="px-4 py-2">{result.rssi}</td>
              <td className="px-4 py-2">{result.power_rms_avg}</td>
              <td className="px-4 py-2">{result.power_rms_max}</td>
              <td className="px-4 py-2">{result.power_rms_min}</td>
              <td className="px-4 py-2">{result.power_dbm_rms_avg}</td>
              <td className="px-4 py-2">{result.power_dbm_rms_max}</td>
              <td className="px-4 py-2">{result.power_dbm_rms_min}</td>
              <td className="px-4 py-2">{result.power_peak_avg}</td>
              <td className="px-4 py-2">{result.power_peak_max}</td>
              <td className="px-4 py-2">{result.power_peak_min}</td>
              <td className="px-4 py-2">{result.power_pre_avg}</td>
              <td className="px-4 py-2">{result.power_pre_max}</td>
              <td className="px-4 py-2">{result.power_pre_min}</td>
              <td className="px-4 py-2">{result.error_message}</td>
              <td className="px-4 py-2">{result.test_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
};

Table.propTypes = {
  testResults: PropTypes.array,
  selectedFrequency: PropTypes.string,
  selectedVisibility: PropTypes.string,
  selectedAntenne: PropTypes.string,
  setFilteredResults: PropTypes.func, // Changed from array to func
  selectedRessource: PropTypes.string,
};

export default Table;
