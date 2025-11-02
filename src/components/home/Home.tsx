import FriendCardHome from "./newfriendCardHome"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { getFreeTimeOfAllFriends, getFriendsData } from "../../store/newtimeTableStore"
import type { FriendStatusData } from "../../store/newtimeTableStore"
import { nextFreeTimeDirect, currentlyAt } from "../../utils/invokeFunctions"
import PersonPage from "./PersonPage"

const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [friends, setFriends] = useState<FriendStatusData[]>([])
  const [nextLocations, setNextLocations] = useState<{ [key: string]: string }>({})
  const [nextTimes, setNextTimes] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const now = new Date()
        const formattedTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

        const friendsData = await getFreeTimeOfAllFriends(formattedTime)
        setFriends(friendsData)

        // Get next locations and times
        const nextLocMap: { [key: string]: string } = {}
        const nextTimeMap: { [key: string]: string } = {}

        // Get all friends data to access their bitmaps and kindmaps
        const friendsFullData = await getFriendsData()
        const today = new Date().getDay()

        for (const friend of friendsData) {
          const fullData = friendsFullData.find((f) => f.u === friend.username)
          if (fullData && fullData.b && fullData.k) {
            const bitmap = fullData.b[today] || fullData.b[0]
            const kindmap = fullData.k[today] || fullData.k[0]

            try {
              // Get next free time
              const nextFreeTimeResult = await nextFreeTimeDirect({
                bitmap,
                currentTime: formattedTime,
                kindmap,
              })

              // Format the time for display
              nextTimeMap[friend.username] = formatTime(nextFreeTimeResult)

              // Get next location using the next free time
              if (nextFreeTimeResult) {
                // First, try treating it as an end time if it matches the until time
                const isEndTime = nextFreeTimeResult !== "YOU ARE FREE" && friend.until === nextFreeTimeResult

                let nextLoc = await currentlyAt(nextFreeTimeResult, fullData.o, today, isEndTime)

                // If that didn't work, try with both approaches
                if (!nextLoc || nextLoc === "Unknown") {
                  // Try the opposite approach
                  nextLoc = await currentlyAt(nextFreeTimeResult, fullData.o, today, !isEndTime)

                  // If still unknown and we have a specific time, try to find the closest slot
                  if ((!nextLoc || nextLoc === "Unknown") && nextFreeTimeResult.includes(":")) {
                    // Add debugging to see what's happening
                    console.log(`Friend: ${friend.username}, Time: ${nextFreeTimeResult}, End: ${isEndTime}`)

                    // Try using a time slightly after or before
                    const [hours, minutes] = nextFreeTimeResult.split(":").map(Number)

                    // Try 5 minutes after
                    const timeAfter = `${hours.toString().padStart(2, "0")}:${(minutes + 5).toString().padStart(2, "0")}`
                    nextLoc = await currentlyAt(timeAfter, fullData.o, today, false)

                    // If still unknown, try 5 minutes before
                    if (!nextLoc || nextLoc === "Unknown") {
                      const timeBefore = `${hours.toString().padStart(2, "0")}:${Math.max(0, minutes - 5)
                        .toString()
                        .padStart(2, "0")}`
                      nextLoc = await currentlyAt(timeBefore, fullData.o, today, false)
                    }

                    // Last resort: check each period in their schedule
                    if (!nextLoc || nextLoc === "Unknown") {
                      // Look directly at their timetable slots
                      for (const slot of fullData.o) {
                        if (slot.d === today) {
                          // Extract location from slot.f (assuming format like "CODE-LOCATION")
                          if (slot.f.includes("-")) {
                            // const location = slot.f.split("-").slice(1).join("-");
                            console.log(slot.f)
                            const location = slot.f
                            nextLoc = location
                            break
                          }
                        }
                      }
                    }
                  }
                }

                if (nextLoc) {
                  // Extract location from the full course string (if needed)
                  if (nextLoc.includes("-")) {
                    nextLoc = nextLoc.split("-").slice(1).join("-")
                  }

                  nextLocMap[friend.username] = nextLoc
                } else {
                  nextLocMap[friend.username] = friend.available ? friend.location || "Campus" : "Moving"
                }
              } else {
                // If there's no next free time, use their current location
                nextLocMap[friend.username] = friend.location || "—"
              }
            } catch (error) {
              console.error(`Error calculating next free time for ${friend.username}:`, error)
              nextTimeMap[friend.username] = "—"
              nextLocMap[friend.username] = "—"
            }
          }
        }

        setNextLocations(nextLocMap)
        setNextTimes(nextTimeMap)
      } catch (error) {
        console.error("Failed to load friends data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFriends()
  }, [])

  // Helper function to format time
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return "—"

    const parts = timeString.split(":")
    if (parts.length < 2) return "—"

    const hour = parseInt(parts[0], 10)
    if (isNaN(hour)) return "RIGHT NOW"

    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    const minutes = parts[1].padStart(2, "0")

    return `${hour12}:${minutes} ${ampm}`
  }

  const filteredFriends = friends
    .filter((friend) => {
      if (showOnlyAvailable && !friend.available) {
        return false
      }

      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase()
        return friend.username.toLowerCase().includes(searchLower) || friend.location.toLowerCase().includes(searchLower)
      }

      return true
    })
    .sort((a, b) => a.username.localeCompare(b.username))

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="p-4 pt-1 flex flex-col gap-4">
        {/* <PersonPage /> */}
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 ps-10 text-sm rounded-lg bg-background3 border border-gray-700 placeholder-gray-400 text-foreground focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search friends by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-foreground">Show Available Only</span>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={showOnlyAvailable} onChange={() => setShowOnlyAvailable(!showOnlyAvailable)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </div>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 my-8">Loading friends...</div>
      ) : filteredFriends.length > 0 ? (
        filteredFriends.map((friend, index) => (
          <FriendCardHome
            key={index}
            name={friend.username}
            available={friend.available}
            location={friend.location}
            time={friend.time}
            until={friend.until}
            isLunch={friend.isLunch || false}
            nextLocation={nextLocations[friend.username] || "—"}
            nextTime={nextTimes[friend.username] || "—"}
          />
        ))
      ) : (
        <div className="text-center text-gray-400 my-8">{friends.length === 0 ? "Add Friends to get Started" : "No friends match your search criteria"}</div>
      )}
    </div>
  )
}

export default Home
