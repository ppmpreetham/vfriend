import { useEffect, useState, useRef } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import type { shareData } from "../../store/newtimeTableStore"
import { addFriend } from "../../store/newtimeTableStore"
import { useShareUserProfile } from "../../hooks/useShareUserProfile"
import useAddFriendStore from "../../store/useAddFriendStore"

// Types matching Rust structs
interface DiscoveredPeer {
  endpoint_id: string
  name: string
  timestamp: number
}

interface IncomingRequest {
  from: string
  name: string
  remote_id: string
}

// MODIFIED: This type now correctly matches the Rust #[serde(tag = "type")]
// This was a critical bug in your last version.
type FriendEvent =
  | { type: "PeerDiscovered"; peer: DiscoveredPeer }
  | { type: "IncomingRequest"; request: IncomingRequest }
  | { type: "RequestAccepted"; share_data: shareData }
  | { type: "RequestRejected"; reason: string }
  | { type: "DataReceived"; share_data: shareData }
  | { type: "Error"; message: string }

const Request = ({ request, onAccept, onReject }: { request: IncomingRequest; onAccept: () => void; onReject: () => void }) => {
  return (
    <div className="w-full h-fit p-4 border-primary border rounded-2xl">
      <div className="text-2xl mb-4">{request.name} sent you a friend request</div>
      <div className="text-sm text-gray-400 mb-4">Registration: {request.from}</div>
      <div className="flex gap-2">
        <button onClick={onAccept} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
          Accept
        </button>
        <button onClick={onReject} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
          Reject
        </button>
      </div>
    </div>
  )
}

const SharedDataDisplay = ({ data }: { data: shareData }) => {
  return (
    <div className="w-full p-4 border-green-500 border-2 rounded-2xl bg-green-900/20">
      <h3 className="text-2xl font-bold mb-2">🎉 Connected with {data.u}!</h3>
      <div className="space-y-2">
        <div>
          <strong>Reg:</strong> {data.r}
        </div>
        <div>
          <strong>Semester:</strong> {data.s}
        </div>
        <div>
          <strong>Hobbies:</strong> {data.h.join(", ")}
        </div>
        <div>
          <strong>Quote:</strong> {data.q.join(" ")}
        </div>
        <div>
          <strong>Schedule Slots:</strong> {data.o.length} slots
        </div>
      </div>
    </div>
  )
}

const P2P = () => {
  const { data: userData, isLoading: timetableLoading, error: timetableError } = useShareUserProfile()
  const [myEndpointId, setMyEndpointId] = useState<string>("")
  const [discoveredPeers, setDiscoveredPeers] = useState<DiscoveredPeer[]>([])
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([])
  const [connectedPeers, setConnectedPeers] = useState<shareData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [status, setStatus] = useState<string>("Initializing...")
  const [myShareData, setMyShareData] = useState<shareData | null>(null)
  const { setFriendAdded } = useAddFriendStore()
  const unlistenFnRef = useRef<(() => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [peerNames, setPeerNames] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        if (timetableLoading) return

        if (timetableError) {
          setStatus("Error: Failed to load your profile...")
          return
        }

        if (!userData) {
          setStatus("Error: User profile not found...")
          return
        }

        if (!isMounted) return

        const shareableData: shareData = userData
        setMyShareData(shareableData)

        const endpointId = await invoke<string>("init_friend_service")
        if (!isMounted) return
        setMyEndpointId(endpointId) // Set this as early as possible
        setStatus(`Your ID: ${endpointId.slice(0, 10)}...`)

        await invoke("set_share_data", { shareData: shareableData })
        if (!isMounted) return

        await invoke("start_friend_service")
        if (!isMounted) return

        const unlistenPromise = listen<FriendEvent>("friend-event", (event) => {
          console.log("Friend event:", event.payload)
          const payload = event.payload

          // MODIFIED: Switched to type-safe access, removed 'as any'
          switch (payload.type) {
            case "PeerDiscovered": {
              try {
                const peer = payload.peer // Access .peer
                console.log("Peer discovered:", peer)

                // Filter 1: Don't show yourself
                if (peer.endpoint_id === myEndpointId) {
                  break
                }

                // MODIFIED: Filter 2: Don't show "Unknown" users
                if (peer.name === "Unknown") {
                  console.log("Filtered out an unknown peer.")
                  break
                }

                setDiscoveredPeers((prev) => {
                  if (prev.some((p) => p.endpoint_id === peer.endpoint_id)) {
                    return prev
                  }
                  return [...prev, peer]
                })

                setStatus(`A new device is nearby: ${peer.name}`)
              } catch (err) {
                console.error("Error in PeerDiscovered:", err)
                setStatus("Something went wrong while discovering a device.")
              }
              break
            }

            case "IncomingRequest": {
              try {
                const request = payload.request // Access .request
                console.log("Incoming connection request:", request)

                setIncomingRequests((prev) => [...prev, request])
                setStatus("Someone wants to connect with you.")
              } catch (err) {
                console.error("Error in IncomingRequest:", err)
                setStatus("Failed to process an incoming request.")
              }
              break
            }

            case "RequestAccepted": {
              try {
                const share_data = payload.share_data // Access .share_data
                console.log("Request accepted:", share_data)

                setStatus(`Connected with ${share_data.u}`)

                setConnectedPeers((prev) => {
                  if (prev.some((p) => p.r === share_data.r)) {
                    return prev
                  }
                  return [...prev, share_data]
                })

                addFriend(share_data)
                  .then((result) => {
                    if (result.success) {
                      setFriendAdded(true)
                    }
                  })
                  .catch((err) => console.error("Error saving friend:", err))
              } catch (err) {
                console.error("Error in RequestAccepted:", err)
                setStatus("Failed to finalize the connection.")
              }
              break
            }

            case "RequestRejected": {
              try {
                const reason = payload.reason // Access .reason
                console.log("Request rejected:", reason)

                setStatus(`Your connection request was declined: ${reason}`)
              } catch (err) {
                console.error("Error in RequestRejected:", err)
                setStatus("The request was rejected, but the reason could not be read.")
              }
              break
            }

            case "DataReceived": {
              try {
                const share_data = payload.share_data // Access .share_data
                console.log("Data received:", share_data)

                setStatus(`Received data from ${share_data.u}`)

                setConnectedPeers((prev) => {
                  if (prev.some((p) => p.r === share_data.r)) {
                    return prev
                  }
                  return [...prev, share_data]
                })

                addFriend(share_data)
                  .then((result) => {
                    if (result.success) {
                      setFriendAdded(true)
                    }
                  })
                  .catch((err) => console.error("Error saving friend after data:", err))
              } catch (err) {
                console.error("Error in DataReceived:", err)
                setStatus("Received data, but failed to process it.")
              }
              break
            }

            case "Error": {
              const message = payload.message // Access .message
              console.error("Error event:", message)

              setStatus(`An error occurred: ${message}`)
              break
            }

            default: {
              console.log("Unknown event type:", payload)
              setStatus("Received an unrecognized event.")
              break
            }
          }
        })

        // Handle the promise safely
        unlistenPromise
          .then((unlistenFn) => {
            if (isMounted) {
              unlistenFnRef.current = unlistenFn
            } else {
              unlistenFn()
            }
          })
          .catch((err) => {
            if (isMounted) {
              console.error("Failed to set up event listener:", err)
              setStatus(`Error: ${String(err)}`)
            }
          })
      } catch (error) {
        if (isMounted) {
          console.error("Initialization error:", error)
          setStatus(`Error: ${String(error)}`)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
      if (unlistenFnRef.current) {
        unlistenFnRef.current()
        unlistenFnRef.current = null
      }

      // MODIFIED: Cleanup is now conditional to prevent "Service not initialized" error
      if (myEndpointId) {
        invoke("stop_discovery").catch(console.error)
      }
    }
  }, [userData, timetableLoading, timetableError, setFriendAdded])

  const startDiscovery = async () => {
    try {
      setIsSearching(true)
      setStatus("Searching for peers...")
      await invoke("start_discovery")
    } catch (error) {
      console.error("Discovery error:", error)
      setStatus(`Error: ${String(error)}`) // MODIFIED: Better error
      setIsSearching(false)
    }
  }

  const storePeerName = (peerId: string, name: string) => {
    setPeerNames((prev) => new Map(prev).set(peerId, name))
  }

  // Dynamic Person component
  const Person = ({ peer, isLoading }: { peer: DiscoveredPeer; isLoading: boolean }) => {
    return (
      <div className={`w-full h-fit p-4 border-primary border rounded-2xl transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary/10"}`} onClick={() => !isLoading && sendFriendRequest(peer.endpoint_id)}>
        <div className="font-bold">👤 {peer.name}</div>
        <div className="text-sm text-gray-400">Click to send friend request</div>
      </div>
    )
  }

  const sendFriendRequest = async (peerId: string) => {
    if (!myShareData) {
      setStatus("Error: User profile not loaded")
      return
    }
    try {
      setIsLoading(true)
      const peerName = discoveredPeers.find((p) => p.endpoint_id === peerId)?.name || peerId.slice(0, 10)
      setStatus(`Sending friend request to ${peerName}...`)

      const theirData = await invoke<shareData>("send_friend_request", {
        peerId,
        shareData: myShareData,
      })
      setStatus(`Connected with ${theirData.u}!`)
      console.log("Received data:", theirData)

      storePeerName(peerId, theirData.u)

      setConnectedPeers((prev) => {
        if (prev.some((p) => p.r === theirData.r)) {
          return prev
        }
        return [...prev, theirData]
      })

      const result = await addFriend(theirData)
      if (result.success) {
        setFriendAdded(true)
      }

      setDiscoveredPeers((prev) => prev.filter((p) => p.endpoint_id !== peerId))
    } catch (error) {
      console.error("Send request error:", error)
      setStatus(`Error: ${String(error)}`) // MODIFIED: Better error
    } finally {
      setIsLoading(false)
    }
  }

  const acceptRequest = async (request: IncomingRequest) => {
    if (!myShareData) {
      setStatus("Error: User profile not loaded")
      return
    }
    try {
      setIsLoading(true)
      setStatus(`Accepting request from ${request.name}...`)
      const theirData = await invoke<shareData>("accept_friend_request", {
        remoteId: request.remote_id,
        shareData: myShareData,
      })
      setStatus(`Connected with ${theirData.u}!`)
      console.log("Received data:", theirData)
      setConnectedPeers((prev) => {
        if (prev.some((p) => p.r === theirData.r)) {
          return prev
        }
        return [...prev, theirData]
      })

      const result = await addFriend(theirData)
      if (result.success) {
        setFriendAdded(true)
      }

      setIncomingRequests((prev) => prev.filter((r) => r.remote_id !== request.remote_id))
    } catch (error) {
      console.error("Accept error:", error)
      setStatus(`Error: ${String(error)}`) // MODIFIED: Better error
    } finally {
      setIsLoading(false)
    }
  }

  const rejectRequest = async (request: IncomingRequest) => {
    try {
      setIsLoading(true)
      await invoke("reject_friend_request", {
        remoteId: request.remote_id,
      })
      setStatus(`Rejected request from ${request.name}`)

      setIncomingRequests((prev) => prev.filter((r) => r.remote_id !== request.remote_id))
    } catch (error) {
      console.error("Reject error:", error)
      setStatus(`Error: ${String(error)}`) // MODIFIED: Better error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black w-full h-full justify-center items-center flex flex-col p-4 overflow-y-auto">
      <DotLottieReact src={"/src/assets/loading_wifi.lottie"} loop autoplay className="w-48 h-48" />

      <div className="text-4xl text-center mb-4">{status}</div>

      {!isSearching && (
        <button onClick={startDiscovery} disabled={isLoading} className={`text-black px-6 py-3 rounded-lg text-xl mb-4 ${isLoading ? "bg-gray-500 cursor-not-allowed opacity-50" : "bg-primary hover:bg-primary/80"}`}>
          Start Searching
        </button>
      )}

      {connectedPeers.length > 0 && (
        <div className="w-full max-w-2xl mb-4">
          <h2 className="text-2xl mb-2">✅ Connected Friends</h2>
          <div className="flex flex-col gap-2">
            {connectedPeers.map(
              (
                data // MODIFIED: Removed 'idx'
              ) => (
                <SharedDataDisplay key={data.r} data={data} /> // MODIFIED: Use 'data.r' as key
              )
            )}
          </div>
        </div>
      )}

      {incomingRequests.length > 0 && (
        <div className="w-full max-w-2xl mb-4">
          <h2 className="text-2xl mb-2">📨 Incoming Requests</h2>
          <div className="flex flex-col gap-2">
            {incomingRequests.map((request) => (
              <Request key={request.remote_id} request={request} onAccept={() => acceptRequest(request)} onReject={() => rejectRequest(request)} />
            ))}
          </div>
        </div>
      )}

      {discoveredPeers.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl mb-2">🔍 Discovered Peers</h2>
          <div className="flex flex-col gap-2">
            {discoveredPeers.map((peer) => (
              <Person key={peer.endpoint_id} peer={peer} isLoading={isLoading} />
            ))}
          </div>
        </div>
      )}

      {isSearching && discoveredPeers.length === 0 && <div className="text-xl text-gray-400 mt-4">Searching for users in your local network...</div>}
    </div>
  )
}

export default P2P
