// Import Tauri API
import { invoke } from "@tauri-apps/api/core";
import { CompactTimetable, ConflictResult } from "../types/timeTable";

export async function parseHTMLTimetable(htmlContent: string): Promise<CompactTimetable> {
  try {
    const jsonString = await invoke<string>('parseHTML', { htmlContent });
    const timetable = JSON.parse(jsonString) as CompactTimetable;
    console.log('Parsed timetable:', timetable);
    return timetable;
  } catch (error) {
    console.error('Error parsing HTML timetable:', error);
    throw error;
  }
}

export async function checkConflicts(
  user1Schedule: CompactTimetable,
  user2Schedule: CompactTimetable
): Promise<ConflictResult[]> {
  const user1Json = JSON.stringify(user1Schedule);
  const user2Json = JSON.stringify(user2Schedule);
  
  try {
    const conflicts = await invoke<ConflictResult[]>('check_conflicts', {
      user1ScheduleJson: user1Json,
      user2ScheduleJson: user2Json
    });
    
    return conflicts;
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return [];
  }
}