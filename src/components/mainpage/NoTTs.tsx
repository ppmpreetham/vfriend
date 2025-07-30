const NoTTs = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4 bg-black text-white">
      <div className="text-center">
        <div className="p-2 text-5xl lg:text-8xl wrap-break-word leading-15 md:leading-0">
          No More{" "}
          <span className="my-4 md:my-0 px-2 bg-primary text-black rounded-xl">
            Sharing
          </span>{" "}
          Timetables
        </div>
      </div>
    </div>
  );
};

export default NoTTs;
