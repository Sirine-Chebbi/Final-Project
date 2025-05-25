import { forwardRef } from "react";
import Tooltipinf from "../../Tooltipinf";
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

const MeasureGraph = ({
    filteredResults, 
    selectedCaisson, 
    selectedMeasure,
    onMeasureChange,
    minLimit,      
    maxLimit,      
    onMinLimitChange, 
    onMaxLimitChange, 
    onCancelLimits,  
  }, ref) => {
  const MEASURES = [
    { value: "freq_error_avg", label: "Freq Error Avg (ppm)" },
    { value: "lo_leakage_dbc", label: "LO Leakage DBC VSA1 (dBc)" },
    { value: "lo_leakage_margin", label: "LO Leakage Margin VSA1 (dB)" },
    { value: "margin_db_lo_a", label: "Margin LO A VSA1 (dB)" },
    { value: "margin_db_lo_b", label: "Margin LO B VSA1 (dB)" },
    { value: "margin_db_up_a", label: "Margin UP A VSA1 (dB)" },
    { value: "margin_db_up_b", label: "Margin UP B VSA1 (dB)" },
    { value: "obw_mhz", label: "OBW MHZ VSA1 (MHz)" },
    { value: "violation_percentage", label: "Violation % VSA1 (%)" },
    { value: "number_of_avg", label: "Number of Avg" },
    { value: "spatial_stream", label: "Spatial Stream" },
    { value: "amp_err_db", label: "Amp Error DB VSA1 (dB)" },
    { value: "cable_loss_db", label: "Cable Loss DB RET1 (dB)" },
    { value: "data_rate", label: "Data Rate (Mbps)" },
    { value: "evm_avg_db", label: "EVM Avg DB (dB)" },
    { value: "evm_db_avg", label: "EVM dB Avg S1 (dB)" },
    { value: "phase_err", label: "Phase Error (°)" },
    { value: "phase_noise_rms", label: "Phase Noise RMS (dBc/Hz)" },
    { value: "symbol_clk_err", label: "Symbol Clock Error (ppm)" },
    { value: "tx_power_dbm", label: "Tx Power (dBm)" },
    { value: "lo_leakage_dbc_limit", label: "LO Leakage Limit (dBc)" },
    { value: "lo_leakage_margin_min", label: "LO Leakage Margin Min (dB)" },
    { value: "margin_db_lo_a_min", label: "Margin LO A Min (dB)" },
    { value: "margin_db_lo_b_min", label: "Margin LO B Min (dB)" },
    { value: "margin_db_up_a_min", label: "Margin UP A Min (dB)" },
    { value: "margin_db_up_b_min", label: "Margin UP B Min (dB)" },
    { value: "obw_mhz_min", label: "OBW Min (MHz)" },
    { value: "obw_mhz_max", label: "OBW Max (MHz)" },
    { value: "violation_percentage_min", label: "Violation Min (%)" },
    { value: "violation_percentage_max", label: "Violation Max (%)" },
    { value: "evm_db_max", label: "EVM dB Max S1" },
    { value: "evm_db_min", label: "EVM dB Min S1" },
    { value: "freq_at_margin_lo_a", label: "Freq @ Margin LO A (MHz)" },
    { value: "freq_at_margin_lo_b", label: "Freq @ Margin LO B (MHz)" },
    { value: "freq_at_margin_up_a", label: "Freq @ Margin UP A (MHz)" },
    { value: "freq_at_margin_up_b", label: "Freq @ Margin UP B (MHz)" },
    { value: "freq_error_max", label: "Freq Error Max (ppm)" },
    { value: "freq_error_min", label: "Freq Error Min (ppm)" },
    { value: "lo_leakage", label: "LO Leakage (dBm)" },
    { value: "obw_freq_start", label: "OBW Freq Start (MHz)" },
    { value: "obw_freq_stop", label: "OBW Freq Stop (MHz)" },
    { value: "obw_percentage_11ac", label: "OBW % (11ac)" },
    { value: "obw_percentage_lower", label: "OBW % Lower" },
    { value: "obw_percentage_upper", label: "OBW % Upper" },
    { value: "obw_percentage", label: "OBW %" },
    // Nouvelles mesures ajoutées
    { value: "evm", label: "EVM" },
    { value: "power_rms_avg", label: "Power RMS Avg" },
    { value: "power_rms_max", label: "Power RMS Max" },
    { value: "power_rms_min", label: "Power RMS Min" },
    { value: "power_dbm_rms_avg", label: "Power dBm RMS Avg (dBm)" },
    { value: "power_dbm_rms_max", label: "Power dBm RMS Max (dBm)" },
    { value: "power_dbm_rms_min", label: "Power dBm RMS Min (dBm)" },
    { value: "power_peak_avg", label: "Power Peak Avg" },
    { value: "power_peak_max", label: "Power Peak Max" },
    { value: "power_peak_min", label: "Power Peak Min" },
    { value: "power_pre_avg", label: "Power PRE Avg" },
    { value: "power_pre_max", label: "Power PRE Max" },
    { value: "power_pre_min", label: "Power PRE Min" },
  ];

  const calculateStats = (data, measure) => {
    if (!data || data.length === 0) return null;

    const values = data
      .map((item) => parseFloat(item[measure]))
      .filter((v) => !isNaN(v));
    if (values.length === 0) return null;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    );
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    const generateGaussianCurve = () => {
      const curve = [];
      if (stdDev === 0) {
        // Si l'écart-type est 0, c'est une seule valeur, donc une ligne verticale
        // Nous créons une "courbe" qui est juste un point à la moyenne avec une "hauteur" arbitraire
        // pour qu'elle puisse être affichée comme une ligne verticale sur le graphique.
        // La hauteur 1 est arbitraire, car l'axe Y est masqué.
        curve.push({ x: mean, y: 0 });
        curve.push({ x: mean, y: 1 }); // Une hauteur suffisante pour être visible
      } else {
        const rangeStart = dataMin - 3 * stdDev;
        const rangeEnd = dataMax + 3 * stdDev;
        const step = (rangeEnd - rangeStart) / 100;

        for (let x = rangeStart; x <= rangeEnd; x += step) {
          const y =
            (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
          curve.push({ x, y });
        }
      }
      return curve;
    };

    return {
      mean,
      stdDev,
      values,
      gaussianCurve: generateGaussianCurve(),
      dataMin,
      dataMax,
    };
  };

  const stats = calculateStats(filteredResults, selectedMeasure);

  const prepareChartData = () => {
    if (!stats) {
      // Retourne un dataset vide si pas de stats pour éviter les erreurs
      return { datasets: [] };
    }

    const effectiveMinLimit = minLimit !== "" ? parseFloat(minLimit) : null;
    const effectiveMaxLimit = maxLimit !== "" ? parseFloat(maxLimit) : null;

    const histogram = {};
    if (stats.stdDev === 0 && stats.values.length > 0) {
        histogram[stats.mean] = stats.values.length;
    } else {
        const binSize = stats.stdDev / 5 || 1; // Fallback à 1 si stdDev est très petit
        stats.values.forEach((value) => {
            const bin = Math.floor(value / binSize) * binSize;
            histogram[bin] = (histogram[bin] || 0) + 1;
        });
    }

    const maxHistValue =
      Object.keys(histogram).length > 0
        ? Math.max(...Object.values(histogram))
        : 1;
    const maxGaussianY =
      stats.stdDev === 0
        ? 1 // Hauteur arbitraire si stdDev est 0
        : Math.max(...stats.gaussianCurve.map((p) => p.y));

    const scaleFactor = (maxGaussianY * 0.8) / maxHistValue;

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
          fill: false,
          yAxisID: "y",
        },
        {
          type: "bar",
          label: "Histogramme",
          data: Object.entries(histogram).map(([x, y]) => ({
            x: parseFloat(x),
            y: y * scaleFactor,
          })),
          backgroundColor: "rgba(255, 206, 100, 0.7)",
          yAxisID: "y",
          barPercentage: 1.0,
          categoryPercentage: 1.0,
          order: 1,
        },
        {
          type: "line",
          label: "Moyenne",
          data: [
            { x: stats.mean, y: 0 },
            {
              x: stats.mean,
              y: maxGaussianY,
            },
          ],
          borderColor: "#10B981",
          borderWidth: 2,
          borderDash: [10, 5],
          pointRadius: 0,
          yAxisID: "y",
        },
        // Affiche la limite Min seulement si elle est définie (non vide)
        ...(effectiveMinLimit !== null
          ? [
              {
                type: "line",
                label: "Limite Min",
                data: [
                  { x: effectiveMinLimit, y: 0 },
                  {
                    x: effectiveMinLimit,
                    y: maxGaussianY,
                  },
                ],
                borderColor: "rgba(255, 0, 0, 50)",
                borderWidth: 3,
                borderDash: [5, 5],
                pointRadius: 0,
                yAxisID: "y",
                order:0,
              },
            ]
          : []),

        // Affiche la limite Max seulement si elle est définie (non vide)
        ...(effectiveMaxLimit !== null
          ? [
              {
                type: "line",
                label: "Limite Max",
                data: [
                  { x: effectiveMaxLimit, y: 0 },
                  {
                    x: effectiveMaxLimit,
                    y: maxGaussianY,
                  },
                ],
                borderColor: "rgba(255, 0, 0, 50)",
                borderWidth: 3,
                borderDash: [5, 5],
                pointRadius: 0,
                yAxisID: "y",
                order:0,
              },
            ]
          : []),
      ],
    };
  };

  const calculateCapabilityIndices = () => {
    const effectiveMinLimit = minLimit !== "" ? parseFloat(minLimit) : null;
    const effectiveMaxLimit = maxLimit !== "" ? parseFloat(maxLimit) : null;

    if (
      !stats ||
      stats.stdDev <= 0 ||
      effectiveMinLimit === null ||
      effectiveMaxLimit === null
    ) {
      return { cp: null, cpk: null, pp: null, ppk: null };
    }

    const pp = (effectiveMaxLimit - effectiveMinLimit) / (6 * stats.stdDev);
    const ppk = Math.min(
      (effectiveMaxLimit - stats.mean) / (3 * stats.stdDev),
      (stats.mean - effectiveMinLimit) / (3 * stats.stdDev)
    );

    const stdDevShortTerm = stats.stdDev;

    const cp = (effectiveMaxLimit - effectiveMinLimit) / (6 * stdDevShortTerm);
    const cpk = Math.min(
      (effectiveMaxLimit - stats.mean) / (3 * stdDevShortTerm),
      (stats.mean - effectiveMinLimit) / (3 * stdDevShortTerm)
    );

    return { cp, cpk, pp, ppk };
  };

  const { cp, cpk, pp, ppk } = calculateCapabilityIndices();
  const chartData = prepareChartData();

  const currentMeasure = MEASURES.find((m) => m.value === selectedMeasure);
  const unit = currentMeasure?.label.match(/\(([^)]+)\)/)?.[1] || "";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        suggestedMin: minLimit ? parseFloat(minLimit) : undefined,
        suggestedMax: maxLimit ? parseFloat(maxLimit) : undefined, 
        title: {
          display: true,
          text: `${currentMeasure?.label.split("(")[0].trim()} (${unit})`,
          color: "#4FC0D0",
        },
        // Ajustement pour stdDev === 0 ou pas de données
        min:
          stats && stats.stdDev === 0
            ? stats.mean - 0.5 // Petite plage centrée sur la moyenne
            : stats && minLimit !== ""
            ? Math.min(stats.dataMin - 3 * stats.stdDev, parseFloat(minLimit))
            : stats && stats.values.length > 0
            ? stats.dataMin - 3 * stats.stdDev // Utilise la plage des données si pas de limites manuelles
            : -10, // Valeur par défaut si pas de données pour une visualisation initiale
        max:
          stats && stats.stdDev === 0
            ? stats.mean + 0.5 // Petite plage centrée sur la moyenne
            : stats && maxLimit !== ""
            ? Math.max(stats.dataMax + 3 * stats.stdDev, parseFloat(maxLimit))
            : stats && stats.values.length > 0
            ? stats.dataMax + 3 * stats.stdDev // Utilise la plage des données si pas de limites manuelles
            : 10, // Valeur par défaut si pas de données pour une visualisation initiale
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#FFFFFF",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.dataset.type === "bar") {
              const maxGaussianY = chartData.datasets[0]?.data[1]?.y || 1;
              label += `Valeur: ${context.parsed.x.toFixed(2)}, Fréquence: ${
                context.parsed.y / maxGaussianY
              }`;
            } else {
              label += context.parsed.x.toFixed(2);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div ref={ref} id="measure-graph">
      <div className="p-6 bg-gray-800 rounded-lg mt-10 hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20">
        <div className="flex justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl text-cyan-400">
              {currentMeasure?.label.split("(")[0].trim()} -{" "}
              {filteredResults[0]?.frequence ? filteredResults[0]?.frequence + "Hz" : "N/A"} - Antenne{" "}
              {filteredResults[0]?.ant || "N/A"} || Caisson: {selectedCaisson}
            </h2>
          
            <select
              value={selectedMeasure}
              onChange={(e) => onMeasureChange(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded outline-none"
            >
              {MEASURES.map((measure) => (
                <option key={measure.value} value={measure.value}>
                  {measure.label}
                </option>
              ))}
            </select>
          </div>
          <br />
          
          <div className="flex items-center gap-4">
            <label htmlFor="minLimit" className="text-white">
              Limite Min:
            </label>
            <input
              type="number"
              id="minLimit"
              value={minLimit}
              onChange={(e) => onMinLimitChange(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded w-24 outline-none"
              placeholder="Ex: -10"
            />
            <label htmlFor="maxLimit" className="text-white">
              Limite Max:
            </label>
            <input
              type="number"
              id="maxLimit"
              value={maxLimit}
              onChange={(e) => onMaxLimitChange(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded w-24 outline-none"
              placeholder="Ex: 10"
            />
            {/* Bouton Annuler toujours visible */}
            <button
              onClick={onCancelLimits}
              className="bg-red-500 hover:bg-gray-800 outline-none hover:text-red-500 border-2 border-red-500 cursor-pointer font-medium  p-2 rounded-lg transition duration-200"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Message d'erreur si pas de données ou écart-type de 0 */}
        {filteredResults.length === 0 && (
          <div className="bg-yellow-700 text-white p-3 rounded-lg mb-4 text-center">
            Aucune donnée ne correspond aux filtres sélectionnés.
          </div>
        )}
        {!stats && filteredResults.length > 0 && (
            <div className="bg-yellow-700 text-white p-3 rounded-lg mb-4 text-center">
              Les données pour la mesure sélectionnée ne sont pas valides ou sont manquantes.
            </div>
        )}
        {stats && stats.stdDev === 0 && (
          <div className="bg-yellow-700 text-white p-3 rounded-lg mb-4 text-center">
            L&apos;écart-type pour la mesure sélectionnée est de 0. Le graphique
            affiche une distribution à valeur unique. Les indices de capabilité
            ne sont pas pertinents.
          </div>
        )}

        {/* Affichage des statistiques et du graphique si des stats sont disponibles */}
        {stats && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Moyenne</h3>
                <p className="text-white text-xl">
                  {stats?.mean?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">{unit}</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Écart-type</h3>
                <p className="text-white text-xl">
                  {stats?.stdDev?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">{unit}</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Minimum (Données)</h3>
                <p className="text-white text-xl">
                  {stats?.dataMin?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">{unit}</span>
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-cyan-400">Maximum (Données)</h3>
                <p className="text-white text-xl">
                  {stats?.dataMax?.toFixed(2) || "N/A"}{" "}
                  <span className="text-sm text-gray-400">{unit}</span>
                </p>
              </div>
            </div>

            <div className="h-96">
              <Chart type="scatter" data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <Tooltipinf
                  titre="Cp (Indice de Capabilité du Processus)"
                  text="Mesure la capacité potentielle du processus à respecter les spécifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#111827"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="oklch(85.2% 0.199 91.936)"
                    className="size-9 flex justify-self-end -mb-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </Tooltipinf>
                <h3 className="text-cyan-400">Cp</h3>
                <p className="text-white text-xl">
                  {cp !== null ? cp.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <Tooltipinf
                  titre="Cpk (Indice de Capabilité Centré)"
                  text="Prend en compte le centrage du processus par rapport aux limites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#111827"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="oklch(85.2% 0.199 91.936)"
                    className="size-9 flex justify-self-end -mb-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </Tooltipinf>
                <h3 className="text-cyan-400">Cpk</h3>
                <p className="text-white text-xl">
                  {cpk !== null ? cpk.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <Tooltipinf
                  titre="Pp (Indice de Performance)"
                  text="Mesure la performance réelle du processus"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#111827"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="oklch(85.2% 0.199 91.936)"
                    className="size-9 flex justify-self-end -mb-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </Tooltipinf>
                <h3 className="text-cyan-400">Pp</h3>
                <p className="text-white text-xl">
                  {pp !== null ? pp.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <Tooltipinf
                  titre="Ppk (Indice de Performance Centré)"
                  text="Prend en compte le centrage et la performance réelle"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#111827"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="oklch(85.2% 0.199 91.936)"
                    className="size-9 flex justify-self-end -mb-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </Tooltipinf>
                <h3 className="text-cyan-400">Ppk</h3>
                <p className="text-white text-xl">
                  {ppk !== null ? ppk.toFixed(2) : "N/A"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

MeasureGraph.propTypes = {
  filteredResults: PropTypes.array.isRequired,
  selectedCaisson: PropTypes.string.isRequired,
   selectedMeasure: PropTypes.string.isRequired,
  onMeasureChange: PropTypes.func.isRequired,
  minLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  maxLimit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onMinLimitChange: PropTypes.func.isRequired,
  onMaxLimitChange: PropTypes.func.isRequired,
  onCancelLimits: PropTypes.func.isRequired,
};

export default forwardRef(MeasureGraph);