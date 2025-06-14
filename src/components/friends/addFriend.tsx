import { Share, QrCode, SmartphoneNfc, Wifi } from "lucide-react";
import { ShareLink } from "./ShareLink";

const AddFriend = () => {
  return (
    <div className="bg-primary rounded-xl h-fit w-full p-8">
      <div className="text-4xl text-black">ADD FRIEND</div>
      <div className="grid grid-cols-2 gap-4 mt-4 text-white">
        <div
          className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            ShareLink();
          }}
        >
          <Share size={24} />
          SHARE LINK
        </div>
        <div className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer">
          <QrCode size={24} />
          QR CODE
        </div>
        <div className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer">
          <SmartphoneNfc size={24} />
          NFC (soon)
        </div>
        <div className="bg-black p-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer">
          <Wifi size={24} />
          Wi-Fi (soon)
        </div>
      </div>
    </div>
  );
};

export default AddFriend;
