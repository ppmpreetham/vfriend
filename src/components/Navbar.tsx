import { useRef, useState } from "preact/hooks";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Link, useNavigate } from "react-router-dom";
import MagneticButton from "./MagneticButton";
import Close from "./Close";
import type { TargetedEvent } from "preact/compat";

const menus = [
  { path: "/about", label: "→About" },
  { path: "/privacy", label: "Privacy" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/faqs", label: "FAQs" },
  { path: "https://www.buymeacoffee.com/preetham", label: "Donate" },
  { path: "/more", label: "More Apps" },
];

const Title = ({
  open,
  onLinkClick,
}: {
  open: boolean;
  onLinkClick: (e: TargetedEvent<HTMLAnchorElement>, path: string) => void;
}) => {
  return (
    <Link
      to="/"
      onClick={(e) => onLinkClick(e, "/")}
      className={`text-4xl font-bold mix-blend-difference text-${
        open ? "black" : "primary"
      } z-${open ? "50" : "40"}`}
    >
      <span className="font-against">VF</span>riend
    </Link>
  );
};

const Navbar = ({}) => {
  const container = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const tl = useRef<gsap.core.Timeline>();

  const navigate = useNavigate();
  const targetPathRef = useRef<string | null>(null);

  useGSAP(
    () => {
      const menuTimeline = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(".fullpage-menu", { display: "none" });
          if (targetPathRef.current) {
            navigate(targetPathRef.current);
            targetPathRef.current = null;
          }
        },
      });

      menuTimeline
        .set(".fullpage-menu", { display: "flex" })
        .fromTo(
          ".menu-bg",
          { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          {
            duration: 0.8,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            ease: "expo.inOut",
          }
        )
        .to(
          ".hamburger-bar",
          { backgroundColor: "black", duration: 0.1, ease: "none" },
          0.7
        )
        .to(
          ".menu-grid",
          { duration: 0.6, opacity: 1, ease: "expo.inOut" },
          "-=0.2"
        )
        .fromTo(
          ".menu-grid a, .menu-grid a > div",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, ease: "expo.inOut", duration: 0.25 }
        );

      tl.current = menuTimeline;
    },
    { scope: container }
  );

  useGSAP(() => {
    if (tl.current) {
      isOpen ? tl.current.play() : tl.current.reverse();
    }
  }, [isOpen]);

  const toggleMenu = () => {
    if (tl.current?.isActive() && tl.current.progress() < 0.9) return;
    targetPathRef.current = null;
    setIsOpen((prev) => !prev);
  };

  const handleLinkClick = (
    event: TargetedEvent<HTMLAnchorElement>,
    path: string
  ) => {
    event.preventDefault();
    targetPathRef.current = path;
    setIsOpen(false);
  };

  return (
    <div ref={container} className="w-screen font-space z-50">
      {/* Topbar */}
      <div className="fixed top-0 left-0 w-screen z-40 p-6 flex justify-between items-center">
        <h1>
          <Title open={false} onLinkClick={handleLinkClick} />
        </h1>
        <div className="z-[40] cursor-pointer">
          <Close isOpen={isOpen} toggleOpen={toggleMenu} />
        </div>
      </div>

      {/* Fullscreen Menu */}
      <div className="fullpage-menu fixed inset-0 z-50 hidden flex-col">
        <div className="menu-bg absolute inset-0 bg-primary clip-path-[polygon(0_0,0_0,0_100%,0_100%)]"></div>
        <div className="h-screen flex flex-col border border-t">
          <div className="fixed top-0 left-0 w-full z-[100] p-6 flex justify-between items-center">
            <h1>
              <Title open={true} onLinkClick={handleLinkClick} />
            </h1>
            <div className="z-[101] cursor-pointer">
              <Close isOpen={isOpen} toggleOpen={toggleMenu} />
            </div>
          </div>
          <div
            className="menu-grid relative z-10 w-full h-full grid lg:grid-cols-2 lg:grid-rows-3 md:grid-cols-2 md:grid-rows-3 grid-cols-1 grid-rows-6
            border-t border-l border-black opacity-0 pt-16"
          >
            {/* 👇 5. Use the correct onClick handlers */}
            {menus.map((item) => {
              const isExternal = item.path.startsWith("http");
              const linkClass =
                "flex items-center justify-center hover:bg-black hover:text-white text-black font-bold text-4xl md:text-6xl transition-transform text-center leading-none border-b border-r border-black";

              if (isExternal) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={toggleMenu}
                    className={linkClass}
                  >
                    <MagneticButton className="w-full h-full">
                      {item.label}
                    </MagneticButton>
                  </a>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={linkClass}
                >
                  <MagneticButton className="w-full h-full">
                    {item.label}
                  </MagneticButton>
                </Link>
              );
            })}
          </div>
          <div className="relative w-full text-center text-sm text-white z-50 mix-blend-difference m-6 flex flex-row gap-4 h-fit justify-center">
            <div className="border-r border-black pr-10">
              ©2025 PREETHAM PEMMASANI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
