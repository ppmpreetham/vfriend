// Import Tauri API
import { invoke } from "@tauri-apps/api/core";
import { CompactTimetable } from "../types/timeTable";

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