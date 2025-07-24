const ScrollDown = () => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center justify-center">
        <div className="relative w-[30px] h-[50px] border-[3px] border-primary rounded-full mb-4 cursor-pointer">
          <div className="absolute bottom-[30px] left-1/2 transform -translate-x-1/2 w-[6px] h-[6px] bg-primary rounded-full animate-scrolldown"></div>
          <div className="flex flex-col items-center mt-[48px]">
            <div className="w-[10px] h-[10px] border-[3px] border-primary border-t-0 border-l-0 rotate-45 animate-pulse"></div>
            <div className="w-[10px] h-[10px] border-[3px] border-primary border-t-0 border-l-0 rotate-45 animate-pulse delay-250"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollDown;
