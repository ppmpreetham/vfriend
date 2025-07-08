import { Calendar, User, Users, Home } from "lucide-react";
import useNavStore from "../store/useNavStore";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Footer = () => {
  const { activeTab, setActiveTab } = useNavStore();

  // mapping activeTab to its index
  const tabsOrder = ["home", "calendar", "friends", "profile"];
  const activeIndex = tabsOrder.indexOf(activeTab);

  // animation
  const [positions, setPositions] = useState(Array(4).fill({ x: 0, y: 0 }));
  const tabs = useRef<(HTMLDivElement | null)[]>([]);
  const mover = useRef<HTMLDivElement>(null);

  // calculating the positions of the div
  useEffect(() => {
    const calculatePositions = () => {
      const parent = mover.current?.offsetParent as HTMLElement;
      const parentRect = parent?.getBoundingClientRect();

      const newPositions = tabs.current.map((tab) => {
        if (!tab || !parentRect) return { x: 0, y: 0 };
        const rect = tab.getBoundingClientRect();
        return {
          x: rect.left - parentRect.left + rect.width / 2 - 28,
          y: rect.top - parentRect.top + rect.height / 2 - 28,
        };
      });

      setPositions(newPositions);
    };

    // Calculate initial positions after a short delay to ensure DOM is ready
    setTimeout(calculatePositions, 100);

    // Add event listener for window resize
    window.addEventListener("resize", calculatePositions);

    // Clean up event listener
    return () => window.removeEventListener("resize", calculatePositions);
  }, []);

  useEffect(() => {
    if (positions[activeIndex] && mover.current) {
      gsap.to(mover.current, {
        left: positions[activeIndex].x,
        top: positions[activeIndex].y,
        duration: 0.75,
        ease: "power3.out",
      });
    }
  }, [activeIndex, positions]);

  return (
    <div className="flex px-6 py-2 justify-between items-center relative">
      {/* Moving indicator element */}
      <div
        ref={mover}
        className={`z-30 absolute w-14 h-14 bg-primary bg-opacity-20 rounded-full pointer-events-none transition-opacity duration-300 ${
          activeIndex === -1 ? "opacity-0 pointer-events-none" : ""
        }`}
      />
      <div
        ref={(el) => (tabs.current[0] = el)}
        onClick={() => setActiveTab("home")}
        className="flex-1 flex justify-center my-4"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "home" ? "" : "hover:bg-gray-700"
          }`}
          aria-label="Home"
        >
          <Home
            color={activeTab === "home" ? "black" : "white"}
            className="pointer-events-none z-30"
          />
        </button>
      </div>

      <div
        ref={(el) => (tabs.current[1] = el)}
        onClick={() => setActiveTab("calendar")}
        className="flex-1 flex justify-center my-4"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "calendar" ? "" : "hover:bg-gray-700"
          }`}
          aria-label="Calendar"
        >
          <Calendar
            color={activeTab === "calendar" ? "black" : "white"}
            className="pointer-events-none z-30"
          />
        </button>
      </div>

      <div
        ref={(el) => (tabs.current[2] = el)}
        onClick={() => setActiveTab("friends")}
        className="flex-1 flex justify-center my-4"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "friends" ? "" : "hover:bg-gray-700"
          }`}
          aria-label="Friends"
        >
          <Users
            color={activeTab === "friends" ? "black" : "white"}
            className="pointer-events-none z-30"
          />
        </button>
      </div>

      <div
        ref={(el) => (tabs.current[3] = el)}
        onClick={() => setActiveTab("profile")}
        className="flex-1 flex justify-center my-4"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "profile" ? "" : "hover:bg-gray-700"
          }`}
          aria-label="Profile"
        >
          <User
            color={activeTab === "profile" ? "black" : "white"}
            className="pointer-events-none z-30"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;
