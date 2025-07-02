import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
// import { platform } from "@tauri-apps/plugin-os";

export const ReadHTMLFile = async (): Promise<string | null> => {
  try {
    const filePath = await open({
      // I HATE ANDROID
      // // workaround for Android's file picker limitations
      // filters: [
      //   {
      //     name: "HTML Files",
      //     extensions: ["html", "htm"],
      //   },
      // ],
      multiple: false,
      directory: false,
      // title: "Select an HTML file",
    });

    console.log("Selected file path:", filePath);
    if (filePath){console.log(await readTextFile(filePath));

    }
    return filePath ? await readTextFile(filePath) : null;
  } catch (error) {
    console.error("Error opening file dialog:", error);
    return null;
  }
};
