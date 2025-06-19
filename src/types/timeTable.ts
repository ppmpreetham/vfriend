export interface CompactTimetable {
  u: string;   // username
  r: string;   // registration number
  s: number;   // semester
  t: string;   // timestamp
  o: CompactSlot[];
}

export interface CompactSlot {
  d: number;
  s: string;
  p: number;
  f: string;
}

export interface FreeTimeResult {
  day: number;
  start_time: string;
  end_time: string;
}