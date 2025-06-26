import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

export const ReadHTMLFile = async (): Promise<string | null> => {
  try {
    const filePath = await open({
      filters: [
        {
          name: "HTML Files",
          extensions: ["html", "htm"],
        },
      ],
      multiple: false,
      title: "Select an HTML file",
    });

    return filePath ? readTextFile(filePath) : null;
  } catch (error) {
    console.error("Error opening file dialog:", error);
    return null;
  }
};
