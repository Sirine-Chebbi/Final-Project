import Navbar from '../components/Navbar';
import NftFilter from '../components/NFT/NftFilter';
import TableNFT from '../components/NFT/TableNFT';
import UploadNFT from '../components/NFT/UploadNft';

const NFT = () => {
  return (
    <>
        <Navbar></Navbar>
        <div className="ml-40 mr-40 mt-10">
            <UploadNFT></UploadNFT>
            <NftFilter></NftFilter>
            <TableNFT></TableNFT>
        </div>
    </>
  )
}

export default NFT