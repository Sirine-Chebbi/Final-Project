const Menu = () => {

    return (
        <div className="hover:pl-25 -ml-20 duration-200 top-1/3 fixed">
            <div className="border-2 text-2xl text-cyan-400  p-5 rounded-2xl h-fit duration-200 hover:border-yellow-400">
                <ul className="flex items-center justify-center flex-col gap-5">
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#upload">
                            Filtre
                        </a>
                    </li>
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#table">
                            Mesures
                        </a>
                    </li>
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#pwr">
                            POWER
                        </a>
                    </li>
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#evm">
                            EVM
                        </a>
                    </li>
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#rssi">
                            RSSI
                        </a>
                    </li>
                    <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                        <a href="#deltagraph">
                            RX-Gainer
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Menu;
