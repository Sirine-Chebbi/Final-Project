
import PropTypes from 'prop-types';

function Ajouteru(props) {
    return (props.trigger) ? (
        <div className='fixed inset-0 flex items-center justify-center z-50 group/back bg-black/50'>
            <div className="place-self-center duration-200 border-3 border-cyan-400 rounded-2xl">
                <div className="backdrop-blur-2xl w-250 h-120 rounded-2xl p-5">
                    <button onClick={() => props.setVisibilityuser(false)} className="p-2 place-self  B-end grid group cursor-pointer hover:scale-120 duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="oklch(78.9% 0.154 211.53)" className="size-12 group-hover:stroke-red-500 duration-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
        : "";
}
Ajouteru.propTypes = {
    trigger: PropTypes.bool.isRequired,
    setVisibilityuser: PropTypes.func.isRequired,
};

export default Ajouteru