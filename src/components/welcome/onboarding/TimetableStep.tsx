import { useState, useRef } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { ReadHTMLFile } from "../../../utils/inputHelper";
import { parseHTMLTimetable } from "../../../utils/timetableHelper";
import { useSaveTimetable } from "../../../hooks/useTimeTableQueries";
import { useCurrentUser } from "../../../hooks/useTimeTableQueries";
import { setCurrentUser } from "../../../store/timeTableStore";
import type { FormData } from "../OnboardingForm";

interface TimetableStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const TimetableStep = ({ formData, updateFormData }: TimetableStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExecutingRef = useRef(false);
  const saveTimetableMutation = useSaveTimetable();
  const { data: currentUser } = useCurrentUser();

  const handleFileUpload = async () => {
    if (isExecutingRef.current) return;

    if (!formData.username) {
      setError("No username provided. Cannot save timetable.");
      return;
    }

    isExecutingRef.current = true;
    setIsUploading(true);
    setError(null);

    try {
      // Set current user before uploading timetable
      if (!currentUser) {
        console.log("Setting current user to:", formData.username);
        await setCurrentUser(formData.username);
      }

      const htmlContent = await ReadHTMLFile();
      if (htmlContent) {
        const timetable = await parseHTMLTimetable(htmlContent);

        timetable.t = new Date().toISOString();
        timetable.s = formData.semester ?? 0;

        console.log("Current user:", formData.username);
        console.log("Timetable:", timetable);

        await saveTimetableMutation.mutateAsync(timetable);
        updateFormData({ timetableUploaded: true });
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

  const isLoading = isUploading || saveTimetableMutation.isPending;

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
          disabled={
            isLoading || formData.timetableUploaded || !formData.username
          }
          className={`w-full py-6 rounded-xl text-lg font-medium border-2 border-dashed transition-all ${
            formData.timetableUploaded
              ? "border-green-400 bg-green-600/20 text-green-400"
              : isLoading
              ? "border-gray-600 bg-gray-600/20 text-gray-400 cursor-not-allowed"
              : !formData.username
              ? "border-red-400 bg-red-600/20 text-red-400 cursor-not-allowed"
              : "border-orange-400 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30"
          }`}
        >
          {isLoading
            ? "Uploading..."
            : formData.timetableUploaded
            ? "✓ Timetable Uploaded"
            : !formData.username
            ? "No User Selected"
            : "Tap to Upload HTML File"}
        </button>
      </div>

      <div className="text-center px-4">
        <p className="text-gray-300 mb-2">
          Upload your VIT timetable HTML file for Semester {formData.semester}
        </p>
        <p className="text-gray-400 text-sm">
          This helps you find free time with friends
        </p>
      </div>

      {(error || saveTimetableMutation.isError) && (
        <div className="text-red-400 text-center px-4">
          Failed to upload timetable. Please try again.
          <div className="text-xs mt-1">
            {error ||
              saveTimetableMutation.error?.message ||
              "Unknown error occurred"}
          </div>
        </div>
      )}

      {!formData.username && (
        <div className="text-yellow-400 text-center px-4 text-sm">
          Please complete the previous steps first
        </div>
      )}
    </div>
  );
};

export default TimetableStep;
