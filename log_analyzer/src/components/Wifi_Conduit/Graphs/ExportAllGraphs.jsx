import { useRef, forwardRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Powergraph from './Powergraph';
import Evmgraph from './Evmgraph';
import Rssigraph from './Rssigraph';
import Deltagraph from './Deltagraph';

const GraphWithRef = forwardRef(({ Component, ...props }, ref) => (
  <div ref={ref}>
    <Component {...props} />
  </div>
));

const ExportAllGraphs = ({ filteredResults, selectedCaisson }) => {
  const chartRefs = {
    power: useRef(),
    evm: useRef(),
    rssi: useRef(),
    delta: useRef()
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF('landscape');
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth * 0.6; // 60% de la largeur pour le graphique
    const imgHeight = 120; // Hauteur augmentée pour mieux voir les détails
    const tableWidth = pageWidth * 0.35; // 35% pour le tableau

    // Style global
    pdf.setFont('helvetica');
    pdf.setTextColor(40, 40, 40);

    // Fonction pour capturer un graphique avec ses stats
    const captureGraphData = async (ref, title) => {
      if (!ref.current) return null;
      
      const canvas = ref.current.querySelector('canvas');
      if (!canvas) return null;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Extraction des statistiques
      const statsContainer = ref.current.querySelector('.grid.grid-cols-4');
      const stats = {};
      if (statsContainer) {
        Array.from(statsContainer.children).forEach(div => {
          const label = div.querySelector('h3').textContent;
          const value = div.querySelector('p').textContent;
          stats[label] = value;
        });
      }

      return { imgData, title, stats };
    };

    // Capturer les données des 4 graphiques
    const graphData = await Promise.all([
      captureGraphData(chartRefs.power, 'Analyse Power'),
      captureGraphData(chartRefs.evm, 'Analyse EVM'),
      captureGraphData(chartRefs.rssi, 'Analyse RSSI'),
      captureGraphData(chartRefs.delta, 'Analyse Delta')
    ]);

    // Génération des pages PDF
    graphData.forEach((data, index) => {
      if (!data) return;

      // Nouvelle page pour chaque graphique (sauf la première)
      if (index > 0) {
        pdf.addPage('landscape');
      }

      // En-tête de page
      pdf.setFontSize(16);
      pdf.text(data.title, margin, margin);
      pdf.setFontSize(12);
      pdf.text(`${filteredResults[0]?.frequence}-A${filteredResults[0]?.ant} | Caisson: ${selectedCaisson}`, margin, margin + 10);

      // Positionnement du graphique (à gauche)
      pdf.addImage(data.imgData, 'PNG', margin, margin + 10, imgWidth, imgHeight);

      // Positionnement du tableau (à droite du graphique)
      const tableX = margin + imgWidth + 10;
      const tableY = margin + 20;

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 255);

      pdf.text("Caractéristiques du procédé", 215, 40);

      autoTable(pdf, {
        startY: tableY,
        margin: { left: tableX },
        head: [['', '']],
        body: [
          ['Moyenne', data.stats['Moyenne'] || 'N/A'],
          ['Écart-type', data.stats['Écart-type'] || 'N/A'],
          ['LSI', data.stats['Minimum'] || 'N/A'],
          ['LSS', data.stats['Maximum'] || 'N/A']
        ],
        styles: {
          fontSize: 12,
          halign: "left",
        cellPadding: 3,
        },
        tableWidth: tableWidth,
        theme: 'plain'
      });

      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, pdf.internal.pageSize.getHeight() - 20, 
               pageWidth - margin, pdf.internal.pageSize.getHeight() - 20);

      // Pied de page
      pdf.setFontSize(10);
      pdf.text(
        `Page ${index + 1} sur ${graphData.length}`,
        pageWidth - margin,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
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
          Results={filteredResults}
          selectedCaisson={selectedCaisson}
        />
      </div>

      <button
        onClick={exportToPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-200"
      >
        Générer le Rapport Complet
      </button>
    </>
  );
};

export default ExportAllGraphs;