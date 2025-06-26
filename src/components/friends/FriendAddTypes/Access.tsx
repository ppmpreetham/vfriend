import { useShareUserProfile } from "../../../hooks/useShareUserProfile";
import { compress } from "../../../utils/compressor";
import { Copy } from "lucide-react";

const CodeTab = () => {
  const {
    data: userData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useShareUserProfile();

  const getTimetableJsonString = () => {
    if (!userData) return "";

    try {
      return compress(JSON.stringify(userData));
    } catch (error) {
      console.error("Error converting timetable to JSON:", error);
      return "";
    }
  };
  return (
    <div className="p-4 text-black flex flex-col gap-4">
      <h3 className="text-xl font-bold  mb-4">ACCESS CODE</h3>
      <div className="flex flex-col gap-2">
        <p>
          Paste your friend's <strong>access code</strong>
        </p>
        <input
          type="text"
          name="access_code"
          id="access_code"
          className="bg-black text-white p-2 rounded w-full"
        ></input>
        <button className="bg-black text-white rounded">ADD Friend</button>
      </div>

      <div>
        <button
          className="mt-2 p-4 text-sm bg-black rounded text-white flex flex-row gap-4 justify-center items-center w-full cursor-pointer"
          onClick={() =>
            navigator.clipboard.writeText(getTimetableJsonString())
          }
        >
          <div>Copy Your Access Code </div>
          <Copy size={24} />
        </button>
      </div>
    </div>
  );
};

export default CodeTab;
