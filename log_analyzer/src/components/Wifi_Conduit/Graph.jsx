import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  XAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  Bar,
  ComposedChart,
} from "recharts";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";

const gaussian = (x, mean, stdDev) => {
  return (
    (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
  );
};

export const Graph = ({testResults, selectedFrequency, selectedAntenne, Bande, Antenne, Results, selectedCaisson}) => {

  const powerGraphRef = useRef(null);
  const evmGraphRef = useRef(null);
  const rssGraphRef = useRef(null);
  const deltaraphRef = useRef(null);

  var filteredResults = testResults;

  if (selectedAntenne != "" && selectedFrequency != "") {
    filteredResults =
      selectedFrequency || selectedAntenne
        ? testResults.filter(
          (result) =>
            result.frequence == selectedFrequency &&
            result.ant == selectedAntenne
        )
        : testResults;
  } else {
    filteredResults =
      selectedFrequency || selectedAntenne
        ? testResults.filter(
          (result) =>
            result.frequence == selectedFrequency ||
            result.ant == selectedAntenne
        )
        : testResults;
  }
  
  var filteredResults1 = Results;

  if (Antenne != 0 && Bande != "") {
      filteredResults1 = Antenne || Bande
          ? Results.filter((result) => (result.ant == Antenne) && (result.type_gega == Bande))
          : Results;

  } else {
      filteredResults1 = Antenne || Bande
          ? Results.filter((result) => (result.type_gega == Bande) || (result.ant == Antenne))
          : Results;
  }

  const point = filteredResults.map((result) => ({
    point: result.power_rms_avg,
  }));

  const point_evm = filteredResults.map((result) => ({
    point: result.evm,
  }));

  const point_rss = filteredResults.map((result) => ({
    point: result.rssi
  }));

  const point_delta = filteredResults1.map((result) => ({
    point: result.delta
  }));


  const nbrf = filteredResults.length > 0 ? filteredResults[0].nbrfile : null;

  const allPoints = point.map((p) => p.point);
  const allPoints_evm = point_evm.map((p) => p.point);
  const allPoints_rss = point_rss.map((p) => p.point);
  const allPoints_delta = point_delta.map((p) => p.point);



  const mean = allPoints.length > 0 ?
    allPoints.reduce((acc, value) => acc + value, 0) / allPoints.length
    : 0;

  const mean_evm = allPoints_evm.length > 0 ?
    allPoints_evm.reduce((acc, value) => acc + value, 0) / allPoints_evm.length
    : 0;

  const mean_rss = allPoints_rss.length > 0 ?
    allPoints_rss.reduce((acc, value) => acc + value, 0) / allPoints_rss.length
    : 0;

    const mean_delta = allPoints_delta.length > 0 ?
    allPoints_delta.reduce((acc, value) => acc + value, 0) / allPoints_delta.length
    : 0;




  const stdDev = Math.sqrt(
    allPoints.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
    allPoints.length
  );

  const stdDev_evm = Math.sqrt(
    allPoints_evm.reduce((acc, value) => acc + Math.pow(value - mean_evm, 2), 0) /
    allPoints_evm.length
  );

  const stdDev_rss = Math.sqrt(
    allPoints_rss.reduce((acc, value) => acc + Math.pow(value - mean_rss, 2), 0) /
    allPoints_rss.length
  );

  const stdDev_delta = Math.sqrt(
    allPoints_delta.reduce((acc, value) => acc + Math.pow(value - mean_delta, 2), 0) /
    allPoints_delta.length
  );


  const gaussianData = [];
  const gaussianData_evm = [];
  const gaussianData_rss = [];
  const gaussianData_delta = [];


  const step = 0.1;
  const step_evm = 0.1;
  const step_rss = 0.1;
  const step_delta = 0.1;


  let Lmin = filteredResults.length > 0 ? filteredResults[0].limit_min : null;
  let Lmax = filteredResults.length > 0 ? filteredResults[0].limit_max : null;
  if (Lmax == null) {
    Lmax = 0;
  }
  if (Lmin == null) {
    Lmin = 0;
  }

  let Lmin_evm = filteredResults.length > 0 ? filteredResults[0].evm_min : null;
  let Lmax_evm = filteredResults.length > 0 ? filteredResults[0].evm_max : null;
  if (Lmax_evm == null) {
    Lmax_evm = 0;
  }
  if (Lmin_evm == null) {
    Lmin_evm = 0;
  }

  let Lmin_rss = filteredResults.length > 0 ? filteredResults[0].rssi_min : null;
  let Lmax_rss = filteredResults.length > 0 ? filteredResults[0].rssi_max : null;
  if (Lmax_rss == null) {
    Lmax_rss = 0;
  }
  if (Lmin_rss == null) {
    Lmin_rss = -0;
  }


  const xStart = Math.min(...allPoints, Lmin) - 0.5;
  const xEnd = Math.max(...allPoints, Lmax) + 0.5;

  const xStart_evm = Math.min(...allPoints_evm, Lmin_evm) - 2;
  const xEnd_evm = Math.max(...allPoints_evm, Lmax_evm) + 2;

  const xStart_rss = Math.min(...allPoints_rss, Lmin_rss) - 2;
  const xEnd_rss = Math.max(...allPoints_rss, Lmax_rss) + 2;

  const xStart_delta = Math.min(...allPoints_delta) - 2;
  const xEnd_delta = Math.max(...allPoints_delta) + 2;



  for (let x = xStart; x <= xEnd; x += step) {
    const gaussianValue = gaussian(x, mean, stdDev);
    gaussianData.push({
      timestamp: Number(x.toFixed(1)),
      value: gaussianValue,
    });
  }

  for (let x_evm = xStart_evm; x_evm <= xEnd_evm; x_evm += step_evm) {
    const gaussianValue_evm = gaussian(x_evm, mean_evm, stdDev_evm);
    gaussianData_evm.push({
      timestamp_evm: Number(x_evm.toFixed(1)),
      value_evm: gaussianValue_evm,
    });
  }

  for (let x_rss = xStart_rss; x_rss <= xEnd_rss; x_rss += step_rss) {
    const gaussianValue_rss = gaussian(x_rss, mean_rss, stdDev_rss);
    gaussianData_rss.push({
      timestamp_rss: Number(x_rss.toFixed(1)),
      value_rss: gaussianValue_rss,
    });
  }

  for (let x_delta = xStart_delta; x_delta <= xEnd_delta; x_delta += step_delta) {
    const gaussianValue_delta = gaussian(x_delta, mean_delta, stdDev_delta);
    gaussianData_delta.push({
      timestamp_delta: Number(x_delta.toFixed(1)),
      value_delta: gaussianValue_delta,
    });
  }

  const exportPDF = (graph) => {

    let currentRef;
    if (graph == "power") {
      currentRef = powerGraphRef.current;
    } else if (graph == "evm") {
      currentRef = evmGraphRef.current;
    } else if (graph == "rss") {
      currentRef = rssGraphRef.current;
    }else if (graph == "delta") {
      currentRef = deltaraphRef.current;
    }


    console.log(graph);


    if (!currentRef) return;

    html2canvas(currentRef, { scale: 3, backgroundColor: "#fff" }).then(
      (canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape");

        // Position du graphique
        const imgX = 15;
        const imgY = 30;
        const imgWidth = 180;
        const imgHeight = 140;

        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

        // Position du tableau à droite de l'image
        const tableX = imgX + imgWidth + 25; // Décalé de 10 unités à droite
        const tableY = imgY + 5;

        let data = [
          ["Nombre de cartes", nbrf],
          ["Cible", mean.toFixed(2)],
          ["Écart-type", stdDev.toFixed(2)],
          ["LSI", Lmin],
          ["LSS", Lmax],
        ];

        if (graph == "evm") {
          data = [
            ["Nombre de cartes", nbrf],
            ["Cible", mean_evm.toFixed(2)],
            ["Écart-type", stdDev_evm.toFixed(2)],
            ["LSI", Lmin_evm],
            ["LSS", Lmax_evm],
          ];
        } else if (graph == "rss") {
          data = [
            ["Nombre de cartes", nbrf],
            ["Cible", mean_rss.toFixed(2)],
            ["Écart-type", stdDev_rss.toFixed(2)],
            ["LSI", Lmin_rss],
            ["LSS", Lmax_rss],
          ];
        }else if (graph == "delta") {
          data = [
            ["Nombre de cartes", nbrf],
            ["Cible", mean_delta.toFixed(2)],
            ["Écart-type", stdDev_delta.toFixed(2)],
            ["LSI", 0],
            ["LSS", 0],
          ];
        }
    

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Caractéristiques du procédé", 215, 40);

        // Génération du tableau avec styles ajustés
        autoTable(pdf, {
          startY: tableY,
          margin: { left: tableX }, // Positionner à droite du graphique
          head: [["", ""]], // Séparé du titre principal
          body: data,
          styles: {
            fontSize: 12, // Augmenter la taille du texte dans le tableau
            halign: "left", // Centrer le texte dans chaque cellule
            cellPadding: 3, // Ajouter un padding pour plus de lisibilité
          },
          theme: "plain", // Ajoute un léger cadre aux cellules
        });

        let power = [
          ["Cp", cp.toFixed(2)],
          ["Pp", pp.toFixed(2)],
          ["Cpk", cpk.toFixed(2)],
          ["Ppk", ppk.toFixed(2)],
        ];

        if (graph == "evm") {
          power = [
            ["Cp", cp_evm.toFixed(2)],
            ["Pp", pp_evm.toFixed(2)],
            ["Cpk", cpk_evm.toFixed(2)],
            ["Ppk", ppk_evm.toFixed(2)],
          ];
        } else if (graph == "rss") {
          power = [
            ["Cp", cp_rss.toFixed(2)],
            ["Pp", pp_rss.toFixed(2)],
            ["Cpk", cpk_rss.toFixed(2)],
            ["Ppk", ppk_rss.toFixed(2)],
          ];
        }else if (graph == "delta") {
          power = [
            ["Cp", 0],
            ["Pp", 0],
            ["Cpk", 0],
            ["Ppk", 0],
          ];
        }

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Capabilité globale", 225, 110);

        autoTable(pdf, {
          startY: tableY + 70,
          margin: { left: tableX }, // Positionner à droite du graphique
          head: [["", ""]], // Séparé du titre principal
          body: power,
          styles: {
            fontSize: 12, // Augmenter la taille du texte dans le tableau
            halign: "left", // Centrer le texte dans chaque cellule
            cellPadding: 3, // Ajouter un padding pour plus de lisibilité
          },
          theme: "plain", // Ajoute un léger cadre aux cellules
        });

        // Titre principal centré
        pdf.setFontSize(18);
        pdf.setTextColor("#0000FF");

        let title = ""

        if (graph == "power") {
          title = `POWER_RMS_AVG_VSA1 ${selectedFrequency} A${selectedAntenne} || Caisson: ${selectedCaisson}`;
        }
        else if (graph == "evm") {
          title = `PK_EVM_DB_AVG_S1 ${selectedFrequency} A${selectedAntenne} || Caisson: ${selectedCaisson}`;
        }
        else if (graph == "rssi"){
          title = `${selectedFrequency} RSSI_RX${selectedAntenne} || Caisson: ${selectedCaisson}`;
        }
        else if (graph == "delta") {
          title = `a-delta-${Antenne} pour la bande ${Bande} || Caisson: ${selectedCaisson}`;
        }

        const titleX =
          (pdf.internal.pageSize.width - pdf.getTextWidth(title)) / 2;
          pdf.text(title, titleX, 15);

        pdf.save(`graph_export_${selectedFrequency}_A${selectedAntenne}.pdf`);
      }
    );
  };

  const cp = stdDev > 0 ? (Lmax - Lmin) / (6 * stdDev) : 0;
  const pp = stdDev > 0 ? (Lmax - Lmin) / (6 * stdDev) : 0;
  const cpk =
    stdDev > 0
      ? Math.min((Lmax - mean) / (3 * stdDev), (mean - Lmin) / (3 * stdDev))
      : 0;
  const ppk =
    stdDev > 0
      ? Math.min((Lmax - mean) / (3 * stdDev), (mean - Lmin) / (3 * stdDev))
      : 0;


  const cp_evm = stdDev_evm > 0 ? (Lmax_evm - Lmin_evm) / (6 * stdDev_evm) : 0;
  const pp_evm = stdDev_evm > 0 ? (Lmax_evm - Lmin_evm) / (6 * stdDev_evm) : 0;
  const cpk_evm =
    stdDev_evm > 0
      ? Math.min((Lmax_evm - mean_evm) / (3 * stdDev_evm), (mean_evm - Lmin_evm) / (3 * stdDev_evm))
      : 0;
  const ppk_evm =
    stdDev_evm > 0
      ? Math.min((Lmax_evm - mean_evm) / (3 * stdDev_evm), (mean_evm - Lmin_evm) / (3 * stdDev_evm))
      : 0;

  const cp_rss = stdDev_rss > 0 ? (Lmax_rss - Lmin_rss) / (6 * stdDev_rss) : 0;
  const pp_rss = stdDev_rss > 0 ? (Lmax_rss - Lmin_rss) / (6 * stdDev_rss) : 0;
  const cpk_rss =
    stdDev_rss > 0
      ? Math.min((Lmax_rss - mean_rss) / (3 * stdDev_rss), (mean_rss - Lmin_rss) / (3 * stdDev_rss))
      : 0;
  const ppk_rss =
    stdDev_rss > 0
      ? Math.min((Lmax_rss - mean_rss) / (3 * stdDev_rss), (mean_rss - Lmin_rss) / (3 * stdDev_rss))
      : 0;


  return (
    <>
      <p id="pwr"></p>
      <div className="p-10 font-bold border-2 border-cyan-400 rounded-xl hover:shadow-cyan-400 shadow-xl duration-200 hover:scale-103 mt-20 mb-10 flex flex-row">
        <div className="w-4/5">
          <h2 className="text-2xl text-yellow-400 font-mono text-center mb-5">
            POWER_RMS_AVG_VSA1 {selectedFrequency} A{selectedAntenne} || Caisson: {selectedCaisson}
          </h2>
          <div className="graph-container" ref={powerGraphRef}>
            <ResponsiveContainer width="100%" height={520}>
              <ComposedChart data={gaussianData}>
                  <CartesianGrid strokeOpacity={0.5} />
                  <XAxis dataKey="timestamp" />
                  <Tooltip />
                  <Bar dataKey="value"fill="#03befc" barSize={10}/>
                  <ReferenceLine
                    x={parseFloat(mean.toFixed(1))}
                    stroke="green"
                    label="Cible"
                    strokeDasharray="5 5"
                  />
                  <ReferenceLine
                    x={Lmin}
                    stroke="red"
                    label="LSI"
                    strokeDasharray="5 5"
                  />
                  <ReferenceLine
                    x={Lmax}
                    stroke="red"
                    label="LSS"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="red"
                    dot={false}
                  />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={async () => exportPDF("power")}
            className="mt-0 px-4 py-2 bg-cyan-400 hover:text-cyan-400 hover:bg-black duration-150 border-2 border-cyan-400 rounded-xl cursor-pointer text-black" >
              Exporter en PDF
          </button>
        </div>

        <div className="text-white p-10 mt-20 w-90">
          <h1 className="bold text-2xl">
            Nombre de Cartes: <span className="text-yellow-400">{nbrf}</span>
          </h1>
          <br />
          <ul className="text-xl w-fit text-left space-y-2">
            <li className="flex justify-between w-40 mt-5">
              <span>Cible </span>{" "}
              <span className="text-green-600">{mean.toFixed(2)}</span>
            </li>
            <li className="flex justify-between w-40 mt-5">
              <span>CP </span>{" "}
              <span className="text-yellow-400">{cp.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PP</span>
              <span className="text-yellow-400">{pp.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>CPK</span>
              <span className="text-yellow-400">{cpk.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PPK</span>
              <span className="text-yellow-400">{ppk.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>LSI</span>
              <span className="text-red-500">{Lmin.toFixed(2)} </span>
            </li>
            <li className="flex justify-between">
              <span>LSS</span>
              <span className="text-red-500 ">{Lmax.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </div>
      <p id="evm"></p>
      <div className="p-10 font-bold border-2 border-cyan-400 rounded-xl hover:shadow-cyan-400 shadow-xl duration-200 hover:scale-103 mt-20 mb-10 flex flex-row">
        <div className="w-4/5">
          <h2 className="text-2xl text-yellow-400 font-mono text-center mb-5">
            PK_EVM_DB_AVG_S1 {selectedFrequency} A{selectedAntenne} || Caisson: {selectedCaisson}
          </h2>
          <div className="graph-container" ref={evmGraphRef}>
            <ResponsiveContainer width="100%" height={520}>
              <ComposedChart data={gaussianData_evm}>
                <CartesianGrid strokeOpacity={0.5} />
                <XAxis dataKey="timestamp_evm" />
                <Tooltip />
                <Bar dataKey="value_evm"fill="#03befc" barSize={10}/>
                <ReferenceLine
                  x={parseFloat(mean_evm.toFixed(1))}
                  stroke="green"
                  label="Cible"
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  x={Lmin_evm == 0 ? xStart_evm : Lmin_evm}
                  stroke="red"
                  label="LSI"
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  x={Lmax_evm == 0 ? xEnd_evm : Lmax_evm}
                  stroke="red"
                  label="LSS"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="value_evm"
                  stroke="red"
                  dot={false}
                />

              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={async () => exportPDF("evm")}
            className="mt-0 px-4 py-2 bg-cyan-400 hover:text-cyan-400 hover:bg-black duration-150 border-2 border-cyan-400 rounded-xl cursor-pointer text-black"
          >
            Exporter en PDF
          </button>
        </div>

        <div className="text-white p-10 mt-20 w-90">
          <h1 className="bold text-2xl">
            Nombre de Cartes: <span className="text-yellow-400">{nbrf}</span>
          </h1>
          <br />
          <ul className="text-xl w-fit text-left space-y-2">
            <li className="flex justify-between w-40 mt-5">
              <span>Cible </span>{" "}
              <span className="text-green-600">{mean_evm.toFixed(2)}</span>
            </li>
            <li className="flex justify-between w-40 mt-5">
              <span>CP </span>{" "}
              <span className="text-yellow-400">{cp_evm.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PP</span>
              <span className="text-yellow-400">{pp_evm.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>CPK</span>
              <span className="text-yellow-400">{cpk_evm.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PPK</span>
              <span className="text-yellow-400">{ppk_evm.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>LSI</span>
              <span className="text-red-500"> {Lmin_evm == 0 ? "- infinie" : Lmin_evm.toFixed(2)} </span>
            </li>
            <li className="flex justify-between">
              <span>LSS</span>
              <span className="text-red-500 "> {Lmax_evm == 0 ? "+ infinie" : Lmax_evm.toFixed(2)} </span>
            </li>
          </ul>
        </div>
      </div>
      <p id="rssi"></p>
      <div className="p-10 font-bold border-2 border-cyan-400 rounded-xl hover:shadow-cyan-400 shadow-xl duration-200 hover:scale-103 mt-20 mb-10 flex flex-row">
        <div className="w-4/5">
          <h2 className="text-2xl text-yellow-400 font-mono text-center mb-5">
            {selectedFrequency} RSSI_RX{selectedAntenne} || Caisson: {selectedCaisson}
          </h2>
          <div className="graph-container" ref={rssGraphRef}>
            <ResponsiveContainer width="100%" height={520}>
            <ComposedChart data={gaussianData_rss}>
                <CartesianGrid strokeOpacity={0.5} />
                <XAxis dataKey="timestamp_rss" />
                <Tooltip />
                <Bar dataKey="value_rss"fill="#03befc" barSize={10}/>
                <ReferenceLine
                  x={parseFloat(mean_rss.toFixed(1))}
                  stroke="green"
                  label="Cible"
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  x={Lmin_rss}
                  stroke="red"
                  label="LSI"
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  x={Lmax_rss}
                  stroke="red"
                  label="LSS"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="value_rss"
                  stroke="red"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={async () => exportPDF("rss")}
            className="mt-0 px-4 py-2 bg-cyan-400 hover:text-cyan-400 hover:bg-black duration-150 border-2 border-cyan-400 rounded-xl cursor-pointer text-black"
          >
            Exporter en PDF
          </button>
        </div>

        <div className="text-white p-10 mt-20 w-90">
          <h1 className="bold text-2xl">
            Nombre de Cartes: <span className="text-yellow-400">{nbrf}</span>
          </h1>
          <br />
          <ul className="text-xl w-fit text-left space-y-2">
            <li className="flex justify-between w-40 mt-5">
              <span>Cible </span>{" "}
              <span className="text-green-600">{mean_rss.toFixed(2)}</span>
            </li>
            <li className="flex justify-between w-40 mt-5">
              <span>CP </span>{" "}
              <span className="text-yellow-400">{cp_rss.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PP</span>
              <span className="text-yellow-400">{pp_rss.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>CPK</span>
              <span className="text-yellow-400">{cpk_rss.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>PPK</span>
              <span className="text-yellow-400">{ppk_rss.toFixed(2)}</span>
            </li>
            <br />
            <li className="flex justify-between">
              <span>LSI</span>
              <span className="text-red-500">{Lmin_rss.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>LSS</span>
              <span className="text-red-500 ">{Lmax_rss.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </div>
      <p id="deltagraph"></p>
      <div className="p-10 font-bold border-2 border-yellow-400 rounded-xl hover:shadow-yellow-400 shadow-xl duration-200 hover:scale-103 mt-20 mb-10 ">

        <div className="flex justify-center gap-20">
          <h2 className="text-2xl text-yellow-400 font-mono text-center mb-5">
            Delta {Bande} Antenne {Antenne} || Caisson: {selectedCaisson}
          </h2>
          <h1 className="bold text-2xl text-white">
            <p> Nombre de Cartes: <span className="text-yellow-400">{nbrf}</span></p>
          </h1>
          <h1 className="bold text-2xl text-white">
            <p>Cible:  <span className="text-green-600">{mean_delta.toFixed(2)}</span></p>
          </h1>

        </div>  
          <div className="graph-container" ref={deltaraphRef}>
            <ResponsiveContainer width="100%" height={520}>
            <ComposedChart data={gaussianData_delta}>
                <CartesianGrid strokeOpacity={0.5} />
                <XAxis dataKey="timestamp_delta" />
                <Tooltip />
                <Bar dataKey="value_rss"fill="#03befc" barSize={10}/>
                <ReferenceLine
                  x={parseFloat(mean_delta.toFixed(1))}
                  stroke="green"
                  label="Cible"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="value_delta"
                  stroke="red"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={async () => exportPDF("delta")}
            className="mt-0 px-4 py-2 bg-yellow-400 hover:text-yellow-400 hover:bg-black duration-150 border-2 border-yellow-400 rounded-xl cursor-pointer text-black"
          >
            Exporter en PDF
          </button>
        </div>   
    </>
  );
};

Graph.propTypes = {
  testResults: PropTypes.array,
  Results: PropTypes.array,
  selectedFrequency: PropTypes.string,
  selectedAntenne: PropTypes.string,
  Bande: PropTypes.string,
  Antenne: PropTypes.number,
  selectedCaisson: PropTypes.string,
};
