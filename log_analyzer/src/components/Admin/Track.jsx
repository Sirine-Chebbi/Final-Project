import PropTypes from 'prop-types';
import { useState } from 'react';
import React from 'react';

const Track = ({ track, loading }) => {

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const sortedTrack = React.useMemo(() => {
        let sortableItems = [...track];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle numeric sorting if applicable
                if (!isNaN(aValue) && !isNaN(bValue)) {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                } else if (sortConfig.key === 'date_rapport') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [track, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <>
            <div className="w-350 grid justify-self-center overflow-x-auto rounded-xl border-2 border-cyan-400 p-6 hover:shadow-2xl hover:shadow-cyan-400 bg-gray-900 max-h-fit duration-200">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-cyan-400">
                        <thead className="bg-gray-900 text-center">
                            <tr>
                                <th onClick={() => requestSort('utilisateur')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Matricule {sortConfig.key === 'utilisateur' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('date_rapport')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Date {sortConfig.key === 'date_rapport' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('nombre_logs_Conduit')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Wifi Conduit {sortConfig.key === 'nombre_logs_Conduit' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('nombre_logs_Divers')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Divers testeurs Date {sortConfig.key === 'nombre_logs_Divers' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('nombre_logs_Temps')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Analyse temps {sortConfig.key === 'nombre_logs_Temps' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('nombre_logs_Env')} className="cursor-pointer py-4 px-6 text-xl font-bold text-cyan-400 hover:bg-cyan-300/20 duration-200 rounded-t-xl">Environnement de test {sortConfig.key === 'nombre_logs_Env' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-400 bg-gray-900">
                            {sortedTrack.map((item, index) => (
                                <tr key={index} className="text-center">
                                    <td className="py-4 px-6 text-cyan-400">{item.utilisateur}</td>
                                    <td className="py-4 px-6 text-cyan-400">{item.date_rapport}</td>
                                    <td className="py-4 px-6 text-cyan-400">{item.nombre_logs_Conduit}</td>
                                    <td className="py-4 px-6 text-cyan-400">{item.nombre_logs_Divers}</td>
                                    <td className="py-4 px-6 text-cyan-400">{item.nombre_logs_Temps}</td>
                                    <td className="py-4 px-6 text-cyan-400">{item.nombre_logs_Env}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    )
}

Track.propTypes = {
    loading: PropTypes.bool.isRequired,
    track: PropTypes.arrayOf(
        PropTypes.shape({
            matricule: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            wifiConduit: PropTypes.string.isRequired,
            diversTesteurs: PropTypes.string.isRequired,
            analyseTemps: PropTypes.string.isRequired,
            environnementDeTest: PropTypes.string.isRequired
        })
    ).isRequired
};


export default Track