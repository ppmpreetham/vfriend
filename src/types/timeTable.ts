export interface CompactTimetable {
  u: string;
  t: string;
  o: CompactSlot[];
}

export interface CompactSlot {
  d: number;
  s: string;
  p: number;
  f: string;
}

export interface ConflictResult {
  day: number;
  user1_class: string;
  user1_time: string;
  user2_class: string;
  user2_time: string;
}

export interface FreeTimeResult {
  day: number;
  start_time: string;
  end_time: string;
}