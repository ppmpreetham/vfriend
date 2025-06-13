import React from "react";

const Profile = () => {
  return (
    <div className="w-screen h-full flex flex-col">
      <div className="flex h-2/5 w-full gap-2">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-3xl">PREETHAM</div>
            <div>23BRS1346</div>
            <div>SEM 4</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div className="text-3xl">WHAT</div>
            <div>TO</div>
            <div>PUT HERE</div>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div className="text-3xl">WHAT</div>
            <div>TO</div>
            <div>PUT HERE</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-3xl">12:30 PM</div>
          </div>
        </div>
      </div>
      <div className="mx-4 my-2 text-4xl">TIME TABLE</div>
      <div className="grid grid-cols-12 gap-2 mx-4 bg-primary text-black rounded-xl p-2">
        {Array.from({ length: 7 }).map((_, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {Array.from({ length: 12 }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="bg-black/10 rounded-sm flex items-center justify-center text-xs"
              >
                {rowIndex + 1}-{colIndex + 1}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Profile;
