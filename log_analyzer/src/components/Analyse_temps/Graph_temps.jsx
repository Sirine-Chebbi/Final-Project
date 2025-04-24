import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

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

const Graph_temps = () => {

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
                    backgroundColor: "rgba(239, 68, 68, 0.7)", // Using rgba color
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

        const pdf = new jsPDF("landscape");
        const canvas = "";

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
        const imgWidth = 192;
        const imgHeight = 140;
        const imgX = 15;
        const imgY = 30;

        const { mean, stdDev, limMin, limMax } = stats;
        const tableX = 215;
        const tableY = 45;
        const title = ` Variation Temps || Position: `;

        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 255);
        const titleX = (pdf.internal.pageSize.width - pdf.getTextWidth(title)) / 2;
        pdf.text(title, titleX, 15);

        const data = [
            ["Nombre d'échantillon"],
            ["Moyenne", mean.toFixed(2)],
            ["Écart-type", stdDev.toFixed(2)],
            ["LSI", limMin],
            ["LSS", limMax],
        ];

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Caractéristiques du procédé", 215, 50);
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
        pdf.text("Capabilité globale", 225, 120);

        autoTable(pdf, {
            startY: tableY + 70,
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
                Courbe Du temps
            </h1>

            <div className="flex gap-5">
                <div className="flex gap-3 mb-10">
                    <input
                        type="text"
                        id="inputc"
                        placeholder="T - Objectif"
                        className="border-3 border-red-400 w-50 p-5 rounded-2xl text-xl font-medium text-red-400 h-15 outline-none"
                    />

                    <button
                        className="text-black border-3 hover:border-red-400 hover:text-red-400  bg-red-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-35 text-xl px-4 py-2 cursor-pointer"
                    >
                        Enregistrer
                    </button>
                    <button
                        className="cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75"
                    >
                        Annuler
                    </button>
                </div>
            </div>
            {(
                <div
                    className="p-6 bg-gray-800 rounded-lg hover:scale-102 duration-200 hover:shadow-cyan-400 shadow-2xl mb-20"
                >
                    <h2 className="text-2xl text-cyan-400 mb-4">
                    Variation temps  || Refrance: { }
                    </h2>

                    <div className="grid grid-cols-4 gap-4 mb-6">

                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-cyan-400">Cible</h3>
                            <p className="text-white text-xl">
                                {stats?.mean?.toFixed(2) || "N/A"}{" "}
                                <span className="text-sm text-gray-400">{[0]?.unite}</span>
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-cyan-400">Écart-type</h3>
                            <p className="text-white text-xl">
                                {stats?.stdDev?.toFixed(2) || "N/A"}{" "}
                                <span className="text-sm text-gray-400">{[0]?.unite}</span>
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-cyan-400">LSI</h3>
                            <p className="text-white text-xl">
                                {stats?.min?.toFixed(2) || "N/A"}{" "}
                                <span className="text-sm text-gray-400">{[0]?.unite}</span>
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-cyan-400">LSS</h3>
                            <p className="text-white text-xl">
                                {stats?.max?.toFixed(2) || "N/A"}{" "}
                                <span className="text-sm text-gray-400">{[0]?.unite}</span>
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

                    <br />

                    <button
                        className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2 font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400"
                        onClick={exportPDF}
                    >
                        Exporter en PDF
                    </button>


                    <div className="p-6 bg-gray-800 rounded-lg mt-10 text-yellow-400">
                        Aucune donnée ne correspond aux filtres sélectionnés
                    </div>
                </div>
            )}
        </>
    );
};
export default Graph_temps;
