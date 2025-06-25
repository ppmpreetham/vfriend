import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { decompress } from "../../utils/compressor";

await onOpenUrl((urls) => {
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
