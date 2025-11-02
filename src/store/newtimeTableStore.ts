import { LazyStore } from "@tauri-apps/plugin-store";
import type { CompactSlot } from "../types/timeTable";
import {
  buildBitmap,
  buildKindmap,
  currentlyAt,
  getFreeStatusDirect,
} from "../utils/invokeFunctions";
import { decompress } from "../utils/compressor";

export interface shareData {
  u: string; // username
  r: string; // registration number
  s: number; // semester
  h: string[]; // hobbies
  q: string[]; // quote
  t: string; // timestamp
  o: CompactSlot[];
}

export interface personData extends shareData {
  b: Record<number, boolean[]>; // bitmap for each day of the week
  k: Record<number, boolean[]>; // kindmap for each day of the week
}

export interface userData extends personData {
  theme: "dark" | "light"; // theme preference
  timeFormat?: 12 | 24; // time format preference
  welcome?: boolean; // welcome screen flag
}

export const friendsStore = new LazyStore("friends.json");
export const userStore = new LazyStore("user.json");

export async function initializeUserStore({ u, r, s, h, q, t, o }: shareData) {
  try {
    const b: Record<number, boolean[]> = {};
    const k: Record<number, boolean[]> = {};
    for (let day = 0; day < 7; day++) {
      b[day] = await buildBitmap(o, day);
      k[day] = await buildKindmap(o, day);
    }

    await userStore.set("userData", {
      u,
      r,
      s,
      h,
      q,
      t,
      b,
      k,
      o,
      theme: "dark",
      timeFormat: 12,
      welcome: true,
    });
    await userStore.save();

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize userStore:", error);
    return { success: false, error };
  }
}

export async function initializeFriendsStore() {
  try {
    await friendsStore.set("friends", []);
    await friendsStore.save();
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize friends store:", error);
    return { success: false, error };
  }
}

export async function getCurrentUserProfile(): Promise<userData | null> {
  try {
    const userData = (await userStore.get("userData")) as userData | null;
    if (!userData) {
      throw new Error("User data not found");
    }
    return userData;
  } catch (error) {
    console.error("Failed to get current user profile:", error);
    return null;
  }
}

export async function shareCurrentUserProfile(): Promise<shareData | null> {
  try {
    const userData = (await userStore.get("userData")) as userData | null;
    if (!userData) {
      throw new Error("User data not found");
    }
    const { u, r, s, h, q, t, o } = userData;
    return { u, r, s, h, q, t, o };
  } catch (error) {
    console.error("Failed to share current user profile:", error);
    return null;
  }
}

export async function addFriend(friend: shareData) {
  try {
    const friends: personData[] = (await friendsStore.get("friends")) || [];
    const existingFriendIndex = friends.findIndex((f) => f.r === friend.r);

    if (existingFriendIndex !== -1) {
      const updated = await changeFriendData(friend.r, friend);
      return { success: updated };
    }

    const b: Record<number, boolean[]> = {};
    const k: Record<number, boolean[]> = {};
    for (let day = 0; day < 7; day++) {
      b[day] = await buildBitmap(friend.o, day);
      k[day] = await buildKindmap(friend.o, day);
    }

    const person: personData = { ...friend, b, k };

    friends.push(person);
    await friendsStore.set("friends", friends);
    await friendsStore.save();
    return { success: true };
  } catch (error) {
    console.error("Failed to add friend:", error);
    return { success: false, error };
  }
}

export async function viewAllStores() {
  try {
    const userData = await userStore.get("userData");
    const friendsData = await friendsStore.get("friends");
    console.log("User Data:", userData);
    console.log("Friends Data:", friendsData);
  } catch (error) {
    console.error("Failed to view all stores:", error);
  }
}

export async function resetAllStores() {
  try {
    await userStore.set("userData", null);
    await userStore.save();
    await friendsStore.set("friends", []);
    await friendsStore.save();
    console.log("All stores have been reset.");
  } catch (error) {
    console.error("Failed to reset all stores:", error);
  }
}

// CORRECTED: Consistently uses 0-indexed 'day' parameter
export async function getUserBitmap(day: number): Promise<boolean[]> {
  try {
    const userData = (await userStore.get("userData")) as userData | null;
    if (!userData || !userData.b || !userData.b[day]) {
      throw new Error(`No bitmap found for day ${day}`);
    }
    return userData.b[day];
  } catch (error) {
    console.error("Failed to get user bitmap:", error);
    throw error;
  }
}

export async function getUserTimetable(): Promise<CompactSlot[]> {
  try {
    const userData = (await userStore.get("userData")) as userData | null;
    if (!userData || !userData.o) {
      throw new Error("No timetable found for the user");
    }
    return userData.o;
  } catch (error) {
    console.error("Failed to get user timetable:", error);
    throw error;
  }
}

// CORRECTED: Consistently uses 0-indexed 'day' parameter
export async function getFriendBitmap(
  username: string,
  day: number
): Promise<boolean[]> {
  try {
    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;
    if (!friendsData) {
      throw new Error("No friends data found");
    }
    const friend = friendsData.find((f) => f.u === username);
    if (!friend || !friend.b || !friend.b[day]) {
      throw new Error(`No bitmap found for friend ${username} on day ${day}`);
    }
    return friend.b[day];
  } catch (error) {
    console.error("Failed to get friend bitmap:", error);
    throw error;
  }
}

// CORRECTED: Consistently uses 0-indexed 'day' parameter
export async function getUserKindmap(day: number): Promise<boolean[]> {
  try {
    const userData = (await userStore.get("userData")) as userData | null;
    if (!userData || !userData.k || !userData.k[day]) {
      throw new Error(`No kindmap found for day ${day}`);
    }
    return userData.k[day];
  } catch (error) {
    console.error("Failed to get user kindmap:", error);
    throw error;
  }
}

export async function getFriendsData(): Promise<personData[]> {
  try {
    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;
    if (!friendsData) {
      throw new Error("No friends data found");
    }
    return friendsData;
  } catch (error) {
    console.error("Failed to get friends data:", error);
    return [];
  }
}

export async function changeFriendData(
  registrationNumber: string,
  newData: shareData
): Promise<boolean> {
  try {
    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;
    if (!friendsData) {
      throw new Error("No friends data found");
    }

    const friendIndex = friendsData.findIndex(
      (f) => f.r === registrationNumber
    );
    if (friendIndex === -1) {
      throw new Error(`Friend not found`);
    }

    const b: Record<number, boolean[]> = {};
    const k: Record<number, boolean[]> = {};
    for (let day = 0; day < 7; day++) {
      b[day] = await buildBitmap(newData.o, day);
      k[day] = await buildKindmap(newData.o, day);
    }
    friendsData[friendIndex] = { ...newData, b, k };

    await friendsStore.set("friends", friendsData);
    await friendsStore.save();
    return true;
  } catch (error) {
    console.error("Failed to change friend data:", error);
    return false;
  }
}

export async function validateAndAddFriend(accessCode: string) {
  let decompressedData = decompress(accessCode);
  if (typeof decompressedData === "string") {
    try {
      decompressedData = JSON.parse(decompressedData);
    } catch (e) {
      return {
        success: false,
        error: { message: "Invalid access code format" },
      };
    }
  }
  if (
    !decompressedData ||
    typeof decompressedData !== "object" ||
    !decompressedData.u ||
    !decompressedData.r ||
    typeof decompressedData.s !== "number" ||
    !Array.isArray(decompressedData.h) ||
    !Array.isArray(decompressedData.q) ||
    !decompressedData.t ||
    !Array.isArray(decompressedData.o)
  ) {
    return { success: false, error: { message: "Invalid access code format" } };
  }
  return await addFriend(decompressedData);
}

export interface FriendStatusData {
  username: string;
  available: boolean;
  location: string;
  time: string;
  until: string;
  isLunch?: boolean;
}

// CORRECTED: Accepts timeFormat as a parameter, does not use localStorage
function trimSeconds(
  timeStr: string | null | undefined,
  timeFormat: 12 | 24
): string {
  if (!timeStr || typeof timeStr !== "string") return "";

  const [hhStr, mmStr] = timeStr.split(":");
  if (!hhStr || !mmStr) return "";

  if (timeFormat === 12) {
    const hour = parseInt(hhStr, 10);
    const minute = mmStr.padStart(2, "0");
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Converts 0 to 12 for 12 AM
    return `${hour12}:${minute} ${suffix}`;
  }

  // default to 24-hour
  const hour = hhStr.padStart(2, "0");
  const minute = mmStr.padStart(2, "0");
  return `${hour}:${minute}`;
}

// CORRECTED: Fetches user's timeFormat and passes it to trimSeconds
export async function getFreeTimeOfAllFriends(
  currentTime: string
): Promise<FriendStatusData[]> {
  try {
    const currentUser = await getCurrentUserProfile();
    const timeFormat = currentUser?.timeFormat || 24; // Default to 24hr

    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;

    if (!friendsData || friendsData.length === 0) {
      return [];
    }

    const results: FriendStatusData[] = [];

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

    for (const friend of friendsData) {
      const name = friend.u;

      // The day index from getDay() will now correctly match the day index from Rust
      const bitmap = friend.b[today] || friend.b[0]; // Fallback to first day
      const kindmap = friend.k[today] || friend.k[0]; // Fallback to first day

      try {
        const status = await getFreeStatusDirect({
          bitmap,
          currentTime,
          kindmap,
        });

        const location =
          (await currentlyAt(currentTime, friend.o, today)) || "";

        if (status.data) {
          results.push({
            username: name,
            available: !status.data.is_busy,
            location: location,
            time: trimSeconds(status.data.from, timeFormat) || "",
            until: trimSeconds(status.data.until, timeFormat) || "",
            isLunch: status.data.is_lunch || false,
          });
        }
      } catch (error) {
        console.error(`Error getting status for friend ${name}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to get free time of all friends:", error);
    return [];
  }
}
