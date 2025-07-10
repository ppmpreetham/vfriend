import { useMemo, useEffect, useState } from "react";
import { currentBit } from "../../utils/invokeFunctions";

type ScheduleGridProps = {
  bitmaps: Record<number, boolean[]>;
  kindmaps: Record<number, boolean[]>;
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ bitmaps, kindmaps }) => {
  const currentDay = new Date().getDay(); // 0 = Sunday
  const [currentClass, setCurrentClass] = useState<number | null>(null);
  const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;

  useEffect(() => {
    const fetchBitStatus = async () => {
      const bitmap = bitmaps[adjustedDay] ?? Array(12).fill(false);
      const kindmap = kindmaps[adjustedDay] ?? Array(12).fill(false);

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
    };

    fetchBitStatus();
  }, [bitmaps, kindmaps, adjustedDay]);

  const scheduleMatrix = useMemo(() => {
    const matrix: boolean[][] = [];
    const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

    for (let row = 0; row < 5; row++) {
      const bitmapDay = dayOrder[row];
      const dayBitmap = bitmaps[bitmapDay] ?? Array(12).fill(false);
      matrix.push(dayBitmap);
    }

    return matrix;
  }, [bitmaps]);

  return (
    <div className="m-0 bg-black text-white rounded-xl p-4">
      {scheduleMatrix.map((dayRow, rowIndex) => {
        const isTodayRow = adjustedDay === (rowIndex === 6 ? 0 : rowIndex + 1);

        return (
          <div key={`day-${rowIndex}`} className="grid grid-cols-12 gap-1 mb-1">
            {dayRow.map((hasClass, colIndex) => {
              const isCurrent = isTodayRow && colIndex === currentClass;
              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`rounded-sm aspect-square h-6 hover:bg-gray-800 ${
                    isCurrent
                      ? "bg-white"
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
