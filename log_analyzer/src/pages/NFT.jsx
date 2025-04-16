import { useEffect, useState } from 'react';
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
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import NftFilter from '../components/NFT/NftFilter';
import TableNFT from '../components/NFT/TableNFT';
import UploadNFT from '../components/NFT/UploadNft';
import axios from 'axios';

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

const NFT = () => {
  const [testResults, setTestResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [antenne, setSelectedAntenne] = useState('');
  const [mesure, setSelectedMesure] = useState('');
  const [bande, setSelectedBande] = useState('');
  const [min, setSelectedMin] = useState('');
  const [max, setSelectedMax] = useState('');

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/wifi-nft/get-nft-results/');
        setTestResults(response.data.results || []);
        setFilteredResults(response.data.results || []);
      } catch (error) {
        console.error('Error fetching test results', error);
      }
    };

    fetchTestResults();
  }, []);

  useEffect(() => {
    const filteredData = testResults.filter((result) => {
      if (mesure && result.mesure !== mesure) return false;
      if (antenne && result.antenne.toString() !== antenne.toString()) return false;
      if (bande && result.bande !== bande) return false;

      const power = parseFloat(result.power);
      if (min && !isNaN(power) && power < parseFloat(min)) return false;
      if (max && !isNaN(power) && power > parseFloat(max)) return false;

      return true;
    });

    setFilteredResults(filteredData);
  }, [testResults, mesure, antenne, bande, min, max]);

  const calculateStats = (data) => {
    if (!data || data.length === 0) return null;

    const powerValues = data.map((item) => parseFloat(item.power)).filter((p) => !isNaN(p));
    if (powerValues.length === 0) return null;

    const mean = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    const stdDev = Math.sqrt(powerValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / powerValues.length);
    const dataMin = Math.min(...powerValues);
    const dataMax = Math.max(...powerValues);

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
      limMin: parseFloat(data[0]?.lim_min) || 0,
      limMax: parseFloat(data[0]?.lim_max) || 0
    };
  };

  const stats = calculateStats(filteredResults);

  const prepareChartData = () => {
    if (!stats) return { datasets: [] };

    // Création de l'histogramme
    const binSize = 0.2; // Taille des bins de l'histogramme
    const histogram = {};
    stats.powerValues.forEach(value => {
      const bin = Math.round(value / binSize) * binSize;
      histogram[bin] = (histogram[bin] || 0) + 1;
    });

    // Normalisation de l'histogramme pour qu'il corresponde à l'échelle de la gaussienne
    const maxHistValue = Math.max(...Object.values(histogram));
    const scaleFactor = 0.5 / maxHistValue; // Facteur d'échelle arbitraire

    return {
      datasets: [
        {
          type: 'line',
          label: 'Distribution Gaussienne',
          data: stats.gaussianCurve.map(point => ({ x: point.x, y: point.y })),
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Histogramme',
          data: Object.entries(histogram).map(([x, y]) => ({ 
            x: parseFloat(x), 
            y: y * scaleFactor // Ajustement de l'échelle
          })),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          yAxisID: 'y1'
        },
        {
          type: 'line',
          label: 'Limite Min',
          data: [
            { x: stats.limMin, y: 0 },
            { x: stats.limMin, y: Math.max(...stats.gaussianCurve.map(p => p.y)) }
          ],
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Limite Max',
          data: [
            { x: stats.limMax, y: 0 },
            { x: stats.limMax, y: Math.max(...stats.gaussianCurve.map(p => p.y)) }
          ],
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          yAxisID: 'y'
        }
      ]
    };
  };

  const chartData = prepareChartData();

  return (
    <>
      <Navbar />
      <div className="ml-40 mr-40 mt-10">
        <UploadNFT />
        <NftFilter
          testResults={testResults}
          setSelectedAntenne={setSelectedAntenne}
          setSelectedMesure={setSelectedMesure}
          setSelectedBande={setSelectedBande}
          max={max}
          min={min}
          setSelectedMax={setSelectedMax}
          setSelectedMin={setSelectedMin}
        />
        <TableNFT 
          testResults={filteredResults} 
          setSelectedMin={setSelectedMin} 
          setSelectedMax={setSelectedMax} 
          min={min} 
          max={max} 
        />
        
        {filteredResults.length > 0 ? (
          <div className="p-6 bg-gray-800 rounded-lg mt-10">
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
                      type: 'linear',
                      title: {
                        display: true,
                        text: 'Densité de probabilité',
                        color: '#4FC0D0'
                      },
                      min: 0
                    },
                    y1: {
                      type: 'linear',
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Fréquence',
                        color: '#4FC0D0'
                      },
                      min: 0,
                      grid: {
                        drawOnChartArea: false
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
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

export default NFT;