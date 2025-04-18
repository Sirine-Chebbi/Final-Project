import { forwardRef } from "react";

import {
  Chart as ChartJS,
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
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const Powergraph = ({ filteredResults, selectedCaisson }, ref) => {
  const calculateStats = (data) => {
    if (!data || data.length === 0) return null;

    const powerValues = data
      .map((item) => parseFloat(item.power_dbm_rms_avg))
      .filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(
      powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
        powerValues.length
    );
    const dataMin = parseFloat(data[0].limit_min);
    const dataMax = parseFloat(data[0].limit_max);

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
      limMin: parseFloat(data[0].limit_min),
      limMax: parseFloat(data[0].limit_max),
    };
  };

  const stats = calculateStats(filteredResults);

  const prepareChartData = () => {
    if (!stats) return { datasets: [] };

    const binSize = 0.5;
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
          type: "bar",
          label: "Histogramme",
          data: Object.entries(histogram).map(([x, y]) => ({
            x: parseFloat(x),
            y: y * scaleFactor,
          })),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          yAxisID: "y1",
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
      <div ref={ref} id="power-graph">
        <p id="pwr"></p>
        {filteredResults.length > 0 ? (
          <div className="p-6 bg-gray-800 rounded-lg mt-20 hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20">
            <h2 className="text-2xl text-cyan-400 mb-4">
              Power - {filteredResults[0]?.frequence}Hz - Antenne{" "}
              {filteredResults[0]?.ant} || Caisson: {selectedCaisson}
            </h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Moyenne</h3>
                <p className="text-white text-xl">
                  {stats?.mean?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dBm</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Écart-type</h3>
                <p className="text-white text-xl">
                  {stats?.stdDev?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dBm</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Minimum</h3>
                <p className="text-white text-xl">
                  {stats?.min?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dBm</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Maximum</h3>
                <p className="text-white text-xl">
                  {stats?.max?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">dBm</span>
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
                        text: "Power",
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
                <h3 className="text-cyan-400">Cp</h3>
                <p className="text-white text-xl">{cp.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Cpk</h3>
                <p className="text-white text-xl">{cpk.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Pp</h3>
                <p className="text-white text-xl">{pp.toFixed(2)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
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
Powergraph.propTypes = {
  filteredResults: PropTypes.array.isRequired,
  selectedCaisson: PropTypes.string.isRequired,
};

export default forwardRef(Powergraph);
