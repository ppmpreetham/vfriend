import { useState, useRef } from "react";
import { ReadHTMLFile } from "../../utils/inputHelper";
import { Upload } from "lucide-react";
import { parseHTMLTimetable } from "../../utils/timetableHelper";
import { saveTimetable, viewStoreContents } from "../../store/timeTableStore";

const FileInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isExecutingRef = useRef(false);

  const handleFileUpload = async () => {
    if (isExecutingRef.current) {
      return;
    }

    isExecutingRef.current = true;
    setIsLoading(true);

    try {
      const htmlContent = await ReadHTMLFile();
      if (htmlContent) {
        const timetable = await parseHTMLTimetable(htmlContent);
        await saveTimetable(timetable);
        console.log("---------");
        await viewStoreContents();
        console.log("Parsing completed:", timetable);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      isExecutingRef.current = false;
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
