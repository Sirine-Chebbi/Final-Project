import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
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

const Nftgraph = ({ filteredResults, min, max }) => {
  const chartRef = useRef();

  const calculateStats = (data, min, max) => {
    if (!data || data.length === 0) return null;

    const powerValues = data
      .map((item) => parseFloat(item.power))
      .filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(
      powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
        powerValues.length
    );
    const dataMin = min || Math.min(...powerValues);
    const dataMax = max || Math.max(...powerValues);

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
      limMin: parseFloat(data[0]?.lim_min) || 0,
      limMax: parseFloat(data[0]?.lim_max) || 0,
    };
  };

  const stats = calculateStats(filteredResults, min, max);

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
          borderColor: "#06b6d4", // Using hex color
          borderWidth: 3,
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
          backgroundColor: "rgba(239, 68, 68, 0.7)", // Using rgba color
          yAxisID: "y1",
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
        
      ],
    };
  };

  const chartData = prepareChartData();

  
  return (
    <div
      ref={chartRef}
      className="p-6 rounded-lg mt-20 mb-20"
      style={{
        backgroundColor: "#1F2937", // Using hex color
        color: "#E5E7EB", // Using hex color
      }}
    >
      {filteredResults.length > 0 ? (
        <>
          <h2
            style={{
              color: "#06b6d4", // Using hex color
              fontSize: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            {filteredResults[0]?.bande} - Antenne {filteredResults[0]?.antenne}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {["mean", "stdDev", "limMin", "limMax"].map((stat) => (
              <div
                key={stat}
                style={{
                  backgroundColor: "#374151", // Using hex color
                  padding: "1rem",
                  borderRadius: "0.5rem",
                }}
              >
                <h3 style={{ color: "#06b6d4" }}> {/* Using hex color */}
                  {stat === "mean" && "Cible"}
                  {stat === "stdDev" && "Écart-type"}
                  {stat === "limMin" && "LSI"}
                  {stat === "limMax" && "LSS"}
                </h3>
                <p style={{ color: "#ffffff", fontSize: "1.25rem" }}> {/* Using hex color */}
                  {stats?.[stat]?.toFixed(2) || "N/A"}{" "}
                  <span style={{ fontSize: "0.875rem", color: "#D1D5DB" }}> {/* Using hex color */}
                    dBm
                  </span>
                </p>
              </div>
            ))}
          </div>

          <div style={{ height: "24rem" }}>
            <Chart
              type="scatter"
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: "#E5E7EB", // Using hex color
                      font: {
                        size: 14,
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    type: "linear",
                    position: "bottom",
                    title: {
                      display: true,
                      text: "Power (dBm)",
                      color: "#06b6d4", // Using hex color
                    },
                    grid: {
                      color: "rgba(156, 163, 175, 0.2)", // Using rgba color
                    },
                    ticks: {
                      color: "#E5E7EB", // Using hex color
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
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ color: "#F59E0B", padding: "1rem" }}> {/* Using hex color */}
          Aucune donnée ne correspond aux filtres sélectionnés
        </div>
      )}
      
    </div>
  );
};

Nftgraph.propTypes = {
  filteredResults: PropTypes.arrayOf(
    PropTypes.shape({
      power: PropTypes.string.isRequired,
      lim_min: PropTypes.string,
      lim_max: PropTypes.string,
      bande: PropTypes.string,
      antenne: PropTypes.string,
    })
  ).isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default Nftgraph;