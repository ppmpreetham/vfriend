import { useMemo, useEffect, useState } from "react";
import { currentBit } from "../../utils/invokeFunctions";

type ScheduleGridProps = {
  bitmaps: Record<number, boolean[]>;
  kindmaps: Record<number, boolean[]>;
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ bitmaps, kindmaps }) => {
  const currentDay = new Date().getDay(); // 0 = Sunday
  const [currentClass, setCurrentClass] = useState<number | null>(null);

  useEffect(() => {
    const fetchBitStatus = async () => {
      // Only check current classes if it's a weekday (Mon-Fri)
      if (currentDay >= 1 && currentDay <= 5) {
        const bitmap = bitmaps[currentDay] ?? Array(12).fill(false);
        const kindmap = kindmaps[currentDay] ?? Array(12).fill(false);

        try {
          const result = await currentBit({ bitmap, kindmap });
          if (result >= 1 && result <= 12) {
            setCurrentClass(result - 1); // convert to 0-based index
          } else {
            setCurrentClass(null);
          }
        } catch (error) {
          console.error("Failed to fetch current bit:", error);
          setCurrentClass(null);
        }
      } else {
        setCurrentClass(null); // No classes on weekend
      }
    };

    fetchBitStatus();
  }, [bitmaps, kindmaps, currentDay]);

  const scheduleMatrix = useMemo(() => {
    const matrix: boolean[][] = [];
    // Days 1-5 represent Monday-Friday
    for (let day = 1; day <= 5; day++) {
      const dayBitmap = bitmaps[day] ?? Array(12).fill(false);
      matrix.push(dayBitmap);
    }
    return matrix;
  }, [bitmaps]);

  return (
    <div className="m-0 text-foreground rounded-xl p-4">
      {scheduleMatrix.map((dayRow, rowIndex) => {
        // Day in rowIndex 0-4 corresponds to days 1-5 (Mon-Fri)
        const dayNumber = rowIndex + 1;
        const isTodayRow = currentDay === dayNumber;

        return (
          <div key={`day-${rowIndex}`} className="grid grid-cols-12 gap-1 mb-1">
            {dayRow.map((hasClass, colIndex) => {
              const isCurrent = isTodayRow && colIndex === currentClass;
              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`rounded-sm aspect-square h-6 hover:bg-background3 ${
                    isCurrent
                      ? "bg-foreground"
                      : hasClass
                      ? "bg-primary"
                      : "border border-primary"
                  }`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleGrid;
