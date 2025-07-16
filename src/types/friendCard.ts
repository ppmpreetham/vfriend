export interface FriendCardProps {
  name: string;
  available: boolean;
  location: string;
  time: string;
  distance?: string;
  until?: string;
  isLunch: boolean;
}

export interface FriendPageFriend {
  name: string;
  registrationNumber: string;
}
