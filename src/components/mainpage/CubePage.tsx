import Cubes from "../Cubes";

const CubePage = ({ isDesktop }: { isDesktop: boolean }) => {
  return (
    <div className={"w-screen"}>
      <Cubes
        faceColor="#ebff57"
        gridSizeX={isDesktop ? 15 : 8}
        gridSizeY={3}
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
