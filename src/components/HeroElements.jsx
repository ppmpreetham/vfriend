import { useEffect, useState, useRef } from "preact/hooks";
import { shuffle } from "gsap/all";
import { useGSAP } from "@gsap/react";

import a from "/icons/1.svg";
import b from "/icons/2.svg";
import c from "/icons/3.svg";
import d from "/icons/4.svg";
import e from "/icons/5.svg";
import f from "/icons/6.svg";
import g from "/icons/7.svg";
import h from "/icons/8.svg";
import i from "/icons/9.svg";
import j from "/icons/10.svg";
import k from "/icons/11.svg";
import l from "/icons/12.svg";
import m from "/icons/13.svg";
import n from "/icons/14.svg";
import o from "/icons/15.svg";

const mobilePositions = [
  { top: "15.271493212669684vh", left: "39.787798408488065vw" },
  { top: "25.791855203619914vh", left: "75.59681697612733vw" },
  { top: "21.153846153846153vh", left: "19.098143236074268vw" },
  { top: "70.58823529411765vh", left: "51.9893899204244vw" },
  { top: "68.55203619909503vh", left: "86.73740053050398vw" },
  { top: "83.710407239819vh", left: "46.684350132625994vw" },
  { top: "81.10859728506787vh", left: "13.793103448275861vw" },
  { top: "89.81900452488688vh", left: "73.74005305039788vw" },
  { top: "92.76018099547511vh", left: "18.56763925729443vw" },
  { top: "16.289592760180994vh", left: "80.37135278514589vw" },
  { top: "24.32126696832579vh", left: "44.56233421750663vw" },
  { top: "33.93665158371041vh", left: "21.220159151193634vw" },
  { top: "33.93665158371041vh", left: "80.63660477453581vw" },
  { top: "80.54298642533936vh", left: "81.6976127320955vw" },
  { top: "66.51583710407239vh", left: "19.363395225464192vw" },
];

const desktopPositions = [
  { top: "29.072398190045252vh", left: "13.51010101010101vw" },
  { top: "12.217194570135746vh", left: "18.434343434343432vw" },
  { top: "27.714932126696834vh", left: "68.68686868686868vw" },
  { top: "38.91402714932127vh", left: "87.56313131313132vw" },
  { top: "59.61538461538461vh", left: "77.77777777777779vw" },
  { top: "73.98190045248869vh", left: "33.33333333333333vw" },
  { top: "42.76018099547511vh", left: "25.189393939393938vw" },
  { top: "61.53846153846154vh", left: "16.982323232323232vw" },
  { top: "84.27601809954751vh", left: "12.5vw" },
  { top: "13.23529411764706vh", left: "45.01262626262626vw" },
  { top: "21.040723981900452vh", left: "30.36616161616162vw" },
  { top: "19.230769230769234vh", left: "55.61868686868687vw" },
  { top: "13.461538461538462vh", left: "81.81818181818183vw" },
  { top: "83.3710407239819vh", left: "80.7449494949495vw" },
  { top: "85.06787330316742vh", left: "53.03030303030303vw" },
];

const HeroElements = ({ timeline }) => {
  const [iconPositions, setIconPositions] = useState([]);

  useGSAP(
    () => {
      // timeline && timeline.to();
    },
    { scope: timeline }
  );

  useEffect(() => {
    const updatePositions = () => {
      const isMobile = window.innerWidth <= 768;
      setIconPositions(isMobile ? mobilePositions : desktopPositions);
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("resize", updatePositions);
    };
  }, []);

  const t = 0.8; // linear INTERPOLATION
  return (
    <div className="w-screen h-screen absolute z-0">
      {shuffle([a, b, c, d, e, f, g, h, i, j, k, l, m, n, o]).map(
        (icon, index) => {
          const position = iconPositions[index];
          return (
            <img
              key={index}
              src={icon}
              data-speed={t + Math.random() * (1 - t)}
              unselectable="on"
              alt={`Icon ${index + 1}`}
              className="absolute w-16 h-16 md:w-24 md:h-24 pointer-events-none"
              style={{
                top: position?.top,
                left: position?.left,
                transform: "translate(-50%, -50%)",
                filter: "brightness(0) invert(1)",
                position: "absolute",
              }}
            />
          );
        }
      )}
    </div>
  );
};

export default HeroElements;
