type ClassEntry = {
  d: number; // Day: 1 (Mon) to 6 (Sat)
  s: string; // "t" (theory) or "l" (lab)
  p: number; // Period: 1–12
  f: string; // Full class info
};

type UserSchedule = {
  u: string;
  t: string;
  o: ClassEntry[];
};

type ScheduleGridProps = {
  data: UserSchedule;
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ data }) => {
  const getScheduleMatrix = (): boolean[][] => {
    const matrix: boolean[][] = Array.from({ length: 6 }, () =>
      Array(12).fill(false)
    );

    for (const entry of data.o) {
      const dayIdx = entry.d - 1;
      const periodIdx = entry.p - 1;
      if (dayIdx >= 0 && dayIdx < 6 && periodIdx >= 0 && periodIdx < 12) {
        matrix[dayIdx][periodIdx] = true;
      }
    }

    return matrix;
  };

  const scheduleMatrix = getScheduleMatrix();

  return (
    <div className="grid grid-cols-12 gap-2 mx-4 bg-primary text-black rounded-xl p-2">
      {scheduleMatrix.map((dayRow, rowIndex) =>
        dayRow.map((hasClass, colIndex) => (
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            className={`rounded-sm aspect-square h-5 ${
              hasClass ? "bg-black" : "bg-primary"
            }`}
          />
        ))
      )}
    </div>
  );
};

export default ScheduleGrid;
