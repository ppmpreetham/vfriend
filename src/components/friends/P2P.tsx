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
  timestamp: number
}

interface IncomingRequest {
  from: string
  name: string
  remote_id: string
}

type FriendEvent =
  | { type: "PeerDiscovered"; peer: DiscoveredPeer }
  | { type: "IncomingRequest"; request: IncomingRequest }
  | { type: "RequestAccepted"; share_data: shareData }
  | { type: "RequestRejected"; reason: string }
  | { type: "DataReceived"; share_data: shareData }
  | { type: "Error"; message: string }

const Person = ({ peer, onSendRequest }: { peer: DiscoveredPeer; onSendRequest: () => void }) => {
  return (
    <div className="w-full h-fit p-4 border-primary border rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors" onClick={onSendRequest}>
      <div className="font-bold">Peer: {peer.endpoint_id.slice(0, 10)}...</div>
      <div className="text-sm text-gray-400">Click to send friend request</div>
    </div>
  )
}

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

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        // Don't early return - wait for data
        if (timetableLoading) return

        if (timetableError) {
          setStatus("Error: Failed to load your profile...")
          return
        }

        if (!userData) {
          setStatus("Error: User profile not found...")
          return
        }

        // Check mount status *before* making async calls
        if (!isMounted) return

        const shareableData: shareData = userData
        setMyShareData(shareableData)

        // Initialize service
        const endpointId = await invoke<string>("init_friend_service")
        if (!isMounted) return
        setMyEndpointId(endpointId)
        setStatus(`Your ID: ${endpointId.slice(0, 10)}...`)

        // Set share data
        await invoke("set_share_data", { shareData: shareableData })
        if (!isMounted) return

        // Start service
        await invoke("start_friend_service")
        if (!isMounted) return

        // Listen for events - this is the critical part
        // listen() returns a Promise that resolves to the unlisten function
        const unlistenPromise = listen<FriendEvent>("friend-event", (event) => {
          console.log("Friend event:", event.payload)
          const payload = event.payload

          // Use the type-safe payload
          switch (payload.type) {
            case "PeerDiscovered": {
              try {
                const peer = (payload as any).peer as DiscoveredPeer
                console.log("Peer discovered:", peer)

                setDiscoveredPeers((prev) => {
                  if (prev.some((p) => p.endpoint_id === peer.endpoint_id)) {
                    return prev
                  }
                  return [...prev, peer]
                })

                setStatus(`A new device is nearby: ${peer.endpoint_id}`)
              } catch (err) {
                console.error("Error in PeerDiscovered:", err)
                setStatus("Something went wrong while discovering a device.")
              }
              break
            }

            case "IncomingRequest": {
              try {
                const request = (payload as any).request as IncomingRequest
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
                const share_data = (payload as any).share_data as shareData
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
                const reason = (payload as any).reason as string
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
                const share_data = (payload as any).share_data as shareData
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
              const message = (payload as any).message as string
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
              // If component is still mounted, store the unlisten function
              unlistenFnRef.current = unlistenFn
            } else {
              // If component unmounted while we were waiting, clean up immediately
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
      // Clean up the listener
      if (unlistenFnRef.current) {
        unlistenFnRef.current()
        unlistenFnRef.current = null
      }

      // Optional: Add a command to stop discovery/shutdown service
      // if the user navigates away.
      // invoke("stop_discovery").catch(console.error);
    }
  }, [userData, timetableLoading, timetableError, setFriendAdded])

  const startDiscovery = async () => {
    try {
      setIsSearching(true)
      setStatus("Searching for peers...")
      await invoke("start_discovery")
    } catch (error) {
      console.error("Discovery error:", error)
      setStatus(`Error: ${error}`)
      setIsSearching(false)
    }
  }

  const sendFriendRequest = async (peerId: string) => {
    if (!myShareData) {
      setStatus("Error: User profile not loaded")
      return
    }
    try {
      setStatus(`Sending friend request to ${peerId.slice(0, 10)}...`)
      const theirData = await invoke<shareData>("send_friend_request", {
        peerId,
        shareData: myShareData,
      })
      setStatus(`Connected with ${theirData.u}!`)
      console.log("Received data:", theirData)
      setConnectedPeers((prev) => {
        // Avoid duplicates (event handler might also add)
        if (prev.some((p) => p.r === theirData.r)) {
          return prev
        }
        return [...prev, theirData]
      })

      // Save friend to store
      const result = await addFriend(theirData)
      if (result.success) {
        setFriendAdded(true)
      }

      // Remove from discovered peers
      setDiscoveredPeers((prev) => prev.filter((p) => p.endpoint_id !== peerId))
    } catch (error) {
      console.error("Send request error:", error)
      setStatus(`Error: ${error}`)
    }
  }

  const acceptRequest = async (request: IncomingRequest) => {
    if (!myShareData) {
      setStatus("Error: User profile not loaded")
      return
    }
    try {
      setStatus(`Accepting request from ${request.name}...`)
      const theirData = await invoke<shareData>("accept_friend_request", {
        remoteId: request.remote_id,
        shareData: myShareData,
      })
      setStatus(`Connected with ${theirData.u}!`)
      console.log("Received data:", theirData)
      setConnectedPeers((prev) => {
        // Avoid duplicates (event handler might also add)
        if (prev.some((p) => p.r === theirData.r)) {
          return prev
        }
        return [...prev, theirData]
      })

      // Save friend to store
      const result = await addFriend(theirData)
      if (result.success) {
        setFriendAdded(true)
      }

      // Remove from incoming requests
      setIncomingRequests((prev) => prev.filter((r) => r.remote_id !== request.remote_id))
    } catch (error) {
      console.error("Accept error:", error)
      setStatus(`Error: ${error}`)
    }
  }

  const rejectRequest = async (request: IncomingRequest) => {
    try {
      await invoke("reject_friend_request", {
        remoteId: request.remote_id,
      })
      setStatus(`Rejected request from ${request.name}`)

      // Remove from incoming requests
      setIncomingRequests((prev) => prev.filter((r) => r.remote_id !== request.remote_id))
    } catch (error) {
      console.error("Reject error:", error)
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="bg-black w-full h-full justify-center items-center flex flex-col p-4 overflow-y-auto">
      <DotLottieReact src={"/src/assets/loading_wifi.lottie"} loop autoplay className="w-48 h-48" />

      <div className="text-4xl text-center mb-4">{status}</div>

      {!isSearching && (
        <button onClick={startDiscovery} className="text-black px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg text-xl mb-4">
          Start Searching
        </button>
      )}

      {/* Connected Peers */}
      {connectedPeers.length > 0 && (
        <div className="w-full max-w-2xl mb-4">
          <h2 className="text-2xl mb-2">✅ Connected Friends</h2>
          <div className="flex flex-col gap-2">
            {connectedPeers.map((data, idx) => (
              <SharedDataDisplay key={idx} data={data} />
            ))}
          </div>
        </div>
      )}

      {/* Incoming Requests */}
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

      {/* Discovered Peers */}
      {discoveredPeers.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl mb-2">🔍 Discovered Peers</h2>
          <div className="flex flex-col gap-2">
            {discoveredPeers.map((peer) => (
              <Person key={peer.endpoint_id} peer={peer} onSendRequest={() => sendFriendRequest(peer.endpoint_id)} />
            ))}
          </div>
        </div>
      )}

      {isSearching && discoveredPeers.length === 0 && <div className="text-xl text-gray-400 mt-4">Searching for users in your local network...</div>}
    </div>
  )
}

export default P2P
