import jsPDF from "jspdf";
import { useRef, useState, useEffect } from "react";
import autoTable from 'jspdf-autotable';
import { jwtDecode } from "jwt-decode";
import { GetUser } from 'log_analyzer/src/Services/Userservice';
import Tooltipinf from "../Tooltipinf";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import PropTypes from "prop-types";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const Nftgraph = ({ filteredResults, min, max, selectedPosition }) => {
  const [selectedMin, setSelectedMin] = useState(NaN);
  const [selectedMax, setSelectedMax] = useState(NaN);
  const token = localStorage.getItem("access_token");
  const [datauser, setdataUser] = useState([]);


  let userData = null;

  if (token) {
    try {
      userData = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const fetchUser = async () => {
    const data = await GetUser(userData.matricule);
    setdataUser(data);
  };


  useEffect(() => {
    fetchUser();
  }, [])


  const nbr = filteredResults.length;
  const HandleChangeMin = () => {
    setSelectedMin(parseFloat(document.getElementById("inputMin").value));
  };

  const HandleChangeMax = () => {
    setSelectedMax(parseFloat(document.getElementById("inputMax").value));
  };

  const reset = () => {
    setSelectedMin(NaN);
    setSelectedMax(NaN);
    document.getElementById("inputMin").value = "";
    document.getElementById("inputMax").value = "";
  };

  const chartRef = useRef();

  const calculateStats = (data, min, max, selectedMax, selectedMin) => {
    if (!data || data.length === 0) return null;

    const powerValues = data
      .map((item) => parseFloat(item.valeur))
      .filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(
      powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
      powerValues.length
    );

    let dataMin = min;
    let dataMax = max;

    if (!isNaN(selectedMin)) {
      dataMin = parseFloat(selectedMin);
    }

    if (!isNaN(selectedMax)) {
      dataMax = parseFloat(selectedMax);
    }

    const generateGaussianCurve = () => {
      const curve = [];
      const step = (dataMax - dataMin) / 100;
      for (let x = dataMin - 3 * stdDev; x <= dataMax + 3 * stdDev; x += step) {
        const y =
          (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
          Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        curve.push({ x, y });
      }
      return curve;
    };

    return {
      mean,
      stdDev,
      min: dataMin,
      max: dataMax,
      powerValues,
      gaussianCurve: generateGaussianCurve(),
      limMin: dataMin,
      limMax: dataMax,
    };
  };

  const stats = calculateStats(
    filteredResults,
    min,
    max,
    selectedMax,
    selectedMin
  );

  const prepareChartData = () => {
    if (!stats) return { datasets: [] };

    const binSize = 0.1;
    const histogram = {};
    stats.powerValues.forEach((value) => {
      const bin = Math.round(value / binSize) * binSize;
      histogram[bin] = (histogram[bin] || 0) + 1;
    });

    const maxHistValue = Math.max(...Object.values(histogram));
    const scaleFactor = 0.5 / maxHistValue;

    return {
      datasets: [
        {
          type: "line",
          label: "Distribution Gaussienne",
          data: stats.gaussianCurve.map((point) => ({
            x: point.x,
            y: point.y,
          })),
          borderColor: "#06b6d4", // Using hex color
          borderWidth: 3,
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Cible",
          data: [
            { x: stats.mean, y: 0 },
            {
              x: stats.mean,
              y: Math.max(...stats.gaussianCurve.map((p) => p.y)),
            },
          ],
          borderColor: "#10B981", // Vert - tu peux changer la couleur
          borderWidth: 2,
          borderDash: [10, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          type: "bar",
          label: "Histogramme",
          data: Object.entries(histogram).map(([x, y]) => ({
            x: parseFloat(x),
            y: y * scaleFactor,
          })),
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          yAxisID: "y1",
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
        {
          type: "line",
          label: "LSI",
          data: [
            { x: stats.limMin, y: 0 },
            {
              x: stats.limMin,
              y: Math.max(...stats.gaussianCurve.map((p) => p.y)),
            },
          ],
          borderColor: "#f59e0b", // Using hex color
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "LSS",
          data: [
            { x: stats.limMax, y: 0 },
            {
              x: stats.limMax,
              y: Math.max(...stats.gaussianCurve.map((p) => p.y)),
            },
          ],
          borderColor: "#f59e0b", // Using hex color
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
      ],
    };
  };

  const chartData = prepareChartData();

  // Indices long terme (Pp/Ppk)
  const pp =
    stats?.stdDev > 0 ? (stats.limMax - stats.limMin) / (6 * stats.stdDev) : 0;
  const ppk =
    stats?.stdDev > 0
      ? Math.min(
        (stats.limMax - stats.mean) / (3 * stats.stdDev),
        (stats.mean - stats.limMin) / (3 * stats.stdDev)
      )
      : 0;

  // Indices court terme (Cp/Cpk)
  const stdDevShortTerm = stats?.powerValues
    ? Math.sqrt(
      stats.powerValues.reduce(
        (sum, value) => sum + Math.pow(value - stats.mean, 2),
        0
      ) /
      (stats.powerValues.length - 1)
    )
    : 0;

  const cp =
    stdDevShortTerm > 0
      ? (stats?.limMax - stats?.limMin) / (6 * stdDevShortTerm)
      : 0;

  const cpk =
    stdDevShortTerm > 0
      ? Math.min(
        (stats?.limMax - stats?.mean) / (3 * stdDevShortTerm),
        (stats?.mean - stats?.limMin) / (3 * stdDevShortTerm)
      )
      : 0;

  const exportPDF = () => {
    if (!stats || !chartRef.current) return;

    const pdf = new jsPDF("landscape");
    const canvas = chartRef.current.querySelector("canvas");

    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }

    const scaledCanvas = document.createElement("canvas");
    const scale = 3;
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;

    const ctx = scaledCanvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    const imgData = scaledCanvas.toDataURL("image/png");
    const imgWidth = 190;
    const imgHeight = 120;
    const imgX = 15;
    const imgY = 40;

    const { mean, stdDev, limMin, limMax } = stats;
    const tableX = 215;
    const tableY = 40;
    const title = `${filteredResults[0]?.mesure} || Position: ${selectedPosition}`;

    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 255);
    const titleX = (pdf.internal.pageSize.width - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, 15);

    const data = [
      ["Nombre d'échantillon", nbr],
      ["Moyenne", mean.toFixed(2)],
      ["Écart-type", stdDev.toFixed(2)],
      ["LSI", limMin],
      ["LSS", limMax],
    ];

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Caractéristiques du procédé", 215, 40);
    autoTable(pdf, {
      startY: tableY,
      margin: { left: tableX },
      head: [["", ""]],
      body: data,
      styles: {
        fontSize: 12,
        halign: "left",
        cellPadding: 3,
      },
      theme: "plain",
    });

    const statistics = [
      ["Cp", cp.toFixed(2)],
      ["Pp", pp.toFixed(2)],
      ["Cpk", cpk.toFixed(2)],
      ["Ppk", ppk.toFixed(2)],
    ];

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("Capabilité globale", 215, 120);

    autoTable(pdf, {
      startY: tableY + 80,
      margin: { left: tableX },
      head: [["", ""]],
      body: statistics,
      styles: {
        fontSize: 12,
        halign: "left",
        cellPadding: 3,
      },
      theme: "plain",
    });

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);
    pdf.save(`${title}.pdf`);
  };

  return (
    <>
      <h1 className="text-3xl text-cyan-400 font-bold mb-10 mt-20">
        Courbe Gaussienne
      </h1>

      <div className={`flex gap-5  ${datauser.role != "1" ? 'hidden' : ''} `}>
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            id="inputMin"
            placeholder="LSI"
            className="border-3 border-orange-500 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-orange-500 outline-none"
          />
          <input
            type="text"
            id="inputMax"
            placeholder="LSS"
            className="border-3 border-green-400 w-40 rounded-2xl text-xl p-3 h-14 font-medium text-green-400 outline-none"
          />
        </div>

        <div className="flex place-items-center gap-3 mb-10">
          <button
            onClick={() => {
              HandleChangeMax() || HandleChangeMin();
            }}
            className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer"
          >
            Editer
          </button>
          <button
            onClick={() => {
              reset();
            }}
            className="text-black border-3 hover:border-red-500 hover:text-red-500  bg-red-500 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
      {filteredResults.length > 0 ? (
        <div
          ref={chartRef}
          className="p-6 bg-gray-800 rounded-lg hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20"
        >
          <h2 className="text-2xl text-cyan-400 mb-4">
            {filteredResults[0]?.mesure}  || Position: {selectedPosition}
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Cible</h3>
              <p className="text-white text-xl">
                {stats?.mean?.toFixed(2) || "N/A"}{" "}
                <span className="text-sm text-gray-400">{filteredResults[0]?.unite}</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Écart-type</h3>
              <p className="text-white text-xl">
                {stats?.stdDev?.toFixed(2) || "N/A"}{" "}
                <span className="text-sm text-gray-400">{filteredResults[0]?.unite}</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">LSI</h3>
              <p className="text-white text-xl">
                {stats?.min?.toFixed(2) || "N/A"}{" "}
                <span className="text-sm text-gray-400">{filteredResults[0]?.unite}</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">LSS</h3>
              <p className="text-white text-xl">
                {stats?.max?.toFixed(2) || "N/A"}{" "}
                <span className="text-sm text-gray-400">{filteredResults[0]?.unite}</span>
              </p>
            </div>
          </div>

          <div className="h-96">
            <Chart
              type="scatter"
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: "linear",
                    position: "bottom",
                    title: {
                      display: true,
                      color: "#4FC0D0",
                    },
                    min: stats ? stats.min - 3 * stats.stdDev : undefined,
                    max: stats ? stats.max + 3 * stats.stdDev : undefined,
                  },
                  y: {
                    display: false,
                    grid: {
                      display: false,
                    },
                  },
                  y1: {
                    display: false,
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        label += context.parsed.x.toFixed(2) + " dBm";
                        if (context.parsed.y !== undefined) {
                          label += ", " + context.parsed.y.toFixed(2);
                        }
                        return label;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <Tooltipinf titre="Cp (Indice de Capabilité du Processus)" text="est un indicateur statistique utilisé pour mesurer la capacité d’un processus à produire des pièces ou des résultats conformes aux spécifications (tolérances)." className="flex justify-self-end">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </Tooltipinf>
              <h3 className="text-cyan-400">Cp</h3>
              <p className="text-white text-xl">{cp.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Tooltipinf titre="Cpk (Indice de Capabilité Centré du Processus)" text="est un indicateur statistique qui mesure la capacité réelle d’un processus à produire dans les tolérances en tenant compte de son centrage (décalage par rapport à la cible).
                                        Il montre à quel point le processus est proche des limites de spécifications." className="flex justify-self-end">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </Tooltipinf>
              <h3 className="text-cyan-400">Cpk</h3>
              <p className="text-white text-xl">{cpk.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Tooltipinf titre="Pp (Indice de Performance du Processus)" text="est un indicateur statistique utilisé pour mesurer la performance globale d’un processus sur une période donnée, en prenant en compte toutes les données collectées (y compris les dérives ou anomalies).">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </Tooltipinf>
              <h3 className="text-cyan-400">Pp</h3>
              <p className="text-white text-xl">{pp.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Tooltipinf titre="Ppk (Indice de Performance Centré du Processus)" text="est un indicateur statistique qui mesure la performance réelle d’un processus, en prenant en compte à la fois la variabilité et le décalage par rapport à la cible sur une période réelle.">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </Tooltipinf>
              <h3 className="text-cyan-400">Ppk</h3>
              <p className="text-white text-xl">{ppk.toFixed(2)}</p>
            </div>
          </div>
          <br />
          <button
            className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2 font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400"
            onClick={exportPDF}
          >
            Exporter en PDF
          </button>
        </div>
      ) : (
        <div className="p-6 bg-gray-800 rounded-lg mt-10 text-yellow-400">
          Aucune donnée ne correspond aux filtres sélectionnés
        </div>
      )}
    </>
  );
};
Nftgraph.propTypes = {
  filteredResults: PropTypes.arrayOf(
    PropTypes.shape({
      power: PropTypes.string.isRequired,
      lim_min: PropTypes.string,
      lim_max: PropTypes.string,
      unite: PropTypes.string,
      bande: PropTypes.string,
      antenne: PropTypes.string,
      mesure: PropTypes.string,
    })
  ).isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  selectedPosition: PropTypes.string.isRequired,
};

export default Nftgraph;
