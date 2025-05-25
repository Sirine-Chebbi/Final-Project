import { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Powergraph from './Powergraph';
import Evmgraph from './Evmgraph';
import Rssigraph from './Rssigraph';
import Deltagraph from './Deltagraph';
import PropTypes from 'prop-types';
import MeasureGraph from './MeasureGraph';

const GraphWithRef = ({ Component, ...props }, ref) => (
  <div ref={ref}>
    <Component {...props} />
  </div>
);

GraphWithRef.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

const ExportAllGraphs = ({ filteredResults, selectedCaisson, Results, currentSelectedMeasureForExport, minLimitForExport, maxLimitForExport, power, evm, rx, rssi }) => {

  const nbr = filteredResults.length;
  const nbrdelta = Results.length;
  let nombre = 0;

  const chartRefs = {
    power: useRef(),
    evm: useRef(),
    rssi: useRef(),
    delta: useRef(),
    mesure: useRef()
  };

  const charts = [
    {
      name: 'Powergraph',
      ref: chartRefs.power,
      Component: Powergraph,
      props: { filteredResults, selectedCaisson }
    },
    {
      name: 'Evmgraph',
      ref: chartRefs.evm,
      Component: Evmgraph,
      props: { filteredResults, selectedCaisson }
    },
    {
      name: 'Rssigraph',
      ref: chartRefs.rssi,
      Component: Rssigraph,
      props: { filteredResults, selectedCaisson }
    },
    {
      name: 'Deltagraph',
      ref: chartRefs.delta,
      Component: Deltagraph,
      props: { Results, selectedCaisson }
    },
    {
      name: 'Mesuregraph',
      ref: chartRefs.mesure,
      Component: MeasureGraph,
      props: {
        filteredResults, selectedCaisson,
        selectedMeasure: currentSelectedMeasureForExport,
        onMeasureChange: () => { },
        minLimit: minLimitForExport,
        maxLimit: maxLimitForExport,
        onMinLimitChange: () => { },
        onMaxLimitChange: () => { },
        onCancelLimits: () => { },
      }
    }
  ];

  const exportToPDF = async () => {

    const pdf = new jsPDF('landscape');
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth * 0.6;
    const imgHeight = 120;
    const tableWidth = pageWidth * 0.35;

    // Style global
    pdf.setFont('helvetica');
    pdf.setTextColor(40, 40, 40);

    // Fonction pour extraire les indicateurs de capabilité
    const extractCapabilityIndices = (ref) => {
      if (!ref.current) return {};

      const indicesContainer = ref.current.querySelector('.grid.grid-cols-4:last-child');
      if (!indicesContainer) return {};

      const indices = {};
      Array.from(indicesContainer.children).forEach(div => {
        const label = div.querySelector('h3').textContent;
        const value = div.querySelector('p').textContent;
        indices[label] = value;
      });

      return indices;
    };

    // Updated function with conditional capability extraction
    const captureGraphData = async (chart, title, extractCapability = true) => {
      const ref = chart.ref;

      if (!ref?.current) return null;

      const canvas = ref.current.querySelector('canvas');
      if (!canvas) return null;

      const imgData = canvas.toDataURL('image/png', 1.0);

      const stats = {};
      const statsContainer = ref.current.querySelector('.grid.grid-cols-4');
      if (statsContainer) {
        Array.from(statsContainer.children).forEach(div => {
          const label = div.querySelector('h3')?.textContent;
          const value = div.querySelector('p')?.textContent;
          if (label && value) stats[label] = value;
        });
      }

      if (title === 'Analyse Mesure') {
        const minInput = ref.current.querySelector('#minLimit');
        const maxInput = ref.current.querySelector('#maxLimit');

        if (minInput && maxInput) {
          stats["minLimit"] = minInput.value || '';
          stats["maxLimit"] = maxInput.value || '';
        }
      }

      const capabilityIndices = extractCapability ? extractCapabilityIndices(ref) : {};

      return {
        imgData,
        title,
        stats,
        capabilityIndices
      };
    };

    const graphData = await Promise.all([
      captureGraphData(charts[4], 'Analyse Mesure'),
      captureGraphData(charts[0], 'Analyse Power'),
      captureGraphData(charts[1], 'Analyse EVM'),
      captureGraphData(charts[2], 'Analyse RSSI'),
      captureGraphData(charts[3], 'Analyse Rx GainError'),
    ]);

    // Génération des pages PDF
    graphData.forEach((data, index) => {

      console.log(data);

      if (index > 0) {
        pdf.addPage('landscape');
      }
      pdf.setTextColor(0, 0, 255);

      // En-tête de page
      pdf.setFontSize(16);
      pdf.text(data.title, margin, margin);
      pdf.setFontSize(12);

      if (data.title == "Analyse Rx GainError") {
        pdf.text(`${Results[0]?.type_gega}Hz - Antenne ${Results[0]?.ant} || Caisson: ${selectedCaisson}`, margin, margin + 10);
        nombre = nbrdelta;
      }

      else if (data.title == "Analyse Mesure") {
        pdf.text(` ${currentSelectedMeasureForExport} ${Results[0]?.type_gega}Hz - Antenne ${Results[0]?.ant} || Caisson: ${selectedCaisson}`, margin, margin + 10);
        nombre = nbrdelta;
      }
      else {
        pdf.text(`${filteredResults[0]?.frequence}Hz - Antenne ${filteredResults[0]?.ant} || Caisson: ${selectedCaisson}`, margin, margin + 10);
        nombre = nbr;
      }

      pdf.addImage(data.imgData, 'PNG', margin, margin + 40, imgWidth, imgHeight);

      // Tableau des caractéristiques de base
      const tableX = margin + imgWidth + 10;
      let tableY = margin + 20;

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Caractéristiques du procédé", tableX, tableY + 10);
      tableY += 5;

      autoTable(pdf, {
        startY: tableY,
        margin: { left: tableX },
        head: [['', '']],
        body: [
          ["Nombre d'échantillon", nombre],
          ['Moyenne', data.stats['Moyenne']],
          ['Écart-type', data.stats['Écart-type']],
          ['LSI', data.stats['Minimum'] || data.stats['minLimit']],
          ['LSS', data.stats['Maximum'] || data.stats['maxLimit']],

        ],
        styles: {
          fontSize: 11,
          cellPadding: 3,
          halign: 'left'
        },
        tableWidth: tableWidth,
        theme: 'plain'
      });

      // Tableau des indicateurs de capabilité
      tableY = pdf.lastAutoTable.finalY + 10;
      pdf.text("Capabilité globale", tableX, tableY + 10);
      tableY += 5;

      autoTable(pdf, {
        startY: tableY,
        margin: { left: tableX },
        head: [['', '']],
        body: [
          ['Cp', data.capabilityIndices['Cp']],
          ['Cpk', data.capabilityIndices['Cpk']],
          ['Pp', data.capabilityIndices['Pp']],
          ['Ppk', data.capabilityIndices['Ppk']]
        ],
        styles: {
          fontSize: 11,
          cellPadding: 3,
          halign: 'left',
        },
        tableWidth: tableWidth,
        theme: 'plain'
      });

      // Pied de page
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, pdf.internal.pageSize.getHeight() - 20,
        pageWidth - margin, pdf.internal.pageSize.getHeight() - 20);

      pdf.setFontSize(10);
      pdf.text(
        `Page ${index + 1} sur ${graphData.length}`,
        pageWidth - margin,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );

    });

    pdf.addPage('landscape');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Les décisions de l’IA', margin, margin);

    // Example table data for "AI decisions"
    const decisions = [
      { type: 'Analyse Power', decision: power },
      { type: 'Analyse EVM', decision: evm },
      { type: 'Analyse RSSI', decision: rssi },
      { type: 'Analyse Rx GainError', decision: rx },
    ];

    // Convert decisions into body array
    const decisionTableBody = decisions.map(row => [row.type, row.decision]);

    autoTable(pdf, {
      startY: margin + 10,
      head: [['Type de Graphe', 'Decision']],
      body: decisionTableBody,
      styles: { fontSize: 12, cellPadding: 3, halign: 'left' },
      columnStyles: {
        0: { cellWidth: 60 }
      },
      theme: 'grid'
    });


    pdf.save(`rapport_complet_${selectedCaisson}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      {/* Graphiques cachés pour l'export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <GraphWithRef
          ref={chartRefs.power}
          Component={Powergraph}
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson}
        />
        <GraphWithRef
          ref={chartRefs.evm}
          Component={Evmgraph}
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson}
        />
        <GraphWithRef
          ref={chartRefs.rssi}
          Component={Rssigraph}
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson}
        />
        <GraphWithRef
          ref={chartRefs.delta}
          Component={Deltagraph}
          Results={Results}
          selectedCaisson={selectedCaisson}
        />
        <GraphWithRef
          ref={chartRefs.mesure}
          Component={MeasureGraph}
          filteredResults={filteredResults}
          selectedCaisson={selectedCaisson}
          selectedMeasure={currentSelectedMeasureForExport}
          onMeasureChange={() => { }}
          minLimit={minLimitForExport}
          maxLimit={maxLimitForExport}
          onMinLimitChange={() => { }}
          onMaxLimitChange={() => { }}
          onCancelLimits={() => { }}
        />
      </div>

      <button
        onClick={exportToPDF}
        className="bg-cyan-400 rounded-xl pr-4 pl-4 pt-2 pb-2 font-bold cursor-pointer hover:bg-gray-900 hover:text-cyan-400 duration-200 border-2 border-cyan-400"
      >
        Générer le Rapport Complet en pdf
      </button>
    </>
  );
};

ExportAllGraphs.propTypes = {
  filteredResults: PropTypes.array.isRequired,
  selectedCaisson: PropTypes.string.isRequired,
  Results: PropTypes.array.isRequired,
  currentSelectedMeasureForExport: PropTypes.string.isRequired,
  minLimitForExport: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  maxLimitForExport: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  power: PropTypes.string,
  evm: PropTypes.string,
  rx: PropTypes.string,
  rssi: PropTypes.string

};

export default ExportAllGraphs;