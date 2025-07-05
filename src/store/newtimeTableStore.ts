import { LazyStore } from "@tauri-apps/plugin-store";
import type { CompactSlot } from "../types/timeTable";
import {
  buildBitmap,
  buildKindmap,
  currentlyAt,
  getFreeStatusDirect,
} from "../utils/invokeFunctions";

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
  theme: string; // theme preference
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
      u, // username
      r, // registration number
      s, // semester
      h, // hobbies
      q, // quote
      t, // timestamp
      b, // bitmap for each day of the week
      k, // kindmap for each day of the week
      o, // original schedule
      theme: "dark",
      welcome: true, // set welcome flag to true
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
    //  check if a friend already exists
    const friends: personData[] = (await friendsStore.get("friends")) || [];
    const existingFriendIndex = friends.findIndex((f) => f.r === friend.r);

    // If exists, update instead of adding a new entry
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

    const person: personData = {
      ...friend,
      b,
      k,
    };

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
      throw new Error(`Friend not found`);
    }

    const b: Record<number, boolean[]> = {};
    const k: Record<number, boolean[]> = {};
    for (let day = 0; day < 7; day++) {
      b[day] = await buildBitmap(newData.o, day);
      k[day] = await buildKindmap(newData.o, day);
    }
    friendsData[friendIndex] = {
      ...newData,
      b,
      k,
    };

    await friendsStore.set("friends", friendsData);
    await friendsStore.save();
    return true;
  } catch (error) {
    console.error("Failed to change friend data:", error);
    return false;
  }
}

export interface FriendStatusData {
  username: string;
  available: boolean;
  location: string;
  time: string;
  until: string;
}

export async function getFreeTimeOfAllFriends(
  currentTime: string
): Promise<FriendStatusData[]> {
  try {
    const friendsData = (await friendsStore.get("friends")) as
      | personData[]
      | null;

    if (!friendsData || friendsData.length === 0) {
      return [];
    }

    const results: FriendStatusData[] = [];

    // Get current day (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    console.log(
      `Current day index: ${today} (${
        [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][today]
      })`
    );

    for (const friend of friendsData) {
      const name = friend.u;

      // Log available bitmap days for debugging
      console.log(`Friend ${name} has bitmap days:`, Object.keys(friend.b));

      // Use today's bitmap, with fallback to day 0 if not available
      const bitmap = friend.b[today] || friend.b[0];
      const kindmap = friend.k[today] || friend.k[0];

      try {
        console.log(
          `Friend ${name}, using day ${today}, bitmap:`,
          bitmap,
          "kindmap:",
          kindmap
        );
        const status = await getFreeStatusDirect({
          bitmap,
          currentTime,
          kindmap,
        });
        const location =
          (await currentlyAt(currentTime, friend.o, today)) || "";
        console.log(`Friend ${name} status:`, status);
        if (status.data) {
          results.push({
            username: name,
            available: !status.data.is_busy,
            location: location,
            time: status.data.from || "",
            until: status.data.until || "",
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
