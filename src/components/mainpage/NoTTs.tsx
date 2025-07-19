import { useRef } from "preact/hooks";
const NoTTs = () => {
  const textRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
      <div className="text-center" ref={textRef} style={{ opacity: 100 }}>
        <div className="text-3xl md:text-5xl lg:text-7xl z-0 pb-2">
          DON'T F<span className="text-primary">*</span>CKING CALL YOUR FRIENDS
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
