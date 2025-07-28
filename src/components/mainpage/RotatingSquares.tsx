import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import NoTTs from "./NoTTs";

const PRIMARY = "#ebff57";
const baseClass =
  "absolute w-fit h-fit border-white border box-stagger text-black py-2 px-4 text-[0.25rem, 10vw, 1.25rem]";

const RotatingSquares = () => {
  const length = Math.min(window.innerHeight, window.innerWidth);

  const isMobile = window.innerHeight > window.innerWidth;

  useGSAP(() => {
    gsap.set(".box-stagger", {
      x: (i) =>
        isMobile ? 0 : length * 0.3 * Math.cos((i * 60 * Math.PI) / 180),
      y: (i) =>
        isMobile
          ? (i - 3) * 75
          : length * 0.3 * Math.sin((i * 60 * Math.PI) / 180),
    });

    const rotatingTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".containerr",
        start: "top top",
        end: "bottom+=500vh center",
        scrub: 1,
        pin: ".containerr",
      },
    });

    rotatingTl
      .to(".textty", {
        opacity: 0,
        duration: 1,
      })
      .to(".funstuff", {
        opacity: 1,
        duration: 1,
      })
      .to(".box-stagger", {
        backgroundColor: "black",
        color: "rgba(0,0,0,0)",
        ease: "power3.in",
        stagger: 0.1,
        duration: 2,
      })
      .to(".box-stagger", {
        // backgroundColor: "white",
        borderRadius: "0%",
        height: "8rem",
        width: "8rem",
        stagger: 0.1,
        duration: 2,
      })
      .to(".box-stagger", {
        backgroundColor: (i) =>
          i == 5 ? "black" : i % 2 == 0 ? PRIMARY : "black",
        x: 0,
        y: 0,
        stagger: 0.1,
        duration: 2,
      })
      .to(".box-stagger", {
        height: "100vh",
        width: "100vw",
        stagger: 0.1,
        duration: 2,
      })
      .to(".notts", {
        opacity: 1,
        duration: 1,
      })
      .to(".box-stagger", {
        opacity: 0,
        duration: 0.1,
      });
  }, [window.innerWidth]);

  return (
    <div className="flex items-center justify-center w-full text-white containerr h-screen">
      <div className="flex items-center justify-center absolute inset-0">
        <div className="text-6xl md:text-6xl lg:text-7xl z-0 pb-2 text-center textty px-2">
          DON'T
          <br />F
          <span
            className="
          text-primary
          cursor-pointer
          inline-block
          transition-transform
          duration-500
          ease-out
          origin-center
          hover:rotate-[360deg]
          hover:scale-200
            "
          >
            *
          </span>
          CKING CALL YOUR FRIENDS
        </div>
      </div>
      <div
        className="flex items-center justify-center absolute inset-0 notts z-40"
        style={{ opacity: 0 }}
      >
        <NoTTs />
      </div>
      <div
        className="flex items-center justify-center funstuff mix-blend-screen"
        style={{ opacity: 0 }}
      >
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          Hey, I'm at AB3, where are you?
        </div>
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          Bruh tf are you even at?
        </div>
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          Pick up my calls!!🤬
        </div>
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          Urgent where are you?
        </div>
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          I'm free rn, you?
        </div>
        <div
          className={baseClass}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: "calc(infinity * 1px)",
          }}
        >
          Where should I pick you up!?
        </div>
      </div>
    </div>
  );
};

export default RotatingSquares;
