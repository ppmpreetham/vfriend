import React from "react";

const Profile = () => {
  return (
    <div className="w-screen h-full flex flex-col overflow-y-auto scrollbar-hide">
      <div className="flex h-fit w-full gap-2 uppercase">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-3xl">AAYUSH SHUKLA</div>
            <div>23BEE6969</div>
            <div>SEM 5</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div className="text-3xl">Free Places</div>
            <ul className="list-disc pl-5">
              <li>Library</li>
              <li>Hostel</li>
              <li>Canteen</li>
              <li>Classroom</li>
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div>Lingan guli guli guli</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-3xl">No timetable</div>
          </div>
        </div>
      </div>
      <div className="mx-4 my-2 text-4xl">TIME TABLE</div>
      <div className="mx-4 p-8 bg-white text-black rounded-xl text-center">
        <div className="text-xl">No timetable uploaded</div>
        <div className="text-sm text-gray-600 mt-2">
          Upload your timetable to see your schedule
        </div>
      </div>
    </div>
  );
};

export default Profile;
