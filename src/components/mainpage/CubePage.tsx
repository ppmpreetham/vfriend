import Cubes from "../Cubes";
import MagneticButton from "../MagneticButton";

const CubePage = ({ isDesktop }: { isDesktop: boolean }) => {
  return (
    <div
      className={
        "w-screen h-screen flex flex-col items-center justify-center relative my-6"
      }
    >
      <a
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        href="https://github.com/ppmpreetham/vfriend/releases/download/v0.5.3/app-universal-release.apk"
      >
        <MagneticButton className="z-10 bg-black text-primary hover:text-black hover:bg-primary  mix-blend-difference p-6 rounded-xl text-5xl md:text-lg lg:text-7xl font-medium">
          Download VFriend
        </MagneticButton>
      </a>
      <Cubes
        faceColor="#ebff57"
        gridSizeX={isDesktop ? 15 : 8}
        gridSizeY={isDesktop ? 8 : 17}
        cellGap={isDesktop ? 5 : 0}
        borderStyle={`${isDesktop ? 10 : 5}px solid #000`}
        maxAngle={180}
        rippleColor="#000000"
        easing="power4.out"
      />
    </div>
  );
};

export default CubePage;
