import MagneticButton from "./components/MagneticButton";
import Navbar from "./components/Navbar";
import HeroElements from "./components/HeroElements";
import { useRef, useState } from "preact/hooks";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ScheduleList from "./components/mainpage/ScheduleList";
import FlowingMenu from "./components/FlowMenu";
import NoTTs from "./components/mainpage/NoTTs";

gsap.registerPlugin(useGSAP, ScrollSmoother, ScrollTrigger);

export default function App() {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const main = useRef<HTMLDivElement>(null);
  const smoother = useRef<ScrollSmoother | null>(null);

  useGSAP(
    () => {
      if (!main.current) return;
      smoother.current = ScrollSmoother.create({
        smooth: 2,
        effects: true,
        // smoothTouch: 0.1,
        // ignoreMobileResize: true,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: main.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          // markers: true,
        },
      });
      setTimeline(timeline);
      // timeline.to();
    },
    { scope: main }
  );
  return (
    <div id="smooth-wrapper" ref={main}>
      <Navbar />

      <div id="smooth-content">
        <div className="min-h-screen w-full font-space text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
          <HeroElements />
          <div className="flex flex-col md:flex-row items-center max-w-5xl gap-8 md:gap-12 w-full justify-center">
            <div className="flex flex-col items-center text-center gap-4 md:gap-6 md:w-1/2">
              <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
                <span className="font-against">VF</span>
                riend
              </h1>
              <p className="text-lg md:text-xl">
                A Fully Offline app that helps you find which of your{" "}
                <span className="bg-primary rounded-xl text-black px-2">
                  friends
                </span>{" "}
                are free at any given point of time
              </p>
              <a
                href="https://github.com/ppmpreetham/vfriend/releases/download/v0.5.3/app-universal-release.apk"
                className="cursor-pointer z-10"
              >
                <MagneticButton className="bg-primary text-black py-2.5 md:py-3 px-5 md:px-6 rounded-xl text-base md:text-lg font-medium mt-2">
                  Download VFriend
                </MagneticButton>
              </a>
            </div>
          </div>
        </div>
        {timeline && <ScheduleList timeline={timeline} />}
        <NoTTs />
        <div className="h-screen"> </div>
        <FlowingMenu
          items={[
            {
              link: "#",
              text: "About",
              image:
                "https://media.istockphoto.com/id/1201699594/vector/information-icon.jpg?s=612x612&w=0&k=20&c=0Nh1zH8uhuqp84FhC8RkJtopaq5Ni2zplAtq1q8o4zM=",
            },

            {
              link: "#",
              text: "Privacy",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Ihx53jvI-Lgsa_RwlXpr7Ry-xR8e_Eb4RA&s",
            },

            {
              link: "#",
              text: "Tutorial",
              image:
                "https://www.freeiconspng.com/thumbs/question-mark-icon/black-question-mark-icon-clip-art-10.png",
            },

            {
              link: "#",
              text: "More Apps",
              image: "https://cdn-icons-png.flaticon.com/512/3357/3357272.png",
            },
          ]}
        />
      </div>
    </div>
  );
}
