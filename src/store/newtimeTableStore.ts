import { LazyStore } from "@tauri-apps/plugin-store";
import type { CompactSlot } from "../types/timeTable";
import type { TimetableStatus } from "../utils/invokeFunctions";
import {
  buildBitmap,
  buildKindmap,
  getTimetableStatusDirect,
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
  showGapsAsFree?: boolean; // show 5/10 minute class gaps as free time
  welcome?: boolean; // welcome screen flag
}

export interface FriendStatusData {
  username: string;
  available: boolean;
  status: TimetableStatus;
}

export const friendsStore = new LazyStore("friends.json");
export const userStore = new LazyStore("user.json");

const timetableDays = [1, 2, 3, 4, 5, 6, 7] as const;

async function buildDayMaps(schedule: CompactSlot[]) {
  const entries = await Promise.all(
    timetableDays.map(async (day) => {
      const [bitmap, kindmap] = await Promise.all([
        buildBitmap(schedule, day),
        buildKindmap(schedule, day),
      ]);
      return [day, bitmap, kindmap] as const;
    })
  );

  const b: Record<number, boolean[]> = {};
  const k: Record<number, boolean[]> = {};

  for (const [day, bitmap, kindmap] of entries) {
    b[day] = bitmap;
    k[day] = kindmap;
  }

  return { b, k };
}

function todayForRust(): number {
  return new Date().getDay() || 7;
}

export async function initializeUserStore({ u, r, s, h, q, t, o }: shareData) {
  try {
    const { b, k } = await buildDayMaps(o);

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
      showGapsAsFree: false,
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
    return { ...userData, showGapsAsFree: userData.showGapsAsFree ?? false };
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

    const { b, k } = await buildDayMaps(friend.o);
    friends.push({ ...friend, b, k });
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

export async function updateUserPreferences(
  updates: Partial<Pick<userData, "theme" | "timeFormat" | "showGapsAsFree">>
): Promise<boolean> {
  try {
    const currentUser = (await userStore.get("userData")) as userData | null;
    if (!currentUser) return false;

    await userStore.set("userData", { ...currentUser, ...updates });
    await userStore.save();
    return true;
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return false;
  }
}

// Timetable parser uses 1=Monday through 7=Sunday.
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
      throw new Error("Friend not found");
    }

    const { b, k } = await buildDayMaps(newData.o);
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

export async function getFreeTimeOfAllFriends(
  currentTime: string
): Promise<FriendStatusData[]> {
  try {
    const currentUser = await getCurrentUserProfile();
    const showGapsAsFree = currentUser?.showGapsAsFree ?? false;
    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;

    if (!friendsData || friendsData.length === 0) {
      return [];
    }

    const day = todayForRust();
    const results = await Promise.all(
      friendsData.map(async (friend): Promise<FriendStatusData | null> => {
        try {
          const status = await getTimetableStatusDirect({
            schedule: friend.o || [],
            day,
            currentTime,
            showGapsAsFree,
          });

          return {
            username: friend.u,
            available: !status.is_busy,
            status,
          };
        } catch (error) {
          console.error(`Error getting status for friend ${friend.u}:`, error);
          return null;
        }
      })
    );

    return results.filter((result): result is FriendStatusData => Boolean(result));
  } catch (error) {
    console.error("Failed to get free time of all friends:", error);
    return [];
  }
}