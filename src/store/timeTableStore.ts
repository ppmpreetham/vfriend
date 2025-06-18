import { LazyStore } from "@tauri-apps/plugin-store";
import {
  checkConflicts,

} from "../utils/timetableHelper";
import {
  buildBitmap, buildKindmap
} from "../utils/timetableBitmap";

import type { CompactTimetable } from "../types/timeTable";
import type { ConflictResult, FreeTimeResult } from "../types/timeTable";

// Create stores
const timetableStore = new LazyStore("timetables.json");
const metadataStore = new LazyStore("timetable_metadata.json");

export interface AppMetadata {
  currentUser: string;
  friendsList: string[];
  profiles: Record<string, UserProfile>;
  
  // Per-day bitmaps for current user (days 1-7)
  userBitmap?: {
    data: Record<number, boolean[]>;  // day number -> bitmap array
    kinds: Record<number, boolean[]>; // day number -> kind bitmap
    lastUpdated: string;
  };
  
  // Per-day bitmaps for friends
  friendBitmaps: Record<string, {
    clashMap: Record<number, boolean[]>;  // day number -> clash bitmap
    freeMap: Record<number, boolean[]>;   // day number -> free bitmap
    kindMap: Record<number, boolean[]>; // day number -> kind bitmap
    lastUpdated: string;
  }>;
}

// Initialize stores with the new structured format
export async function initializeStores() {
  // Check if metadata exists in the old format
  const hasLegacyData = await metadataStore.has("currentUser");

  if (hasLegacyData) {
    // Migrate from old format to new format
    const currentUser = (await metadataStore.get("currentUser")) as string;
    const friendsList = (await metadataStore.get("friendsList")) as string[];

    // Initialize profiles object
    const profiles: Record<string, UserProfile> = {};

    // Migrate any existing profiles
    for (const key of await metadataStore.keys()) {
      if (key.startsWith("profile_")) {
        const username = key.replace("profile_", "");
        const profile = (await metadataStore.get(key)) as UserProfile;
        profiles[username] = profile;
      }
    }

    // Set the new structured metadata
    await metadataStore.set("metadata", {
      currentUser,
      friendsList,
      profiles,
    });

    // Clean up old format keys
    await metadataStore.delete("currentUser");
    await metadataStore.delete("friendsList");
    for (const key of await metadataStore.keys()) {
      if (key.startsWith("profile_")) {
        await metadataStore.delete(key);
      }
    }

    await metadataStore.save();
  } else if (!(await metadataStore.has("metadata"))) {
    // If no data exists at all, initialize with empty structure
    await metadataStore.set("metadata", {
      currentUser: "",
      friendsList: [],
      profiles: {},
    });
    await metadataStore.save();
  }
}

// Get/set current user
export async function getCurrentUser(): Promise<string> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  return metadata.currentUser || "";
}

export async function setCurrentUser(username: string): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  metadata.currentUser = username;
  await metadataStore.set("metadata", metadata);
  await metadataStore.save();
}

// Get friends list
export async function getFriendsList(): Promise<string[]> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  return metadata.friendsList || [];
}

// Add/remove friend
export async function addFriend(username: string): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  if (!metadata.friendsList.includes(username)) {
    metadata.friendsList.push(username);
    await metadataStore.set("metadata", metadata);
    await metadataStore.save();
  }
}

export async function removeFriend(username: string): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  metadata.friendsList = metadata.friendsList.filter((f) => f !== username);
  await metadataStore.set("metadata", metadata);
  await metadataStore.save();
}

// Save a timetable
export async function saveTimetable(
  timetable: CompactTimetable
): Promise<void> {
  console.log("saveTimetable called with:", timetable);

  // Get current user (this will be the storage key)
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("No current user set. Cannot save timetable.");
  }

  // Save using current user as key, but preserve original username in data
  await timetableStore.set(currentUser, timetable);
  await timetableStore.save();
  
  // Add this to update bitmaps
  await updateUserBitmap();
  await updateAllFriendBitmaps();
}

// New helper functions
async function updateUserBitmap(): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  if (!metadata.friendBitmaps) metadata.friendBitmaps = {};
  
  const currentUser = metadata.currentUser;
  const timetable = await getTimetable(currentUser);
  if (!timetable) return;
  
  // Group slots by day
  const slotsByDay: Record<number, boolean[]> = {};
  const kindsByDay: Record<number, boolean[]> = {};  // Add this for kindmap
  
  for (let day = 1; day <= 7; day++) {
    // Filter slots for this day
    const daySlots = timetable.o.filter(slot => slot.d === day);
    
    // Create bitmap and kindmap for this day
    slotsByDay[day] = await buildBitmap(daySlots, day);
    kindsByDay[day] = await buildKindmap(daySlots, day);
  }
  
  // Update user bitmap with day-specific data
  metadata.userBitmap = {
    data: slotsByDay,
    kinds: kindsByDay,
    lastUpdated: new Date().toISOString()
  };
  
  await metadataStore.set("metadata", metadata);
  await metadataStore.save();
}

async function updateAllFriendBitmaps(): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  if (!metadata.friendBitmaps) metadata.friendBitmaps = {};
  
  const currentUser = metadata.currentUser;
  const userTimetable = await getTimetable(currentUser);
  if (!userTimetable) return;
  
  const friendsList = metadata.friendsList || [];
  
  for (const friendId of friendsList) {
    const friendTimetable = await getTimetable(friendId);
    if (!friendTimetable) continue;
    
    const clashMapByDay: Record<number, boolean[]> = {};
    const freeMapByDay: Record<number, boolean[]> = {};
    const kindMapByDay: Record<number, boolean[]> = {};  // Add this for kindmap
    
    for (let day = 1; day <= 7; day++) {
      // Get user and friend slots for this day
      const userDaySlots = userTimetable.o.filter(slot => slot.d === day);
      const friendDaySlots = friendTimetable.o.filter(slot => slot.d === day);
      
      kindMapByDay[day] = await buildKindmap(friendDaySlots, day);
    }
    
    // Update friend bitmaps with day-specific data
    metadata.friendBitmaps = metadata.friendBitmaps || {};
    metadata.friendBitmaps[friendId] = {
      clashMap: clashMapByDay,
      freeMap: freeMapByDay,
      kindMap: kindMapByDay,
      lastUpdated: new Date().toISOString()
    };
  }
  
  await metadataStore.set("metadata", metadata);
  await metadataStore.save();
}

// Get a timetable by username
export async function getTimetable(
  username: string
): Promise<CompactTimetable | null> {
  try {
    const timetable = (await timetableStore.get(username)) as CompactTimetable;
    return timetable || null;
  } catch (error) {
    console.error(`Error retrieving timetable for ${username}:`, error);
    return null;
  }
}

// Get all timetables
export async function getAllTimetables(): Promise<
  [string, CompactTimetable][]
> {
  try {
    const entries = await timetableStore.entries();
    return entries as [string, CompactTimetable][];
  } catch (error) {
    console.error("Error retrieving all timetables:", error);
    return [];
  }
}

// Get current user's timetable
export async function getCurrentUserTimetable(): Promise<CompactTimetable | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    console.log("No current user set");
    return null;
  }

  // Use current user as the storage key
  const timetable = await getTimetable(currentUser);

  console.log("=== getCurrentUserTimetable Debug ===");
  console.log("Current user (storage key):", currentUser);
  console.log("Retrieved timetable:", timetable);
  console.log("Timetable username (if found):", timetable?.u);
  console.log("====================================");

  return timetable;
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
// This function now works with storage keys (simplified usernames)
export async function checkConflictsByUsername(
  storageKey1: string,
  storageKey2: string
): Promise<ConflictResult[]> {
  const timetable1 = await getTimetable(storageKey1);
  const timetable2 = await getTimetable(storageKey2);

  if (!timetable1 || !timetable2) {
    throw new Error("One or both timetables not found");
  }

  return checkConflicts(timetable1, timetable2);
}

// view the store contents for debugging
export async function viewStoreContents(): Promise<void> {
  const timetables = await timetableStore.entries();
  const metadata = await metadataStore.entries();

  console.log("Timetables:", timetables);
  console.log("Metadata:", metadata);
}

export async function resetAllStores(): Promise<void> {
  await metadataStore.set("metadata", {
    currentUser: "",
    friendsList: [],
    profiles: {},
  });
  await metadataStore.clear();
  await timetableStore.clear();
  await metadataStore.save();
  await timetableStore.save();
}

// Add these type definitions after the imports
export interface UserProfile {
  username: string;
  hobbies: string[];
  tagline: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
  semester: number | undefined;
}

// Add these new functions after the existing store functions

// Get/set user profile
export async function getUserProfile(
  username: string
): Promise<UserProfile | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  return metadata.profiles[username] || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  metadata.profiles[profile.username] = profile;
  await metadataStore.set("metadata", metadata);
  await metadataStore.save();
}

// Get current user's profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;
  return getUserProfile(currentUser);
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding(): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;

  const profile = await getUserProfile(currentUser);
  return profile?.hasCompletedOnboarding || false;
}

// Mark onboarding as complete
export async function markOnboardingComplete(username: string): Promise<void> {
  const profile = await getUserProfile(username);
  if (profile) {
    profile.hasCompletedOnboarding = true;
    await saveUserProfile(profile);
  }
}

// Initialize user profile
export async function initializeUserProfile(
  username: string,
  hobbies: string[],
  tagline: string,
  semester?: number
): Promise<void> {
  const profile: UserProfile = {
    username,
    hobbies,
    tagline,
    createdAt: new Date().toISOString(),
    hasCompletedOnboarding: false,
    semester,
  };

  await saveUserProfile(profile);
}


export async function getClashBitmap(friendId: string, day: number): Promise<boolean[] | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  return metadata.friendBitmaps?.[friendId]?.clashMap?.[day] || null;
}

export async function getFreeBitmap(friendId: string, day: number): Promise<boolean[] | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  return metadata.friendBitmaps?.[friendId]?.freeMap?.[day] || null;
}

export async function getUserBitmap(day: number): Promise<boolean[] | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  console.log(metadata.userBitmap?.data?.[day])
  return metadata.userBitmap?.data?.[day] || null;
}

// Add a new getter function for kindmaps
export async function getUserKindmap(day: number): Promise<boolean[] | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  
  if (!metadata.userBitmap?.kinds || !metadata.userBitmap.kinds[day]) {
    return null;
  }
  
  return metadata.userBitmap.kinds[day];
}

export async function getFriendKindmap(friendId: string, day: number): Promise<boolean[] | null> {
  const metadata = (await metadataStore.get("metadata")) as AppMetadata;
  
  if (!metadata.friendBitmaps?.[friendId]?.kindMap || !metadata.friendBitmaps[friendId].kindMap[day]) {
    return null;
  }
  
  return metadata.friendBitmaps[friendId].kindMap[day];
}