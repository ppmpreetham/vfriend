import ScheduleGrid from "./ScheduleGrid";
import scheduleData from "./timetable_minimal.json";

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
            <div className="text-3xl">HOBBIES</div>
            <ul className="list-disc pl-5">
              <li>Reading</li>
              <li>Gaming</li>
              <li>Coding</li>
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div>THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG ~Ayush</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-3xl">12:30 PM</div>
          </div>
        </div>
      </div>
      <div className="mx-4 my-2 text-4xl">TIME TABLE</div>
      <ScheduleGrid data={scheduleData} />
    </div>
  );
};

export default Profile;
