

function NftFilter() {
    return (
        <>
            <div className="flex justify-between mt-30">
                <div className="border-cyan-500 border-3 h-15 rounded-2xl font-bold w-70">
                    <select name="" id="" className="w-60 text-xl text-cyan-400 flex p-3 place-self-center outline-none">
                        <option value="">Choisir une mesure</option>
                    </select>
                </div>
                <div className='flex gap-5 place-items-center'>
                    <input type="text" id="input1" placeholder="Limite Min" className="border-3 border-green-400 w-50 rounded-2xl text-xl p-3 h-14 font-medium text-green-400 outline-none"/>

                    <input type="text" id="input2" placeholder="Limite Max" className="border-3 border-orange-500 w-50 rounded-2xl text-xl p-3 h-14 font-medium text-orange-500 outline-none"/>

                    <button className="text-black border-3 hover:border-cyan-400 hover:text-cyan-400  bg-cyan-400 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                        Filtrer
                    </button>
                    <button className="text-black border-3 hover:border-red-500 hover:text-red-500  bg-red-500 hover:bg-gray-950 focus:outline-none h-15 font-medium rounded-2xl w-30 text-xl px-4 py-2 cursor-pointer">
                        Annuler
                    </button>
                </div>
            </div>
        </>
    )
}

export default NftFilter