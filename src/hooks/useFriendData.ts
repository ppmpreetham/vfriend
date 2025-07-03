import { useEffect, useState } from "react";
import { getFriendsData, personData } from "../store/newtimeTableStore";

interface UseFriendDataReturn {
  data: personData[] | null;
  selectedFriend: personData | null;
  isLoading: boolean;
  error: Error | null;
  getFriendByRegistrationNumber: (regNumber: string) => personData | null;
}

export const useFriendData = (
  selectedRegistrationNumber?: string
): UseFriendDataReturn => {
  const [friends, setFriends] = useState<personData[] | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<personData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getFriendsData();
        setFriends(data);

        if (selectedRegistrationNumber) {
          const friend = data.find((f) => f.r === selectedRegistrationNumber);
          setSelectedFriend(friend || null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedRegistrationNumber]);

  const getFriendByRegistrationNumber = (
    regNumber: string
  ): personData | null => {
    if (!friends) return null;
    return friends.find((friend) => friend.r === regNumber) || null;
  };

  return {
    data: friends,
    selectedFriend,
    isLoading,
    error,
    getFriendByRegistrationNumber,
  };
};
