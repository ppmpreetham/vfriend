const NoTTs = ({ timeline }: { timeline: gsap.core.Timeline }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4 bg-black text-white">
      <div className="text-center">
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
