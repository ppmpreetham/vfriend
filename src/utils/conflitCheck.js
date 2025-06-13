//================================================================// 
//== THIS CODE IS NO LONGER USED, IT IS NOW IN THE RUST BACKEND ==//
//================================================================// 

// time slots with actual start/end times
const timeSlotDefinitions = {
  theory: [
    { period: 1, start: "08:00", end: "08:50" },
    { period: 2, start: "08:55", end: "09:45" },
    { period: 3, start: "09:50", end: "10:40" },
    { period: 4, start: "10:45", end: "11:35" },
    { period: 5, start: "11:40", end: "12:30" },
    { period: 6, start: "12:35", end: "13:25" },
    { period: 7, start: "14:00", end: "14:50" },
    { period: 8, start: "14:55", end: "15:45" },
    { period: 9, start: "15:50", end: "16:40" },
    { period: 10, start: "16:45", end: "17:35" },
    { period: 11, start: "17:40", end: "18:30" },
    { period: 12, start: "18:35", end: "19:25" },
  ],
  lab: [
    { period: 1, start: "08:00", end: "08:50" },
    { period: 2, start: "08:50", end: "09:40" },
    { period: 3, start: "09:50", end: "10:40" },
    { period: 4, start: "10:40", end: "11:30" },
    { period: 5, start: "11:40", end: "12:30" },
    { period: 6, start: "12:30", end: "13:20" },
    { period: 7, start: "14:00", end: "14:50" },
    { period: 8, start: "14:50", end: "15:40" },
    { period: 9, start: "15:50", end: "16:40" },
    { period: 10, start: "16:40", end: "17:30" },
    { period: 11, start: "17:40", end: "18:30" },
    { period: 12, start: "18:30", end: "19:20" },
  ],
};

// Define lunch periods - treated as free time
const lunchPeriods = {
  theory: { start: "13:25", end: "14:00" },
  lab: { start: "13:20", end: "14:00" },
};

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeString) {
  if (timeString === "Lunch") return -1; // Special case for lunch

  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function to check if two time ranges overlap
function timeRangesOverlap(start1, end1, start2, end2) {
  // Convert all times to minutes for easier comparison
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);

  // Check for overlap
  return start1Mins < end2Mins && end1Mins > start2Mins;
}

// Get the precise time slot information for a given class
function getTimeSlotInfo(day, period, slotType) {
  const type = slotType === "t" ? "theory" : "lab";

  // Handle lunch period specially - it's between periods 6 and 7
  if (period === "Lunch") {
    return {
      period: "Lunch",
      start: lunchPeriods[type].start,
      end: lunchPeriods[type].end,
    };
  }

  // Convert to 0-based index
  const periodIndex = period - 1;

  if (periodIndex >= 0 && periodIndex < timeSlotDefinitions[type].length) {
    return timeSlotDefinitions[type][periodIndex];
  }

  return null;
}

// Check if a specific slot conflicts with any slot in another schedule
function slotConflictsWithSchedule(slot, otherSchedule) {
  const slotInfo = getTimeSlotInfo(slot.d, slot.p, slot.s);
  if (!slotInfo) return false;

  for (const otherSlot of otherSchedule.o) {
    const otherSlotInfo = getTimeSlotInfo(
      otherSlot.d,
      otherSlot.p,
      otherSlot.s
    );
    if (!otherSlotInfo) continue;

    // Only check for conflicts on the same day
    if (slot.d === otherSlot.d) {
      // Check if the time ranges overlap
      if (
        timeRangesOverlap(
          slotInfo.start,
          slotInfo.end,
          otherSlotInfo.start,
          otherSlotInfo.end
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

// Find common free times between multiple friends, accounting for precise times
// and treating lunch as free time
function findCommonFreeTimes(friendsSchedules) {
  const commonFreeTimes = [];
  const days = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday

  // For each day, check every 5-minute interval to find common free times
  for (const day of days) {
    // Generate time intervals across the day (8:00 to 19:30)
    const startMinutes = timeToMinutes("08:00");
    const endMinutes = timeToMinutes("19:30");
    const intervals = [];

    // Create 5-minute intervals
    for (let min = startMinutes; min < endMinutes; min += 5) {
      const hour = Math.floor(min / 60);
      const minute = min % 60;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      intervals.push(timeString);
    }

    // For each interval, check if all friends are free
    for (let i = 0; i < intervals.length - 1; i++) {
      const startTime = intervals[i];
      const endTime = intervals[i + 1];

      const allFree = friendsSchedules.every((friend) => {
        return !friend.schedule.o.some((slot) => {
          const slotInfo = getTimeSlotInfo(slot.d, slot.p, slot.s);
          if (!slotInfo || slot.d !== day) return false;

          // Skip checking lunch periods - we treat them as free time
          const lunchStartTheory = timeToMinutes(lunchPeriods.theory.start);
          const lunchEndTheory = timeToMinutes(lunchPeriods.theory.end);
          const lunchStartLab = timeToMinutes(lunchPeriods.lab.start);
          const lunchEndLab = timeToMinutes(lunchPeriods.lab.end);

          const slotStartMins = timeToMinutes(slotInfo.start);
          const slotEndMins = timeToMinutes(slotInfo.end);

          // If this slot is entirely during lunch, don't count it as occupied
          if (
            (slotStartMins >= lunchStartTheory &&
              slotEndMins <= lunchEndTheory) ||
            (slotStartMins >= lunchStartLab && slotEndMins <= lunchEndLab)
          ) {
            return false;
          }

          return timeRangesOverlap(
            startTime,
            endTime,
            slotInfo.start,
            slotInfo.end
          );
        });
      });

      if (allFree) {
        // Combine consecutive free intervals
        if (commonFreeTimes.length > 0) {
          const lastFreeTime = commonFreeTimes[commonFreeTimes.length - 1];
          if (lastFreeTime.day === day && lastFreeTime.end_time === startTime) {
            lastFreeTime.end_time = endTime;
            continue;
          }
        }

        commonFreeTimes.push({
          day,
          start_time: startTime,
          end_time: endTime,
        });
      }
    }
  }

  return commonFreeTimes;
}

// Updated function to check if user is free, treating lunch as free time
function isUserFreeAt(userSchedule, day, timeString) {
  const timeMinutes = timeToMinutes(timeString);

  // Check if the time is during lunch period (always free)
  const lunchStartTheory = timeToMinutes(lunchPeriods.theory.start);
  const lunchEndTheory = timeToMinutes(lunchPeriods.theory.end);
  const lunchStartLab = timeToMinutes(lunchPeriods.lab.start);
  const lunchEndLab = timeToMinutes(lunchPeriods.lab.end);

  if (
    (timeMinutes >= lunchStartTheory && timeMinutes < lunchEndTheory) ||
    (timeMinutes >= lunchStartLab && timeMinutes < lunchEndLab)
  ) {
    return true; // It's lunch time, so the user is free
  }

  return !userSchedule.o.some((slot) => {
    if (slot.d !== day) return false;

    const slotInfo = getTimeSlotInfo(slot.d, slot.p, slot.s);
    if (!slotInfo) return false;

    // Skip lunch periods in checking - they're free time
    if (slotInfo.period === "Lunch") return false;

    const slotStartMinutes = timeToMinutes(slotInfo.start);
    const slotEndMinutes = timeToMinutes(slotInfo.end);

    return timeMinutes >= slotStartMinutes && timeMinutes < slotEndMinutes;
  });
}

// Helper function for finding conflicts that ignores lunch periods
function findDayConflicts(user1Schedule, user2Schedule, day) {
  const conflicts = [];

  // Get all slots for the specified day
  const user1DaySlots = user1Schedule.o.filter((slot) => slot.d === day);
  const user2DaySlots = user2Schedule.o.filter((slot) => slot.d === day);

  // Check each user1 slot against all user2 slots
  for (const slot1 of user1DaySlots) {
    const slot1Info = getTimeSlotInfo(slot1.d, slot1.p, slot1.s);
    if (!slot1Info || slot1Info.period === "Lunch") continue; // Skip lunch periods

    for (const slot2 of user2DaySlots) {
      const slot2Info = getTimeSlotInfo(slot2.d, slot2.p, slot2.s);
      if (!slot2Info || slot2Info.period === "Lunch") continue; // Skip lunch periods

      // Check if the time ranges overlap
      if (
        timeRangesOverlap(
          slot1Info.start,
          slot1Info.end,
          slot2Info.start,
          slot2Info.end
        )
      ) {
        conflicts.push({
          day,
          user1Slot: {
            type: slot1.s === "t" ? "Theory" : "Lab",
            period: slot1.p,
            time: `${slot1Info.start}-${slot1Info.end}`,
            class: slot1.f,
          },
          user2Slot: {
            type: slot2.s === "t" ? "Theory" : "Lab",
            period: slot2.p,
            time: `${slot2Info.start}-${slot2Info.end}`,
            class: slot2.f,
          },
        });
      }
    }
  }

  return conflicts;
}
