import { useRef, useEffect, useState } from "preact/hooks";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import MagneticButton from "./MagneticButton";
import Close from "./Close";

const menus = [
  { path: "/about", label: "→About" },
  { path: "/privacy", label: "Privacy" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/faqs", label: "FAQs" },
  { path: "/donate", label: "Donate" },
  { path: "/more", label: "More Apps" },
] as const satisfies Array<{ path: string; label: string }>;

const Navbar = ({}) => {
  const container = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const tl = useRef<gsap.core.Timeline>();

  useGSAP(
    () => {
      const menuTimeline = gsap.timeline({
        paused: true,
        onComplete: () => console.log("Menu fully opened"),
        onReverseComplete: () => console.log("Menu fully closed"),
      });

      menuTimeline
        .to(".fullpage-menu", { display: "flex", duration: 0 })
        .fromTo(
          ".menu-bg",
          { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          {
            duration: 0.8,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            ease: "expo.inOut",
          }
        )
        .to(".menu-grid", { duration: 0.6, opacity: 1, ease: "expo.inOut" })
        .fromTo(
          ".menu-grid a",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: "expo.inOut",
            duration: 0.25,
          }
        );

      tl.current = menuTimeline;
    },
    { scope: container }
  );

  useEffect(() => {
    if (!tl.current) return;

    if (isOpen) {
      tl.current.play();
    } else {
      tl.current.reverse();

      if (tl.current.progress() === 0) {
        gsap.set(".fullpage-menu", { display: "none" });
      }
    }
  }, [isOpen]);

  const toggleMenu = () => {
    if (tl.current?.isActive() && tl.current.progress() < 0.9) return;
    console.log("Toggling menu, isOpen:", !isOpen);
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={container} className="font-space z-50">
      {/* Topbar */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center">
        <a
          href="/"
          className="text-4xl font-bold mix-blend-difference text-primary z-10"
        >
          <span className="font-against">VF</span>riend
        </a>
        <div className="z-[60] cursor-pointer">
          <Close isOpen={isOpen} toggleOpen={toggleMenu} />
        </div>
      </div>

      {/* Fullscreen Menu */}
      <div className="fullpage-menu fixed inset-0 z-40 hidden flex-col">
        {/* Background */}
        <div className="menu-bg absolute inset-0 bg-primary clip-path-[polygon(0_0,0_0,0_100%,0_100%)] transition-all duration-700"></div>

        {/* Grid Menu */}
        <div className="h-screen flex flex-col">
          <div className="relative z-20 flex flex-row items-center text-black p-4">
            <div className="text-5xl flex flex-row tracking-tighter items-center justify-center gap-0">
              <span className="text-4xl font-against">VF</span>
              <h2>riend</h2>
            </div>
          </div>
          <div
            className="menu-grid relative z-10 w-full h-full grid lg:grid-cols-2 lg:grid-rows-3 md:grid-cols-2 md:grid-rows-3 grid-cols-1 grid-rows-6
            border-t border-l border-black opacity-0"
          >
            {menus.map((item, index) => (
              <MagneticButton className="flex items-center justify-center hover:bg-black hover:text-white text-black font-bold text-4xl md:text-6xl transition-transform text-center leading-none border-b border-r border-black">
                <a
                  key={index}
                  href={item.path}
                  onClick={toggleMenu}
                  className=""
                >
                  {item.label}
                </a>
              </MagneticButton>
            ))}
          </div>
          {/* Footer */}
          <div className="relative w-full text-center text-sm text-white z-50 mix-blend-difference m-6 flex flex-row gap-4 h-fit">
            <div className="border-r border-black pr-4">
              ©2025 PREETHAM PEMMASANI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
