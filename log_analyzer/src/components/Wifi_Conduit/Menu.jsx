const Menu = () => {

    return (
        <div className="dark:bg-gray-950 border-2 text-2xl text-cyan-400 top-1/3 fixed bg-amber-50 p-5 rounded-2xl h-fit ml-5 duration-200 hover:border-yellow-400">
            <ul className="flex items-center justify-center flex-col gap-5">
                <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                    <a href="#upload">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1"
                            stroke="currentColor"
                            className="size-10"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                        </svg>
                    </a>
                </li>
                <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                    <a href="#table">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-10"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                    </a>
                </li>
                <li className="hover:scale-110 duration-150 hover:text-yellow-400">
                    <a href="#pwr">
                        PWR
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
                        DELTA
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Menu;
