import { useState, useRef } from "react";
import { ReadHTMLFile } from "../../utils/inputHelper";
import { parseHTMLTimetable } from "../../utils/timetableHelper";
import {
  useSaveTimetable,
  useStoreContents,
} from "../../hooks/useTimeTableQueries";
import { useTimetableStore } from "../../store/useTimeTableStore";
import { Upload } from "lucide-react";

const FileInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isExecutingRef = useRef(false);

  // React Query mutations
  const saveTimetableMutation = useSaveTimetable();
  const { refetch: viewStoreContents } = useStoreContents();

  // Zustand store for current user
  const currentUser = useTimetableStore((state) => state.currentUser);

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

        // Override the username with current user if available
        if (currentUser) {
          timetable.u = currentUser;
        }

        // Update timestamp to current time
        timetable.t = new Date().toISOString();

        // Save using React Query mutation
        await saveTimetableMutation.mutateAsync(timetable);

        console.log("Timetable uploaded and saved successfully!");
      }
    } catch (error) {
      console.error("Error uploading timetable:", error);

      // You might want to show a toast notification here
      // toast.error("Failed to upload timetable. Please try again.");
    } finally {
      setIsLoading(false);
      isExecutingRef.current = false;
    }
  };

  // Check if mutation is also loading
  const isMutationLoading = saveTimetableMutation.isPending;
  const totalLoading = isLoading || isMutationLoading;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-8 p-6">
      <div className="text-4xl">Upload the HTML file to get started</div>

      {/* Show current user info if available */}
      {currentUser && (
        <div className="text-lg text-gray-600">
          Uploading for user:{" "}
          <span className="font-semibold">{currentUser}</span>
        </div>
      )}

      <button
        className={`flex flex-row items-center justify-center p-4 bg-primary text-black rounded-xl text-4xl gap-2 cursor-pointer select-none transition-opacity ${
          totalLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        }`}
        onClick={handleFileUpload}
        disabled={totalLoading}
      >
        <Upload size={28} />
        <div>
          {totalLoading
            ? isMutationLoading
              ? "Saving..."
              : "Loading..."
            : "Upload"}
        </div>
      </button>

      {/* Show error message if mutation failed */}
      {saveTimetableMutation.isError && (
        <div className="text-red-500 text-lg">
          Failed to save timetable: {saveTimetableMutation.error?.message}
        </div>
      )}

      {/* Show success message if mutation succeeded */}
      {saveTimetableMutation.isSuccess && (
        <div className="text-green-500 text-lg">
          Timetable uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default FileInput;
