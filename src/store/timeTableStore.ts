import { LazyStore } from "@tauri-apps/plugin-store";
import {
  checkConflicts,
  findCommonFreeTimes,
  isUserFreeAt,
} from "../utils/timetableHelper";

import type { CompactTimetable } from "../types/timeTable";
import type { ConflictResult, FreeTimeResult } from "../types/timeTable";

// Create stores
const timetableStore = new LazyStore("timetables.json");
const metadataStore = new LazyStore("timetable_metadata.json");

// Initialize stores
export async function initializeStores() {
  // Initialize metadata store with default values if needed
  if (!(await metadataStore.has("currentUser"))) {
    await metadataStore.set("currentUser", "");
    await metadataStore.set("friendsList", []);
    await metadataStore.save();
  }
}

// Get/set current user
export async function getCurrentUser(): Promise<string> {
  return ((await metadataStore.get("currentUser")) as string) || "";
}

export async function setCurrentUser(username: string): Promise<void> {
  await metadataStore.set("currentUser", username);
  await metadataStore.save();
}

// Get friends list
export async function getFriendsList(): Promise<string[]> {
  return ((await metadataStore.get("friendsList")) as string[]) || [];
}

// Add/remove friend
export async function addFriend(username: string): Promise<void> {
  const friends = await getFriendsList();
  if (!friends.includes(username)) {
    friends.push(username);
    await metadataStore.set("friendsList", friends);
    await metadataStore.save();
  }
}

export async function removeFriend(username: string): Promise<void> {
  const friends = await getFriendsList();
  const updatedFriends = friends.filter((f) => f !== username);
  await metadataStore.set("friendsList", updatedFriends);
  await metadataStore.save();
}

// Save a timetable
export async function saveTimetable(
  timetable: CompactTimetable
): Promise<void> {
  await timetableStore.set(timetable.u, timetable);
  await timetableStore.save();
}

// Get a timetable by username
export async function getTimetable(
  username: string
): Promise<CompactTimetable | null> {
  const timetable = (await timetableStore.get(username)) as CompactTimetable;
  return timetable || null;
}

// Get current user's timetable
export async function getCurrentUserTimetable(): Promise<CompactTimetable | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  return getTimetable(currentUser);
}

// Delete a timetable
export async function deleteTimetable(username: string): Promise<void> {
  // Remove from timetable store
  await timetableStore.delete(username);
  await timetableStore.save();

  // Remove from friends list if present
  const friendsList = await getFriendsList();
  const updatedFriendsList = friendsList.filter((f) => f !== username);
  await metadataStore.set("friendsList", updatedFriendsList);
  await metadataStore.save();
}

// Import timetable from JSON
export async function importTimetable(jsonString: string): Promise<void> {
  try {
    const timetable = JSON.parse(jsonString) as CompactTimetable;

    // Basic validation
    if (!timetable.u || !timetable.t || !Array.isArray(timetable.o)) {
      throw new Error("Invalid timetable format");
    }

    await saveTimetable(timetable);
  } catch (error) {
    console.error("Failed to import timetable:", error);
    throw error;
  }
}

// Export timetable to JSON
export async function exportTimetable(username: string): Promise<string> {
  const timetable = await getTimetable(username);

  if (!timetable) {
    throw new Error(`Timetable not found for ${username}`);
  }

  return JSON.stringify(timetable, null, 2);
}

//=========================================================================//
//=== Username-based convenience wrappers for timetableHelper functions ===//
//=========================================================================//

// Check conflicts between two timetables by username
export async function checkConflictsByUsername(
  username1: string,
  username2: string
): Promise<ConflictResult[]> {
  const timetable1 = await getTimetable(username1);
  const timetable2 = await getTimetable(username2);

  if (!timetable1 || !timetable2) {
    throw new Error("One or both timetables not found");
  }

  return checkConflicts(timetable1, timetable2);
}

// Find common free times for multiple users by username
export async function findCommonFreeTimesByUsername(
  usernames: string[]
): Promise<FreeTimeResult[]> {
  const timetables = await Promise.all(
    usernames.map(async (username) => {
      const timetable = await getTimetable(username);
      if (!timetable) {
        throw new Error(`Timetable not found for ${username}`);
      }
      return timetable;
    })
  );

  return findCommonFreeTimes(timetables);
}

// Check if user is free at specific time by username
export async function isUserFreeAtByUsername(
  username: string,
  day: number,
  time: string
): Promise<boolean> {
  const timetable = await getTimetable(username);

  if (!timetable) {
    throw new Error(`Timetable not found for ${username}`);
  }

  return isUserFreeAt(timetable, day, time);
}

// Advanced: Find free times across all friends
export async function findFriendsFreeTime(): Promise<FreeTimeResult[]> {
  const currentUser = await getCurrentUser();
  const friends = await getFriendsList();

  // Include current user and all friends
  const allUsers = [currentUser, ...friends].filter(Boolean);

  return findCommonFreeTimesByUsername(allUsers);
}

// view the store contents for debugging
export async function viewStoreContents(): Promise<void> {
  const timetables = await timetableStore.entries();
  const metadata = await metadataStore.entries();

  console.log("Timetables:", timetables);
  console.log("Metadata:", metadata);
}
