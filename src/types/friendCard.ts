import type { TimetableStatus } from "../utils/invokeFunctions";

export interface FriendCardProps {
  name: string;
  available: boolean;
  status: TimetableStatus;
  distance?: string;
  timeFormat?: 12 | 24;
}

export interface FriendPageFriend {
  name: string;
  registrationNumber: string;
}