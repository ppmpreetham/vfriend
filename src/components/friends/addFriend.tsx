import { Share, QrCode, SmartphoneNfc, Wifi } from "lucide-react";
import { ShareLink } from "./ShareLink";

const AddFriend = () => {
  return (
    <div className="bg-primary rounded-xl h-fit w-full p-8">
      <div className="text-4xl text-black">ADD FRIEND</div>
      <div className="grid grid-cols-2 gap-4 mt-4 text-white">
        <div
          className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer justify-center"
          onClick={() => {
            ShareLink();
          }}
        >
          <Share size={24} />
          <div>SHARE LINK</div>
        </div>
        <button className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer justify-center">
          <QrCode size={24} />
          <div>QR CODE</div>
        </button>
        <div className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer justify-center">
          <SmartphoneNfc size={24} />
          <div>NFC (soon)</div>
        </div>
        <div className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer justify-center">
          <Wifi size={24} />
          <div>Wi-Fi p2p (soon)</div>
        </div>
      </div>
    </div>
  );
};

export default AddFriend;
