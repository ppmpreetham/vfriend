import { invoke } from "@tauri-apps/api/core";
import type { CompactTimetable, CompactSlot, FreeTimeResult } from '../types/timeTable';

// Type definitions to match Rust structs
interface Student {
  u: string;
  t: string;
  o: CompactSlot[];
}

interface FreeTimeSlot {
  start: string;
  end: string;
}

interface UserStatus {
  name: string;
  available: boolean;
  location: string;
  time: string;
}

/**
 * Converts our CompactTimetable to the Student format expected by Rust
 */
function timetableToStudent(timetable: CompactTimetable): Student {
  return {
    u: timetable.u,
    t: timetable.t,
    o: timetable.o
  };
}

/**
 * Builds a bitmap representation of a schedule
 */
export async function buildBitmap(schedule: CompactSlot[]): Promise<boolean[]> {
  return invoke<boolean[]>('build_bitmap', { schedule });
}

/**
 * Checks if a student is free at a specific time
 */
export async function isStudentFree(
  timetable: CompactTimetable,
  time: string
): Promise<[boolean, string | null]> {
  const student = timetableToStudent(timetable);
  return invoke<[boolean, string | null]>('is_student_free', { 
    students: [student],
    student_id: student.u,
    time 
  });
}

/**
 * Finds mutual free time slots between two students
 */
export async function findMutualFreeTime(
  timetable1: CompactTimetable,
  timetable2: CompactTimetable
): Promise<FreeTimeResult[]> {
  const student1 = timetableToStudent(timetable1);
  const student2 = timetableToStudent(timetable2);
  
  const slots = await invoke<FreeTimeSlot[]>('find_mutual_free', {
    students: [student1, student2],
    student_id1: student1.u,
    student_id2: student2.u
  });
  
  // Convert to your FreeTimeResult format
  return slots.map(slot => ({
    day: 0, // You'll need to specify the day
    start_time: slot.start,
    end_time: slot.end
  }));
}

/**
 * Generates a clash bitmap between two schedules
 */
export async function generateClashBitmap(
  schedule1: CompactSlot[],
  schedule2: CompactSlot[]
): Promise<boolean[]> {
  const bitmap1 = await buildBitmap(schedule1);
  const bitmap2 = await buildBitmap(schedule2);
  
  // Calculate clash bitmap (where both are 1)
  return bitmap1.map((bit, i) => bit && bitmap2[i]);
}

/**
 * Generates a free bitmap between two schedules
 */
export async function generateFreeBitmap(
  schedule1: CompactSlot[],
  schedule2: CompactSlot[]
): Promise<boolean[]> {
  const bitmap1 = await buildBitmap(schedule1);
  const bitmap2 = await buildBitmap(schedule2);
  
  // Calculate free bitmap (where both are 0)
  return bitmap1.map((bit, i) => !bit && !bitmap2[i] ? true : false);
}

/**
 * Gets the next free time for a student from the current time
 * @param timetable The student's timetable
 * @param currentTime Current time in "HH:MM" format (24-hour)
 * @returns Next free time in "HH:MM" format or null if not found
 */
export async function getNextFreeTime(
  timetable: CompactTimetable,
  currentTime: string,
  currentDay: number
): Promise<string | null> {
  const student = timetableToStudent(timetable);
  
  try {
    return await invoke<string | null>('next_free_time', {
      students: [student],
      studentId: timetable.u,
      time: currentTime,
      day: currentDay
    });
  } catch (error) {
    console.error("Error getting next free time:", error);
    return null;
  }
}