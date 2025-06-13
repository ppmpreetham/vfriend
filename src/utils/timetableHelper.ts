// Import Tauri API
import { invoke } from "@tauri-apps/api/core";

// Type definitions
interface CompactTimetable {
  u: string;
  t: string;
  o: CompactSlot[];
}

interface CompactSlot {
  d: number;
  s: string;
  p: number;
  f: string;
}

interface ConflictResult {
  day: number;
  user1_class: string;
  user1_time: string;
  user2_class: string;
  user2_time: string;
}

interface FreeTimeResult {
  day: number;
  start_time: string;
  end_time: string;
}

export async function checkConflicts(
  user1Schedule: CompactTimetable,
  user2Schedule: CompactTimetable
): Promise<ConflictResult[]> {
  const user1Json = JSON.stringify(user1Schedule);
  const user2Json = JSON.stringify(user2Schedule);
  
  console.log('Sending to Rust:', {
    user1ScheduleJson: user1Json,
    user2ScheduleJson: user2Json
  });
  
  try {
    const conflicts = await invoke<ConflictResult[]>('check_conflicts', {
      user1ScheduleJson: user1Json,
      user2ScheduleJson: user2Json
    });
    
    console.log('Received conflicts:', conflicts);
    return conflicts;
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return [];
  }
}

export async function checkConflictsDebug(
  user1Schedule: CompactTimetable,
  user2Schedule: CompactTimetable
): Promise<{conflicts: ConflictResult[], debug_info: string}> {
  const user1Json = JSON.stringify(user1Schedule);
  const user2Json = JSON.stringify(user2Schedule);
  
  try {
    const result = await invoke<{conflicts: ConflictResult[], debug_info: string}>('check_conflicts_debug', {
      user1ScheduleJson: user1Json,
      user2ScheduleJson: user2Json
    });
    
    console.log('Debug info:', result.debug_info);
    return result;
  } catch (error) {
    console.error('Error checking conflicts with debug:', error);
    return {conflicts: [], debug_info: `Error: ${error}`};
  }
}

export async function findCommonFreeTimes(
  friendsSchedules: CompactTimetable[]
): Promise<FreeTimeResult[]> {
  const schedulesJson = JSON.stringify(friendsSchedules);
  
  console.log('Sending schedules to Rust:', schedulesJson);
  
  try {
    const freeTimes = await invoke<FreeTimeResult[]>('find_free_times', {
      schedulesJson: schedulesJson
    });
    
    console.log('Received free times:', freeTimes);
    return freeTimes;
  } catch (error) {
    console.error('Error finding common free times:', error);
    return [];
  }
}

export async function isUserFreeAt(
  schedule: CompactTimetable,
  day: number,
  time: string
): Promise<boolean> {
  const scheduleJson = JSON.stringify(schedule);
  
  console.log('Checking if user is free:', { scheduleJson, day, time });
  
  try {
    const isFree = await invoke<boolean>('is_free_at', {
      scheduleJson: scheduleJson,
      day,
      time
    });
    
    console.log('User free result:', isFree);
    return isFree;
  } catch (error) {
    console.error('Error checking if user is free:', error);
    return false;
  }
}