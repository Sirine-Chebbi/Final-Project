import PropTypes from "prop-types";

const Tooltipinf = ({ children, text, titre, position = "top" }) => {
  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 mt-30 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2"
  };

  return (
    <div className="relative w-fit justify-self-end -mt-2">
      <div className="group inline-block">
        {children}
        <div className={`absolute ${positionClasses[position]} 
                        p-4 w-60 max-w-80 h-fit text-md text-cyan-400 bg-gray-900 rounded 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10
                        pointer-events-none`}>
          <span className="text-yellow-400">{titre}</span> <br /><br />
          {text}
        </div>
      </div>
    </div>
  );
};

Tooltipinf.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  titre: PropTypes.string.isRequired,
  position: PropTypes.oneOf(["top", "bottom", "left", "right"])
};

export default Tooltipinf;
