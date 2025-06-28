import { useShareUserProfile } from "../../../hooks/useShareUserProfile";
import { compress, decompress } from "../../../utils/compressor";
import { Copy } from "lucide-react";
import { addFriend } from "../../../store/newtimeTableStore";
import { useState } from "react";
// import user1 from "../../../../tests/user3.json"

const CodeTab = () => {
  const {
    data: userData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useShareUserProfile();
  
  console.log(timetableError? "Error loading timetable" : "Timetable loaded successfully");
  console.log(timetableLoading? "Loading timetable..." : "Timetable loading status: " + timetableLoading);

  const [accessCode, setAccessCode] = useState("");
  const [addStatus, setAddStatus] = useState({ message: "", isError: false });

  const getTimetableJsonString = () => {
    if (!userData) return "";

    try {
      return compress(JSON.stringify(userData));
    } catch (error) {
      console.error("Error converting timetable to JSON:", error);
      return "";
    }
  };

  const handleAddFriend = async () => {
    if (!accessCode.trim()) {
      setAddStatus({ message: "Please enter an access code", isError: true });
      return;
    }

    try {
      // Decompress the access code to get JSON data
      const decompressedData = decompress(accessCode);
      
      // Validate the decompressed data structure
      if (!decompressedData || 
          typeof decompressedData !== 'object' ||
          !decompressedData.u || // username
          !decompressedData.r || // registration number
          typeof decompressedData.s !== 'number' || // semester
          !Array.isArray(decompressedData.h) || // hobbies
          !Array.isArray(decompressedData.q) || // quote
          !decompressedData.t || // timestamp
          !Array.isArray(decompressedData.o)) { // schedule (CompactSlot[])
        
        setAddStatus({ message: "Invalid access code format", isError: true });
        return;
      }
      
      // Add friend using the validated decompressed data
      const result = await addFriend(decompressedData);
      
        if (result.success) {
        setAddStatus({ message: "Friend added successfully!", isError: false });
        setAccessCode(""); // Clear input after successful add
      } else {
        setAddStatus({ 
          message: result.error && typeof result.error === 'object' && 'message' in result.error
            ? `Failed: ${String(result.error.message)}`
            : "Failed to add friend", 
          isError: true 
        });
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setAddStatus({ message: "Invalid access code", isError: true });
    }
  };

  // const addTestFriend = async () => {
  //   try {
  //     const result = await addFriend(user1);
  //     if (result.success) {
  //       setAddStatus({ message: "Test friend added successfully!", isError: false });
  //     } else {
  //       setAddStatus({ message: "Failed to add test friend", isError: true });
  //     }
  //   }
  //   catch (error) {
  //     console.error("Error adding test friend:", error);
  //     setAddStatus({ message: "Failed to add test friend", isError: true });
  //   }
  // }

  return (
    <div className="p-4 text-black flex flex-col gap-4">
      <h3 className="text-xl font-bold mb-4">ACCESS CODE</h3>
      <div className="flex flex-col gap-2">
        <p>
          Paste your friend's <strong>access code</strong>
        </p>
        <input
          type="text"
          name="access_code"
          id="access_code"
          className="bg-black text-white p-2 rounded w-full"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
        ></input>
        <button 
          className="bg-black text-white rounded p-2 cursor-pointer"
          onClick={handleAddFriend}
        >
          ADD Friend
        </button>
        {addStatus.message && (
          <p className={`text-sm mt-1 ${addStatus.isError ? 'text-red-500' : 'text-green-500'}`}>
            {addStatus.message}
          </p>
        )}
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
      {/* <div className="bg-black text-white p-4 rounded text-center cursor-pointer"
        onClick={addTestFriend}>
        ADD TEST FRIEND
      </div> */}
    </div>
  );
};

export default CodeTab;