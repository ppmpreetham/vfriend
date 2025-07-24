const NoTTs = ({ timeline }: { timeline: gsap.core.Timeline }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4 bg-black text-white">
      <div className="text-center">
        <div className="text-3xl md:text-5xl lg:text-7xl z-0 pb-2">
          DON'T F
          <span
            className="
              text-primary 
              cursor-pointer 
              inline-block 
              transition-transform 
              duration-500 
              ease-out 
              hover:rotate-[360deg] 
              hover:scale-200
            "
          >
            *
          </span>
          CKING CALL YOUR FRIENDS
        </div>
        <div className="lg:text-5xl">
          No More{" "}
          <span className="px-2 bg-primary text-black rounded-xl">Sharing</span>{" "}
          Timetables
        </div>
      </div>
    </div>
  );
};

export default NoTTs;
