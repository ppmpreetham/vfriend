import { useMemo } from "react";

type ScheduleGridProps = {
  bitmaps: Record<number, boolean[]>;
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ bitmaps }) => {
  // Convert bitmaps to a visual matrix for display
  const scheduleMatrix = useMemo(() => {
    const matrix: boolean[][] = [];

    // Remap days starting from Monday (1) to Sunday (0)
    const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday in bitmap indices

    for (let displayIndex = 0; displayIndex < 7; displayIndex++) {
      const bitmapDay = dayOrder[displayIndex]; // Get the bitmap day index
      const dayBitmap = bitmaps[bitmapDay] || Array(12).fill(false);
      matrix.push(dayBitmap);
    }

    return matrix;
  }, [bitmaps]);

  return (
    <div className="mx-4 bg-primary text-black rounded-xl p-4">
      {/* Days and schedule grid */}
      {scheduleMatrix.map((dayRow, rowIndex) => (
        <div
          key={`day-${rowIndex}`}
          className="grid grid-cols-[auto_repeat(12,1fr)] gap-1 mb-1"
        >
          {/* Schedule cells for this day */}
          {dayRow.map((hasClass, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={`rounded-sm aspect-square h-6 ${
                hasClass ? "bg-black" : ""
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScheduleGrid;
