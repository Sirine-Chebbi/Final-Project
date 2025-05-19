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
import Tooltipinf from "../Tooltipinf";
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
    const [error, setError] = useState(null);
    const [targetValue, setTargetValue] = useState(null);
    const [showTarget, setShowTarget] = useState(false);
    const [groupBy, setGroupBy] = useState('hour'); // 'hour', 'day' ou 'month'

    const prepareHourlyData = (data, target) => {
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
                        if (target !== null && !isNaN(target)) {
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

    const prepareDailyData = (data, target) => {
        const dailyData = {};

        data.forEach((item) => {
            if (!item.date) return;

            const date = item.date.split('T')[0]; // Format YYYY-MM-DD
            if (!dailyData[date]) {
                dailyData[date] = {
                    total: 0,
                    count: 0,
                    values: []
                };
            }

            dailyData[date].total += item.valeur;
            dailyData[date].count++;
            dailyData[date].values.push(item.valeur);
        });

        const dates = Object.keys(dailyData).sort();
        const moyennes = dates.map(date => {
            const avg = dailyData[date].total / dailyData[date].count;
            return Number(avg.toFixed(2));
        });

        const datasets = [
            {
                label: `Durée moyenne des tests (${tempsResults[0]?.unite}) par jour`,
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
                        if (target !== null && !isNaN(target)) {
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
                data: Array(dates.length).fill(target),
                borderColor: "yellow",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            });
        }

        return {
            labels: dates,
            datasets,
        };
    };

    const prepareMonthlyData = (data, target) => {
        const monthlyData = {};

        data.forEach((item) => {
            if (!item.date) return;

            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    total: 0,
                    count: 0,
                    values: []
                };
            }

            monthlyData[monthKey].total += item.valeur;
            monthlyData[monthKey].count++;
            monthlyData[monthKey].values.push(item.valeur);
        });

        const months = Object.keys(monthlyData).sort();
        const moyennes = months.map(month => {
            const avg = monthlyData[month].total / monthlyData[month].count;
            return Number(avg.toFixed(2));
        });

        const datasets = [
            {
                label: `Durée moyenne des tests (${tempsResults[0]?.unite}) par mois`,
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
                        if (target !== null && !isNaN(target)) {
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
                data: Array(months.length).fill(target),
                borderColor: "yellow",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            });
        }

        return {
            labels: months.map(m => {
                const [year, month] = m.split('-');
                return `${month}/${year}`;
            }),
            datasets,
        };
    };

    const prepareChartData = (data, target) => {
        if (!data || data.length === 0) return null;

        switch (groupBy) {
            case 'day':
                return prepareDailyData(data, target);
            case 'month':
                return prepareMonthlyData(data, target);
            case 'hour':
            default:
                return prepareHourlyData(data, target);
        }
    };

    const handleTargetSubmit = () => {
        setShowTarget(true);
        setTargetValue(document.getElementById("targetInput").value);
        updateChart();
    };

    const handleTargetCancel = () => {
        setTargetValue(null);
        setShowTarget(false);
        document.getElementById("targetInput").value = "";
    };

    const updateChart = () => {
        if (!chartInstanceRef.current || !tempsResults) return;
        const chartData = prepareChartData(tempsResults, showTarget ? targetValue : null);
        chartInstanceRef.current.data = chartData;
        chartInstanceRef.current.update();
    };

    useEffect(() => {
        if (!tempsResults || tempsResults.length === 0) {
            setError("Aucune donnée disponible");
            return;
        }

        const chartData = prepareChartData(tempsResults, showTarget ? targetValue : null);

        if (!chartData) {
            setError("Données insuffisantes pour générer le graphique");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML = "";
            chartContainerRef.current.appendChild(canvas);
        }

        try {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

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
                                title: (context) => {
                                    if (groupBy === 'hour') {
                                        return `Plage horaire: ${context[0].label}`;
                                    } else if (groupBy === 'day') {
                                        return `Date: ${context[0].label}`;
                                    } else {
                                        return `Mois: ${context[0].label}`;
                                    }
                                },
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
                                text: groupBy === 'hour' ? "Plages horaires" :
                                    groupBy === 'day' ? "Dates" : "Mois",
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

            setError(null);
        } catch (err) {
            console.error("Erreur lors de la création du graphique:", err);
            setError("Erreur lors de la génération du graphique");
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = "";
            }
        };
    }, [tempsResults, showTarget, targetValue, groupBy]);

    const exportPDF = () => {
        if (!chartContainerRef.current) return;

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
            ["Affichage", groupBy === 'hour' ? "Par heure" : groupBy === 'day' ? "Par jour" : "Par mois"],
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

            <div className="flex flex-wrap gap-5 items-center mb-4">
                <div className="flex gap-3">
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

                <div className="flex gap-3 items-center">
                    <div className="border-2 border-cyan-400 rounded-xl text-lg p-2 text-cyan-400">
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className=" p-2 outline-none"
                        >
                            <option value="hour" className="text-black">Par heure</option>
                            <option value="day" className="text-black">Par jour</option>
                            <option value="month" className="text-black">Par mois</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-10 flex-auto overflow-x-auto rounded-xl h-fit border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 mt-10 bg-gray-900 hover:scale-102 duration-200">
                <Tooltipinf position="left" titre="Courbe du temps" text="une courbe qui affiche la variation de la moyenne du temps écoulé pour les tests, donnée par heure, jour ou mois.">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#111827" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(85.2% 0.199 91.936)" className="size-9 flex justify-self-end -mb-6 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                </Tooltipinf>
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                    Variation du temps || {tempsResults[0]?.reference}
                </h2>
                {error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="relative h-100 w-full" ref={chartContainerRef}></div>
                )}
                <button
                    className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2 font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400 mt-4"
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