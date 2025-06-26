import QRCodeGenerator from "./QRCodeGenerator";
import { useUserTimetable } from "../../hooks/useUserTimetable";
import { useUserProfile } from "../../hooks/useUserProfile";
import { compress } from "../../utils/compressor";

const QRGiver = () => {
  const {
    data: timetableData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useUserTimetable();

  const userData = useUserProfile();

  const getTimetableJsonString = () => {
    if (!timetableData) return "";

    try {
      return compress(JSON.stringify(timetableData));
    } catch (error) {
      console.error("Error converting timetable to JSON:", error);
      return "";
    }
  };

  if (timetableLoading) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (timetableError) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading timetable</p>
          <p className="text-sm mt-2">{timetableError.message}</p>
        </div>
      </div>
    );
  }

  if (!timetableData) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No timetable data found</p>
          <p className="text-sm mt-2">Please upload your timetable first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-full">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">SCAN THIS QR</h1>

        <div className=" mx-auto">
          <QRCodeGenerator
            url={getTimetableJsonString()}
            size={300}
            errorCorrectionLevel="M"
          />

          <div className="mt-6 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">My Timetable Info:</h3>
            <p>
              <strong>User:</strong> {userData?.data?.u || "Unknown User"}
            </p>
            <p>
              <strong>Semester:</strong>{" "}
              {userData.data?.s || "Unknown Semester"}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {userData.data?.t
                ? new Date(userData.data.t).toLocaleString()
                : "Unknown"}
            </p>
            <p>
              <strong>Total Slots:</strong> {timetableData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGiver;
