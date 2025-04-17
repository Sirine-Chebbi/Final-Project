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

    const powerValues = data.map((item) => parseFloat(item.power)).filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / powerValues.length);
    const dataMin = min;
    const dataMax = max;

    const generateGaussianCurve = () => {
      const curve = [];
      const step = (dataMax - dataMin) / 100;
      for (let x = dataMin - 3 * stdDev; x <= dataMax + 3 * stdDev; x += step) {
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
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
      limMax: dataMax
    };
  };

  const stats = calculateStats(filteredResults, min, max);

  const prepareChartData = () => {
    if (!stats) return { datasets: [] };

    const binSize = 0.5;
    const histogram = {};
    stats.powerValues.forEach(value => {
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

  const exportPDF = () => {
    const pdf = new jsPDF("landscape");
  
    const canvas = chartRef.current?.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
  
    // Scale the canvas to improve image quality
    const scaledCanvas = document.createElement("canvas");
    const scale = 3;
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
  
    const ctx = scaledCanvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);
  
    const imgData = scaledCanvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = 140;
    const imgX = 15;
    const imgY = 30;
  
    const bande = filteredResults[0]?.bande || 'unknown';
    const antenne = filteredResults[0]?.antenne || 'unknown';
    const title = `POWER_RMS_AVG_VSA1 ${bande} A${antenne}`;
  
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 255);
    const titleX = (pdf.internal.pageSize.width - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, 15);
  
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
    pdf.save(`power_graph_${bande}_A${antenne}.pdf`);
  };
  

  return (
    <>
      {filteredResults.length > 0 ? (
        <div ref={chartRef} className="p-6 bg-gray-800 rounded-lg mt-20 hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20">
          <h2 className="text-2xl text-cyan-400 mb-4">
            {filteredResults[0]?.bande} - Antenne {filteredResults[0]?.antenne}
          </h2>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Moyenne</h3>
              <p className="text-white text-xl">
                {stats?.mean?.toFixed(2) || 'N/A'} <span className="text-sm text-gray-400">dBm</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Écart-type</h3>
              <p className="text-white text-xl">
                {stats?.stdDev?.toFixed(2) || 'N/A'} <span className="text-sm text-gray-400">dBm</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Minimum</h3>
              <p className="text-white text-xl">
                {stats?.min?.toFixed(2) || 'N/A'} <span className="text-sm text-gray-400">dBm</span>
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-cyan-400">Maximum</h3>
              <p className="text-white text-xl">
                {stats?.max?.toFixed(2) || 'N/A'} <span className="text-sm text-gray-400">dBm</span>
              </p>
            </div>
          </div>

          <div className="h-96">
            <Chart
              type='scatter'
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                      display: true,
                      text: 'Valeur Power (dBm)',
                      color: '#4FC0D0'
                    },
                    min: stats ? stats.min - 3 * stats.stdDev : undefined,
                    max: stats ? stats.max + 3 * stats.stdDev : undefined
                  },
                  y: {
                    display: false,
                    grid: {
                      display: false,
                    }
                  },
                  y1: {
                    display: false,
                    grid: {
                      display: false,
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.parsed.x.toFixed(2) + ' dBm';
                        if (context.parsed.y !== undefined) {
                          label += ', ' + context.parsed.y.toFixed(2);
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <button className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2 font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400" onClick={exportPDF}>
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
}
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