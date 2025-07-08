import { useState, useRef } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { ReadHTMLFile } from "../../../utils/inputHelper";
import { parseHTMLTimetable } from "../../../utils/invokeFunctions";
import type { FormData } from "../OnboardingForm";

interface TimetableStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const TimetableStep = ({ formData, updateFormData }: TimetableStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExecutingRef = useRef(false);

  const handleFileUpload = async () => {
    if (isExecutingRef.current) return;

    isExecutingRef.current = true;
    setIsUploading(true);
    setError(null);

    try {
      const content = await ReadHTMLFile();

      if (content) {
        const timetable = await parseHTMLTimetable(content);

        updateFormData({
          timetableUploaded: true,
          timetableData: timetable.o || [],
          username: formData.username,
          registrationNumber: timetable.r || formData.registrationNumber,
          semester: timetable.s || formData.semester,
        });
      }
    } catch (error) {
      console.error("Error uploading timetable:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload timetable"
      );
    } finally {
      setIsUploading(false);
      isExecutingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          formData.timetableUploaded ? "bg-green-600" : "bg-orange-600"
        }`}
      >
        {formData.timetableUploaded ? (
          <CheckCircle size={32} className="text-white" />
        ) : (
          <Upload size={32} className="text-white" />
        )}
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={handleFileUpload}
          disabled={isUploading || formData.timetableUploaded}
          className={`w-full py-6 rounded-xl text-lg font-medium border-2 border-dashed transition-all ${
            formData.timetableUploaded
              ? "border-green-400 bg-green-600/20 text-green-400"
              : isUploading
              ? "border-gray-600 bg-gray-600/20 text-gray-400 cursor-not-allowed"
              : "border-orange-400 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30"
          }`}
        >
          {isUploading
            ? "Uploading..."
            : formData.timetableUploaded
            ? "✓ Timetable Uploaded"
            : "Tap to Upload HTML File"}
        </button>
      </div>

      <div className="text-center px-4">
        <p className="text-gray-300 mb-2">
          Upload your VIT timetable HTML file for Semester {formData.semester}
        </p>
        <p className="text-gray-400 text-sm">
          Go to VTOP &gt; Academics &gt; Time Table
        </p>
      </div>

      {error && (
        <div className="text-red-400 text-center px-4">
          Failed to upload timetable. Please try again.
          <div className="text-xs mt-1">
            {error || "Unknown error occurred"}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableStep;
