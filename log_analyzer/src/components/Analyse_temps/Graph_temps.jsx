import { useEffect, useRef, useState } from "react";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from "chart.js";
import PropTypes from "prop-types";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";

// Enregistrer les composants nécessaires de Chart.js
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

const Graph_temps = ({ tempsResults, operation, equipe }) => {
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [targetValue, setTargetValue] = useState(null);
    const [showTarget, setShowTarget] = useState(false);

    // Fonction pour préparer les données pour le graphique
    const prepareChartData = (data, target) => {
        if (!data || data.length === 0) return null;

        const hourlyData = {};

        data.forEach((item) => {
            const heure = item.heure;
            if (!heure) return;

            if (!hourlyData[heure]) {
                hourlyData[heure] = {
                    total: 0,
                    count: 0,
                    values: [],
                };
            }

            hourlyData[heure].total += item.valeur;
            hourlyData[heure].count++;
            hourlyData[heure].values.push(item.valeur);
        });

        const heures = Object.keys(hourlyData).sort((a, b) => a - b);
        let moyennes = heures.map((heure) => {
            const avg = hourlyData[heure].total / hourlyData[heure].count;
            return Number(avg.toFixed(2));
        });
        
        

        const datasets = [
            {
                label: `Durée moyenne des tests (${tempsResults[0]?.unite}) par heure`,
                data: moyennes,
                borderColor: "rgb(74, 222, 128)",
                backgroundColor: "rgba(74, 222, 128, 0.2)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "rgb(74, 222, 128)",
                pointBorderColor: "#fff",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(74, 222, 128)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                segment: {
                    borderColor: ctx => {
                        if (target !== null && !isNaN(target)) {;
                            return ctx.p1.parsed.y >= target ? "rgb(239, 68, 68)" : "rgb(74, 222, 128)";
                        }
                        return "rgb(74, 222, 128)";
                    }
                }

            },
        ];


        if (target !== null && !isNaN(target)) {
            datasets.push({
                label: "Objectif",
                data: Array(heures.length).fill(target),
                borderColor: "yellow",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            });
        }

        return {
            labels: heures.map((h) => `${h}h-${Number(h) + 1}h`),
            datasets,
        };
    };

    const handleTargetSubmit = () => {
        setShowTarget(true);
        setTargetValue(document.getElementById("targetInput").value);
    };

    const handleTargetCancel = () => {
        setTargetValue(null);
        setShowTarget(false);
        document.getElementById("targetInput").value = "";
    }

    useEffect(() => {
        updateChart();
    }, [showTarget, targetValue]);

    const updateChart = () => {
        if (!chartInstanceRef.current || !tempsResults) return;

        const chartData = prepareChartData(tempsResults, showTarget ? targetValue : null);
        chartInstanceRef.current.data = chartData;
        chartInstanceRef.current.update();
    };

    // Initialiser ou mettre à jour le graphique
    useEffect(() => {
        if (!tempsResults || tempsResults.length === 0) {
            setIsLoading(false);
            setError("Aucune donnée disponible");
            return;
        }

        const chartData = prepareChartData(tempsResults, showTarget ? targetValue : null);

        if (!chartData) {
            setIsLoading(false);
            setError("Données insuffisantes pour générer le graphique");
            return;
        }

        // Créer un élément canvas dynamiquement
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        // Nettoyer le conteneur précédent
        if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML = "";
            chartContainerRef.current.appendChild(canvas);
        }

        try {
            // Détruire l'instance précédente si elle existe
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Créer un nouveau graphique
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Impossible d'obtenir le contexte 2D");
            }

            chartInstanceRef.current = new Chart(ctx, {
                type: "line",
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top",
                            labels: {
                                color: "rgb(34, 211, 238)",
                                font: {
                                    size: 14,
                                },
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    if (context.datasetIndex === 0) {
                                        return `Moyenne: ${context.raw} ${tempsResults[0]?.unite}`;
                                    } else {
                                        return `Objectif: ${context.raw} ${tempsResults[0]?.unite}`;
                                    }
                                },
                                title: (context) => `Plage horaire: ${context[0].label}`,
                            },
                            backgroundColor: "rgb(0, 0, 0, 0.7)",
                            titleColor: "rgb(34, 211, 238)",
                            bodyColor: "rgb(34, 211, 238)",
                            borderColor: "rgb(34, 211, 238)",
                            borderWidth: 3,
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Plages horaires",
                                color: "rgb(34, 211, 238)",
                                font: {
                                    size: 14,
                                    weight: "bold",
                                },
                            },
                            ticks: {
                                color: "rgb(156, 163, 175)",
                            },
                            grid: {
                                color: "rgba(34, 211, 238)",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: `Durée moyenne (${tempsResults[0]?.unite})`,
                                color: "rgb(34, 211, 238)",
                                font: {
                                    size: 14,
                                    weight: "bold",
                                },
                            },
                            ticks: {
                                color: "rgb(156, 163, 175)",
                            },
                            grid: {
                                color: "rgba(34, 211, 238, 0.3)",
                            },
                            beginAtZero: false,
                        },
                    },
                },
            });

            setIsLoading(false);
            setError(null);
        } catch (err) {
            console.error("Erreur lors de la création du graphique:", err);
            setError("Erreur lors de la génération du graphique");
            setIsLoading(false);
        }

        // Nettoyage
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = "";
            }
        };
    }, [tempsResults]);


    const stats = [
        targetValue
    ];

    const exportPDF = () => {
        if (!stats || !chartContainerRef.current) return;

        const pdf = new jsPDF("landscape");
        const canvas = chartContainerRef.current.querySelector("canvas");

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
        const imgWidth = 270;
        const imgHeight = 100;
        const imgX = 15;
        const imgY = 30;

        const tableX = 20;
        const tableY = 150;
        const title = `Variation du temps || ${tempsResults[0]?.reference}`;

        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 255);
        const titleX = (pdf.internal.pageSize.width - pdf.getTextWidth(title)) / 2;
        pdf.text(title, titleX, 15);

        const data = [
            ["Equipe", equipe],
            ["Operation", operation],
        ];

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Caractéristiques du procédé", 20, 150);
        autoTable(pdf, {
            startY: tableY + 10,
            margin: { left: tableX },
            body: data,
            styles: {
                fontSize: 12,
                halign: "left",
                cellPadding: 3,
            },
            theme: "grid",
        });

        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);
        pdf.save(`${title}.pdf`);
    };

    return (
        <>
            <h1 className="text-3xl text-cyan-400 font-bold mb-5 mt-20">
                Courbe Du temps
            </h1>

            <div className="flex gap-5">
                <div className="flex gap-3 ">
                    <input
                        id="targetInput"
                        type="number"
                        placeholder="T - Objectif"
                        className="border-3 border-red-400 w-50 p-5 rounded-2xl text-xl font-medium text-red-400 h-15 outline-none"
                    />

                    <button
                        onClick={handleTargetSubmit}
                        className="text-black border-3 hover:border-red-400 hover:text-red-400 bg-red-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-35 text-xl px-4 py-2 cursor-pointer"
                    >
                        Afficher
                    </button>
                    <button
                        onClick={handleTargetCancel}
                        className="cursor-pointer bg-red-500 text-black border-3 border-red-500 p-2 text-xl h-15 w-30 rounded-2xl font-bold hover:bg-gray-950 hover:text-red-500 hover:border-red-500 shadow hover:shadow-none duration-75"
                    >
                        Masquer
                    </button>
                </div>
            </div>
            <div className="mb-10 flex-auto overflow-x-auto rounded-xl h-fit border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 hover:scale-102 duration-200">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                    Variation du temps || {tempsResults[0]?.reference}
                </h2>
                {isLoading ? (
                    <div className="text-white">Chargement du graphique...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="relative h-100 w-full" ref={chartContainerRef}></div>
                )}
                <button
                    className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2  font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400"
                    onClick={exportPDF}
                >
                    Exporter en PDF
                </button>
            </div>

        </>
    );
};

Graph_temps.propTypes = {
    tempsResults: PropTypes.array.isRequired,
    operation: PropTypes.string.isRequired,
    equipe: PropTypes.string.isRequired,
};


export default Graph_temps;