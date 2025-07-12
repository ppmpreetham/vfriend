import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { decompress } from "../../utils/compressor";
import { platform } from "@tauri-apps/plugin-os";

const currentPlatform = platform();
await onOpenUrl((urls) => {
  if (currentPlatform === "windows") {
    console.log("Windows platform detected");
  }
  console.log("deep link:", urls);
  console.log(decompress(urls[0]));
});

const deepLinkAccept = () => {
  const name = "";

  return (
    <div className="bg-primary flex flex-col">
      <div>Want to add Friend {name}?</div>
      <button className="p-4 bg-black">YES</button>
      <div></div>
    </div>
  );
};

export default deepLinkAccept;
