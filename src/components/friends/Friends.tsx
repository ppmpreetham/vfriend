import { useState, useRef, useEffect } from "react";
import FriendCardFriend from "./FriendCardFriend";
import FriendPage from "./FriendPage";
import AddFriend from "./addFriend";
import { getFriendsData } from "../../store/newtimeTableStore";
import { useFriendStore } from "../../store/friendStore";
import useAddFriendStore from "../../store/useAddFriendStore";
import { UserPlus, Search, ChevronLeft, X } from "lucide-react";

interface Friend {
  name: string;
  registrationNumber: string;
}

const Friends = () => {
  const isViewingFriend = useFriendStore((state) => state.isViewingFriend);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const { friendAdded, setFriendAdded } = useAddFriendStore();

  // UI control functions BEFORE conditional rendering
  const filteredFriends = friends.filter((friend) => {
    if (searchQuery === "") return true;

    return (
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.registrationNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery("");
    }
  };

  const toggleAddFriendModal = () => {
    setShowAddFriendModal(!showAddFriendModal);
  };

  // Extract loadFriendsData to a reusable function
  const loadFriendsData = async () => {
    try {
      setLoading(true);
      const friendsData = await getFriendsData();

      const mappedFriends: Friend[] = friendsData.map((friend) => ({
        name: friend.u,
        registrationNumber: friend.r,
      }));

      setFriends(mappedFriends);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load of friends data
  useEffect(() => {
    loadFriendsData();
  }, []);

  useEffect(() => {
    if (friendAdded) {
      loadFriendsData();
      setFriendAdded(false);
      setShowAddFriendModal(false); // check this
    }
  }, [friendAdded, setFriendAdded]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowAddFriendModal(false);
      }
    };

    if (showAddFriendModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showAddFriendModal]);

  // conditional rendering
  if (isViewingFriend) {
    return <FriendPage />;
  }

  return (
    <div className="w-screen h-full">
      {/* Modal Overlay */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-background rounded-lg w-11/12 max-w-md p-4 relative"
          >
            <button
              className="absolute top-2 right-2"
              onClick={toggleAddFriendModal}
            >
              <X size={24} />
            </button>
            <div className="h-full w-full px-4">
              <AddFriend />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row mx-4 gap-2 mb-4">
        {!isSearchMode ? (
          <>
            <div
              className="flex items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer"
              onClick={toggleSearchMode}
            >
              Search
              <div className="py-2 rounded-full cursor-pointer">
                <Search color="black" />
              </div>
            </div>
            <div
              className="flex items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer"
              onClick={toggleAddFriendModal}
            >
              Add Friends
              <div className="py-2 rounded-full cursor-pointer">
                <UserPlus color="black" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between rounded-full bg-primary text-black w-full p-2">
            <div className="p-2 cursor-pointer" onClick={toggleSearchMode}>
              <ChevronLeft color="black" />
            </div>
            <input
              type="text"
              placeholder="Search friends..."
              className="bg-transparent outline-none flex-grow px-2 text-black placeholder:text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="p-2">
              <Search color="black" />
            </div>
          </div>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100vh-100px)] px-4">
        {loading ? (
          <div className="text-center p-4">Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No friends added yet. Add your first friend!
          </div>
        ) : (
          <>
            {filteredFriends.map((friend, index) => (
              <FriendCardFriend
                key={index}
                name={friend.name}
                registrationNumber={friend.registrationNumber}
              />
            ))}

            {filteredFriends.length === 0 && searchQuery !== "" && (
              <div className="text-center p-4 text-gray-500">
                {friends.length === 0
                  ? "No friends added yet."
                  : "No friends match your search."}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;
