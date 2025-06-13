import { scan, Format } from "@tauri-apps/plugin-barcode-scanner";

const FriendQR = () => {
  scan({ windowed: true, formats: [Format.QRCode] });
  return <div>AddFriend</div>;
};

export default FriendQR;
