import Tooltipinf from "../../Tooltipinf";
import { forwardRef } from "react";
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

// Enregistrement complet des composants ChartJS nécessaires
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

const Evmgraph = ({ filteredResults, selectedCaisson }, ref) => {
  const calculateStats = (data) => {
    if (!data || data.length === 0) return null;

    const powerValues = data
      .map((item) => parseFloat(item.evm))
      .filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(
      powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
      powerValues.length
    );
    const dataMin = parseFloat(Math.min(...powerValues));
    const dataMax = parseFloat(Math.max(...powerValues));

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
      min: parseFloat(data[0].evm_min) || -Infinity,
      max: parseFloat(data[0].evm_max),
      powerValues,
      gaussianCurve: generateGaussianCurve(),
      limMin: parseFloat(data[0].evm_min) || -Infinity,
      limMax: parseFloat(data[0].evm_max) || Infinity,
    };
  };

  const stats = calculateStats(filteredResults);

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
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
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
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          yAxisID: "y1",
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
        {
          type: "line",
          label: "Limite Min",
          data: [
            { x: stats.limMin, y: 0 },
            {
              x: stats.limMin,
              y: Math.max(...stats.gaussianCurve.map((p) => p.y)),
            },
          ],
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Limite Max",
          data: [
            { x: stats.limMax, y: 0 },
            {
              x: stats.limMax,
              y: Math.max(...stats.gaussianCurve.map((p) => p.y)),
            },
          ],
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
      ],
    };
  };

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

  const chartData = prepareChartData();

  return (
    <>
      <div ref={ref} id="evm-graph">
        {filteredResults.length > 0 ? (
          <div className="p-6 bg-gray-800 rounded-lg mt-30 hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20">
            <Tooltipinf position="bottom" titre="EVM (Error Vector Magnitude)" text="mesure la qualité du signal transmis. Elle montre l’écart entre le signal réel et le signal idéal. Une EVM faible signifie un signal propre et fiable. Elle est exprimée en pourcentage ou en dB.">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </Tooltipinf>
            <h2 className="text-2xl text-cyan-400 mb-4">
              Evm - {filteredResults[0]?.frequence}Hz - Antenne{" "}
              {filteredResults[0]?.ant} || Caisson: {selectedCaisson}
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Moyenne</h3>
                <p className="text-white text-xl">
                  {stats?.mean?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dB</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Écart-type</h3>
                <p className="text-white text-xl">
                  {stats?.stdDev?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dB</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Minimum</h3>
                <p className="text-white text-xl">
                  {stats?.min?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dB</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Maximum</h3>
                <p className="text-white text-xl">
                  {stats?.max?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dB</span>
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
                        text: "Evm",
                        color: "#4FC0D0",
                      },
                      min: stats ? stats.lmin - 3 * stats.stdDev : undefined,
                      max: stats ? stats.lmax + 3 * stats.stdDev : undefined,
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
          </div>
        ) : (
          <div className="p-6 bg-gray-800 rounded-lg mt-10 text-yellow-400">
            Aucune donnée ne correspond aux filtres sélectionnés
          </div>
        )}
      </div>
    </>
  );
};
Evmgraph.propTypes = {
  filteredResults: PropTypes.array.isRequired,
  selectedCaisson: PropTypes.string.isRequired,
};

export default forwardRef(Evmgraph);
