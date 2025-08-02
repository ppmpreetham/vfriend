import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "preact/hooks";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import FlowingMenu from "../components/FlowMenu";
import Footer from "../components/mainpage/DownloadApp";
import CustomCursor from "../components/CustomCursor";
import DescriptionText from "./text";
import CubePage from "../components/mainpage/CubePage";

gsap.registerPlugin(useGSAP, ScrollSmoother, ScrollTrigger);

export default function About() {
  const main = useRef<HTMLDivElement>(null);
  const smoother = useRef<ScrollSmoother | null>(null);

  const [isDesktop, setIsDesktop] = useState(
    window.innerHeight <= window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerHeight <= window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useGSAP(
    () => {
      if (!main.current) return;
      smoother.current = ScrollSmoother.create({
        smooth: 2,
        effects: true,
        ignoreMobileResize: true,
      });
    },
    { scope: main }
  );

  return (
    <div
      id="smooth-wrapper"
      className="cursor-auto md:cursor-none overflow-x-hidden"
      ref={main}
    >
      {isDesktop && <CustomCursor />}
      <Navbar />
      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        data-speed={1}
        data-lag={0.4}
      ></div>
      <div id="smooth-content">
        <div className="h-20"></div>
        <DescriptionText />
        <CubePage isDesktop={isDesktop} />

        <FlowingMenu
          items={[
            {
              link: "/about",
              text: "About",
              image:
                "https://media.istockphoto.com/id/1201699594/vector/information-icon.jpg?s=612x612&w=0&k=20&c=0Nh1zH8uhuqp84FhC8RkJtopaq5Ni2zplAtq1q8o4zM=",
            },

            {
              link: "/privacy",
              text: "Privacy",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Ihx53jvI-Lgsa_RwlXpr7Ry-xR8e_Eb4RA&s",
            },

            {
              link: "/tutorial",
              text: "Tutorial",
              image:
                "https://www.freeiconspng.com/thumbs/question-mark-icon/black-question-mark-icon-clip-art-10.png",
            },

            {
              link: "/more",
              text: "More Apps",
              image: "https://cdn-icons-png.flaticon.com/512/3357/3357272.png",
            },
          ]}
        />
        <Footer />
      </div>
    </div>
  );
}
