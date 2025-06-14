import { useState } from "react";
import { ReadHTMLFile } from "../../utils/inputHelper";
import { Upload } from "lucide-react";

const FileInput = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      const htmlContent = await ReadHTMLFile();
      if (htmlContent) {
        // should parse it here
        console.log("HTML file loaded successfully");
      }
    } catch (error) {
      console.error("Error loading HTML file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-8 p-6">
      <div className="text-4xl">Upload the HTML file to get started</div>
      <button
        className={`flex flex-row items-center justify-center p-4 bg-primary text-black rounded-xl text-4xl gap-2 cursor-pointer select-none ${
          isLoading ? "opacity-50" : ""
        }`}
        onClick={handleFileUpload}
        disabled={isLoading}
      >
        <Upload size={28} />
        <div>{isLoading ? "Loading..." : "Upload"}</div>
      </button>
    </div>
  );
};

export default FileInput;
