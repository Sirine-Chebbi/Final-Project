import * as XLSX from 'xlsx';
import PropTypes from "prop-types";


const Table_temps = ({ tempsResults }) => {

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tempsResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Temps Results");

    XLSX.writeFile(workbook, "Analyse_Temps.xlsx");
  };

  return (
    <>
      <br />
      <button
        onClick={exportToExcel}
        className="bg-green-600 hover:bg-gray-900/0 hover:text-green-600 border-2 border-green-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer duration-200"
      >
        Exporter en Excel
      </button>
      <div className="mb-10 flex-auto overflow-x-auto rounded-xl h-160 border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 max-h-max hover:scale-102 duration-200">
        <table className="min-w-full divide-y divide-cyan-400">
          <thead className="bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Nom Fichier
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Référance
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Valeur
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Heure
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Unité
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Nom
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xl font-bold text-cyan-400 whitespace-nowrap"
              >
                Mesure
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-400 bg-gray-900">
            {tempsResults.length > 0 ? (
              tempsResults.map((result, index) => (
                <tr key={index} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.source_file}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.status === 0
                      ? "OK"
                      : result.status === 1
                        ? "KO"
                        : "Non fait"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.valeur}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.heure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.unite || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-white">
                    {result.mesure}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-lg text-cyan-400">
                  Aucune donnée disponible pour les filtres :
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

Table_temps.propTypes = {
  tempsResults: PropTypes.array.isRequired,
};

export default Table_temps;
