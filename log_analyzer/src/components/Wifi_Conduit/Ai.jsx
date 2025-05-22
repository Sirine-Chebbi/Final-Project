import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './scrollyellow.css';

function Ai(props) {

    const token = localStorage.getItem("access_token");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);

    const sendToAIBackend = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8000/api/ai-stat/analyze/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(props.statData),
            });

            const result = await response.json();

            if (result.error) {
                console.error("Error from AI backend:", result.error);
                setResult("An error occurred while processing your request.");
                setLoading(false);
            } else {
                setResult(result.ai_decision);
                setLoading(false);
            }
            return result;
        } catch (error) {
            console.error("Error sending to backend:", error);
        }
    }

    useEffect(() => {
        if (props.trigger) {
            sendToAIBackend();
        }
    }, [props.trigger]);

    return props.trigger ? (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
            <div className="place-self-center duration-200 border-3 border-yellow-400 rounded-2xl overflow-y-auto text-yellow-400">
                <div className="backdrop-blur-2xl w-200 h-fit rounded-2xl p-10">
                    <div className='flex justify-self-end'>
                        <button onClick={() => props.setShowAi(!props.showAi)} className='text-yellow-400 cursor-pointer hover:scale-130 duration-200'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div>
                        <h1 className='text-2xl text-left font-bold -mt-5'>Analyse Du Courbe : </h1>
                        {loading ?
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                            </div>
                            :
                            <div className="bg-gray-200/20 p-9 mt-5 max-h-120 rounded-4xl overflow-y-auto scroll-box">
                                <div className='text-left font-mono text-lg'><pre className='text-white whitespace-pre-wrap break-words'>{result}</pre></div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    ) : "";
}

Ai.propTypes = {
    trigger: PropTypes.bool.isRequired,
    setShowAi: PropTypes.func.isRequired,
    showAi: PropTypes.bool.isRequired,
    statData: PropTypes.object.isRequired,
};


export default Ai;
