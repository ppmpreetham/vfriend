import ScheduleGrid from "./ScheduleGrid";
import { CardBody, CardContainer, CardItem } from "./3DCard";

const Profile = () => {
  return (
    <div className="flex-col md:flex-row flex items-center justify-center w-full h-screen md:gap-70">
      <CardContainer className="inter-var h-fit" containerClassName="h-screen">
        <CardBody className="h-fit [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d] hover:border-2 hover:border-primary rounded-2xl py-2">
          <div className="flex h-fit w-full gap-2 uppercase">
            <CardItem
              translateZ={25}
              className="ml-4 w-1/2 flex flex-col gap-2"
            >
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
            </CardItem>
            <div className="mr-4 w-1/2 flex flex-col gap-2">
              <CardItem
                translateZ={20}
                className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center"
              >
                <div>Lingan guli guli guli</div>
              </CardItem>
              <CardItem
                translateZ={30}
                className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center"
              >
                <div className="text-xl">NEXT FREE</div>
                <div className="text-3xl">1:25 PM</div>
              </CardItem>
            </div>
          </div>
          <CardItem translateZ={60} className="mx-4 mt-2">
            <div className="text-4xl">TIME TABLE</div>
            <div className="px-2 rounded-xl text-center">
              <ScheduleGrid />
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
      <div>
        <h4 className="text-9xl">INTUITIVE UI</h4>
      </div>
    </div>
  );
};

export default Profile;
