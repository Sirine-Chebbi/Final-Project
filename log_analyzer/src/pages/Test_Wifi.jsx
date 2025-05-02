import { useState, useEffect } from "react";
import api from '../Services/api';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/Navbar";
import Uploadtest from "../components/Test/Uploadtest";
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/authService";

const Test_Wifi = () => {
    const [testResults, setTestResults] = useState([]);
    const [testLine, setTestLine] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const exportPDF = () => {
        if (testResults.length === 0) {
            alert("Aucun résultat à exporter.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Environnement des tests", 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);

        const result = testResults[0];
        const headers = [["Clé", "Valeur"]];
        const rows = [
            ["APPLICATION_VERSION", result.APPLICATION_VERSION || "-"],
            ["IQFACT_VERSION", result.IQFACT || "-"],
            ["Scos Version", result.BOOTFS1 || "-"],
            ["MCU_FIRMWARE", result.MCU_FIRMWARE || "-"],
            ["MVRAM_VERSION", result.SROM || "-"],
            ["IQMEASURE_VERSION", result.IQMEASURE_VERSION || "-"],
            ["IQTESTER_HW_VERSION", result.IQTESTER_HW_VERSION_01 || "-"],
            ["Tester_1_SN", result.Tester_1_SN || "-"],
            ["Firmware_revision", result.Firmware_revision || "-"],
            ["Ligne de test", testLine || "-"],
        ];

        autoTable(doc, {
            startY: 40,
            head: headers,
            body: rows,
        });

        doc.save("Version_Des_Tests.pdf");
    };

    const handleTestLineChange = (e) => {
        setTestLine(e.target.value);
    };

    const fetchTestResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                navigate('/');
                return;
            }

            const response = await api.get("environnement-test/test_environnement/");
            setTestResults(response.data || []);
        } catch (error) {
            console.error("Error fetching test results", error);
            if (error.response?.status === 401) {
                try {
                    const newToken = await authService.refreshToken();
                    localStorage.setItem('access_token', newToken);
                    const retryResponse = await api.get("environnement-test/test_environnement/");
                    setTestResults(retryResponse.data || []);
                } catch (refreshError) {
                    console.error("Refresh token failed", refreshError);
                    navigate('/');
                }
            } else {
                setTestResults([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchTestResults();
    };

    useEffect(() => {
        fetchTestResults();
    }, [navigate]);

    if (loading) {
        return (
            <div className="h-screen grid place-items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="-mt-40 h-screen grid place-items-center overflow-x-hidden">
                <div className="flex justify-between h-fit ml-20 mr-20 mt-30 p-5">
                    <div className='mr-20'>
                        <Uploadtest onUploadSuccess={handleUploadSuccess} /><br />
                        <input 
                            value={testLine}
                            onChange={handleTestLineChange}
                            type="text" 
                            placeholder="ligne de test" 
                            className="border-2 border-red-400 rounded-xl p-5 outline-none text-red-400 h-10 text-xl" 
                        /><br />
                        <button
                            onClick={exportPDF}
                            className="mt-10 px-4 py-2 bg-cyan-400 font-bold hover:text-cyan-400 hover:bg-black duration-150 border-2 border-cyan-400 rounded-xl cursor-pointer text-black"
                        >
                            Exporter en PDF
                        </button>
                    </div>
                    <div className="text-white border-2 border-cyan-400 text-2xl w-5/8 h-140 rounded-3xl pr-15 pl-15 pt-5 pb-5 overflow-auto hover:scale-102 duration-300 hover:shadow-2xl shadow-cyan-400">
                        <table>
                            {testResults.length > 0 ? (
                                testResults.map((result, index) => (
                                    <tbody key={index}>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">APPLICATION VERSION</td>
                                            <td className="py-5 px-20">{result.APPLICATION_VERSION || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">IQFACT_VERSION</td>
                                            <td className="py-5 px-20">{result.IQFACT || "-"}</td>
                                        </tr>
                                        <tr>
                                            <p className="pt-10 text-yellow-400 font-bold font-underline text-4xl py-2 border-b-2 w-fit">Scos-version</p>
                                        </tr>
                                        <tr>
                                            <td className="text-cyan-400 font-bold">SCOS VERSION</td>
                                            <td className="py-5 px-20">{result.BOOTFS1 || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-cyan-400 font-bold">MCU_FIRMWARE</td>
                                            <td className="py-5 px-20">{result.MCU_FIRMWARE || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-cyan-400 font-bold">Version MVRAM</td>
                                            <td className="py-5 px-20">{result.SROM || "-"}</td>
                                        </tr>
                                        <tr>
                                            <p className="text-yellow-400 font-bold font-underline text-4xl py-2 pt-10 border-b-2 w-fit">IQ tester</p>
                                        </tr>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">IQMEASURE_VERSION</td>
                                            <td className="py-5 px-20">{result.IQMEASURE_VERSION || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">IQTESTER_HW_VERSION_01</td>
                                            <td className="py-5 px-20">{result.IQTESTER_HW_VERSION_01 || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">Tester_1_SN</td>
                                            <td className="py-5 px-20">{result.Tester_1_SN || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-5 text-cyan-400 font-bold">Firmware_revision</td>
                                            <td className="py-5 px-20">{result.Firmware_revision || "-"}</td>
                                        </tr>
                                    </tbody>
                                ))
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="2" className="py-10 text-center text-gray-400">
                                            Aucun résultat de test disponible
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Test_Wifi;