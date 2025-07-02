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
    if (filePath) {
      const fileContent = await readTextFile(filePath);
      console.log("File content:", fileContent);
      return fileContent;
    } else{
      console.log("No file selected");
      return null;
    }
  } catch (error) {
    console.error("Error opening file dialog:", error);
    return null;
  }
};
