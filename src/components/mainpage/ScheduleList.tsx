import { useState, useRef } from "preact/hooks";
import { table } from "./timetable";
import { useGSAP } from "@gsap/react";
import ShinyText from "../ShinyText";
import GradientText from "../GradientText";

const ScheduleList = ({ timeline }: { timeline: gsap.core.Timeline }) => {
  const [TimeTable] = useState<boolean[][]>(table);

  const currentDay = 3;
  const gridRef = useRef<HTMLDivElement>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const cellRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const textRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!gridRef.current || !timeline || !gridWrapRef.current) return;
    const cells = Array.from(cellRefsMap.current.values());
    timeline
      .fromTo(
        cells,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: gridWrapRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
            // markers: true,
          },
        }
      )
      .to(textRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 70%",
          end: "bottom center",
          scrub: true,
          //   markers: true,
        },
      });
  });

  const setCellRef = (
    el: HTMLDivElement | null,
    rowIndex: number,
    colIndex: number,
    hasClass: boolean
  ) => {
    if (el && hasClass) {
      const key = `cell-${rowIndex}-${colIndex}`;
      cellRefsMap.current.set(key, el);
    }
  };

  return (
    <div
      ref={gridWrapRef}
      className="flex flex-col items-center justify-center w-full"
    >
      <div
        className="m-0 text-foreground rounded-xl p-4 flex justify-center items-center flex-col"
        ref={gridRef}
      >
        {TimeTable.map((dayRow, rowIndex) => {
          const dayNumber = rowIndex + 1;
          const isTodayRow = currentDay === dayNumber;

          return (
            <div
              key={`day-${rowIndex}`}
              className="grid grid-flow-col auto-cols-min mb-1 gap-1"
            >
              {dayRow.map((hasClass, colIndex) => {
                const isCurrent = isTodayRow && colIndex === 3;
                const [showMessage, setShowMessage] = useState(false);
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    ref={(el) => setCellRef(el, rowIndex, colIndex, hasClass)}
                    className={`rounded-sm w-[calc(100vw/12-2vw)] h-[calc(100vw/12-2vw)] flex items-center justify-center ${
                      hasClass
                        ? "bg-primary hover:bg-primary/80"
                        : "border border-primary"
                    }`}
                  >
                    {isCurrent && (
                      <div
                        className="w-3/4 h-3/4 bg-black rounded-full relative"
                        onMouseEnter={() => setShowMessage(true)}
                        onMouseLeave={() => setShowMessage(false)}
                      >
                        {showMessage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary text-black text-center text-lg cursor-pointer leading-none">
                            Your current period
                          </div>
                        )}
                      </div>
                    )}{" "}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="text-center" ref={textRef} style={{ opacity: 0 }}>
        <div className="text-3xl md:text-5xl lg:text-9xl z-0">
          YOUR TIMETABLE
        </div>
        <div className="lg:text-5xl">
          Shown in a way like{" "}
          <span className="px-2 bg-primary text-black rounded-xl">Never</span>{" "}
          before
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
