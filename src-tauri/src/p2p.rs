use futures_lite::stream::StreamExt;
use iroh::{
    discovery::mdns::{DiscoveryEvent, MdnsDiscovery},
    endpoint::Connection,
    protocol::{AcceptError, ProtocolHandler, Router},
    Endpoint, EndpointAddr, PublicKey,
};
use serde::{Deserialize, Serialize};
use std::future::Future;
use std::str::FromStr;
use std::sync::Arc;
use tauri::{Emitter, State};
use tokio::sync::{mpsc, Mutex, RwLock};
use tokio::task::JoinHandle;

const ALPN: &[u8] = b"vfriend/request";

// ============================================================================
// Public Types for Tauri Frontend (matches TypeScript interface)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompactSlot {
    pub d: u8,     // day (1-7)
    pub s: String, // "t" or "l"
    pub p: u8,     // period (1-12)
    pub f: String, // original full text
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShareData {
    pub u: String,           // username
    pub r: String,           // registration number
    pub s: u32,              // semester
    pub h: Vec<String>,      // hobbies
    pub q: Vec<String>,      // quote
    pub t: String,           // timestamp
    pub o: Vec<CompactSlot>, // schedule slots
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredPeer {
    pub endpoint_id: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomingRequest {
    pub from: String,
    pub name: String,
    pub remote_id: String,
}

// MODIFIED: Added serde tag back
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum FriendEvent {
    PeerDiscovered { peer: DiscoveredPeer },
    IncomingRequest { request: IncomingRequest },
    RequestAccepted { share_data: ShareData },
    RequestRejected { reason: String },
    DataReceived { share_data: ShareData },
    Error { message: String },
}

// ============================================================================
// Internal Protocol Messages
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
struct FriendRequestMessage {
    from: String,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct FriendResponseMessage {
    accepted: bool,
}

// ============================================================================
// Main Service State
// ============================================================================

pub struct FriendExchangeService {
    endpoint: Endpoint,
    mdns: MdnsDiscovery,
    router: Option<Router>,
    event_tx: Arc<Mutex<Option<mpsc::UnboundedSender<FriendEvent>>>>,
    pending_requests: Arc<RwLock<Vec<PendingRequest>>>,
    my_share_data: Arc<RwLock<Option<ShareData>>>,
    discovery_task: Arc<Mutex<Option<JoinHandle<()>>>>,
}

#[derive(Debug)]
struct PendingRequest {
    remote_id: String,
    connection: Arc<Connection>,
    request: IncomingRequest,
    response_send: Option<iroh::endpoint::SendStream>,
}

// ============================================================================
// Public API Functions
// ============================================================================

impl FriendExchangeService {
    /// Initialize the service and start listening
    pub async fn new() -> Result<Self, String> {
        let endpoint = Endpoint::bind()
            .await
            .map_err(|e| format!("Failed to bind endpoint: {}", e))?;

        let endpoint_id = endpoint.id();
        let mdns = MdnsDiscovery::builder()
            .build(endpoint_id)
            .map_err(|e| format!("Failed to create mDNS discovery: {}", e))?;

        endpoint.discovery().add(mdns.clone());

        Ok(Self {
            endpoint,
            mdns,
            router: None,
            event_tx: Arc::new(Mutex::new(None)),
            pending_requests: Arc::new(RwLock::new(Vec::new())),
            my_share_data: Arc::new(RwLock::new(None)),
            discovery_task: Arc::new(Mutex::new(None)),
        })
    }

    /// Get your own endpoint ID
    pub fn get_endpoint_id(&self) -> String {
        self.endpoint.id().to_string()
    }

    /// Set your share data
    pub async fn set_share_data(&self, share_data: ShareData) {
        *self.my_share_data.write().await = Some(share_data);
    }

    /// Start the service (begins accepting connections)
    pub async fn start(
        &mut self,
        event_tx: mpsc::UnboundedSender<FriendEvent>,
    ) -> Result<(), String> {
        *self.event_tx.lock().await = Some(event_tx.clone());

        let protocol = FriendProtocolHandler {
            event_tx: self.event_tx.clone(),
            pending_requests: self.pending_requests.clone(),
        };

        let router = Router::builder(self.endpoint.clone())
            .accept(ALPN, protocol)
            .spawn();

        self.router = Some(router);
        Ok(())
    }

    /// Start discovering peers
    pub async fn start_discovery(&self) {
        let event_tx = match self.event_tx.lock().await.as_ref() {
            Some(tx) => tx.clone(),
            None => {
                eprintln!("Discovery started before service event loop.");
                return;
            }
        };

        let mut stream = self.mdns.subscribe().await;
        let endpoint_id = self.endpoint.id();

        let new_handle = tokio::spawn(async move {
            while let Some(event) = stream.next().await {
                if let DiscoveryEvent::Discovered { endpoint_info, .. } = event {
                    let other = endpoint_info.endpoint_id;
                    if other != endpoint_id {
                        let peer = DiscoveredPeer {
                            endpoint_id: other.to_string(),
                            timestamp: std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap()
                                .as_secs(),
                        };
                        let _ = event_tx.send(FriendEvent::PeerDiscovered { peer });
                    }
                }
            }
        });

        let mut task_handle_guard = self.discovery_task.lock().await;
        if let Some(old_handle) = task_handle_guard.take() {
            old_handle.abort();
        }
        *task_handle_guard = Some(new_handle);
    }

    // ADDED: New function to explicitly stop discovery
    /// Stop discovering peers
    pub async fn stop_discovery(&self) {
        let mut task_handle_guard = self.discovery_task.lock().await;
        if let Some(handle) = task_handle_guard.take() {
            handle.abort();
        }
    }

    /// Send a friend request to a discovered peer
    pub async fn send_friend_request(
        &self,
        peer_endpoint_id: String,
        my_share_data: ShareData,
    ) -> Result<ShareData, String> {
        let endpoint_id = PublicKey::from_str(&peer_endpoint_id)
            .map_err(|e| format!("Invalid endpoint ID: {}", e))?;

        let addr = EndpointAddr::from(endpoint_id);
        let conn = self
            .endpoint
            .connect(addr, ALPN)
            .await
            .map_err(|e| format!("Failed to connect: {}", e))?;

        // Step 1: Send friend request
        let (mut send, mut recv) = conn
            .open_bi()
            .await
            .map_err(|e| format!("Failed to open stream: {}", e))?;

        let req = FriendRequestMessage {
            from: my_share_data.r.clone(),
            name: my_share_data.u.clone(),
        };
        let data =
            serde_json::to_vec(&req).map_err(|e| format!("Failed to serialize request: {}", e))?;

        send.write_all(&data)
            .await
            .map_err(|e| format!("Failed to send request: {}", e))?;
        send.finish()
            .map_err(|e| format!("Failed to finish send: {}", e))?;

        // Step 2: Wait for response
        let bytes = recv
            .read_to_end(1000)
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;
        let resp: FriendResponseMessage = serde_json::from_slice(&bytes)
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if !resp.accepted {
            conn.close(0u32.into(), b"rejected");
            return Err("Friend request was rejected".to_string());
        }

        // Step 3: Send my share data
        let (mut send2, mut recv2) = conn
            .open_bi()
            .await
            .map_err(|e| format!("Failed to open data stream: {}", e))?;

        let share_data_bytes = serde_json::to_vec(&my_share_data)
            .map_err(|e| format!("Failed to serialize share data: {}", e))?;

        send2
            .write_all(&share_data_bytes)
            .await
            .map_err(|e| format!("Failed to send share data: {}", e))?;
        send2
            .finish()
            .map_err(|e| format!("Failed to finish data send: {}", e))?;

        // Step 4: Receive their share data
        let their_data_bytes = recv2
            .read_to_end(100000)
            .await
            .map_err(|e| format!("Failed to read their data: {}", e))?;
        let their_share_data: ShareData = serde_json::from_slice(&their_data_bytes)
            .map_err(|e| format!("Failed to parse their data: {}", e))?;

        conn.close(0u32.into(), b"bye!");

        if let Some(tx) = self.event_tx.lock().await.as_ref() {
            let _ = tx.send(FriendEvent::DataReceived {
                share_data: their_share_data.clone(),
            });
        }

        Ok(their_share_data)
    }

    /// Accept a pending friend request
    pub async fn accept_friend_request(
        &self,
        remote_id: String,
        my_share_data: ShareData,
    ) -> Result<ShareData, String> {
        let mut pending = self.pending_requests.write().await;
        let idx = pending
            .iter()
            .position(|p| p.remote_id == remote_id)
            .ok_or("No pending request from this peer")?;

        let pending_req = pending.remove(idx);
        drop(pending); // Release lock

        let mut send = pending_req
            .response_send
            .ok_or("Response stream not available")?;

        let response = FriendResponseMessage { accepted: true };
        let bytes = serde_json::to_vec(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        send.write_all(&bytes)
            .await
            .map_err(|e| format!("Failed to send response: {}", e))?;
        send.finish()
            .map_err(|e| format!("Failed to finish response: {}", e))?;

        let (mut send2, mut recv2) = pending_req
            .connection
            .accept_bi()
            .await
            .map_err(|e| format!("Failed to accept data stream: {}", e))?;

        let their_data_bytes = recv2
            .read_to_end(100000)
            .await
            .map_err(|e| format!("Failed to read their data: {}", e))?;
        let their_share_data: ShareData = serde_json::from_slice(&their_data_bytes)
            .map_err(|e| format!("Failed to parse their data: {}", e))?;

        let share_data_bytes = serde_json::to_vec(&my_share_data)
            .map_err(|e| format!("Failed to serialize share data: {}", e))?;

        send2
            .write_all(&share_data_bytes)
            .await
            .map_err(|e| format!("Failed to send share data: {}", e))?;
        send2
            .finish()
            .map_err(|e| format!("Failed to finish data send: {}", e))?;

        pending_req.connection.closed().await;

        if let Some(tx) = self.event_tx.lock().await.as_ref() {
            let _ = tx.send(FriendEvent::RequestAccepted {
                share_data: their_share_data.clone(),
            });
        }

        Ok(their_share_data)
    }

    /// Reject a pending friend request
    pub async fn reject_friend_request(&self, remote_id: String) -> Result<(), String> {
        let mut pending = self.pending_requests.write().await;
        let idx = pending
            .iter()
            .position(|p| p.remote_id == remote_id)
            .ok_or("No pending request from this peer")?;

        let pending_req = pending.remove(idx);
        drop(pending);

        let mut send = pending_req
            .response_send
            .ok_or("Response stream not available")?;

        let response = FriendResponseMessage { accepted: false };
        let bytes = serde_json::to_vec(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        send.write_all(&bytes)
            .await
            .map_err(|e| format!("Failed to send response: {}", e))?;
        send.finish()
            .map_err(|e| format!("Failed to finish response: {}", e))?;

        pending_req.connection.close(0u32.into(), b"rejected");
        Ok(())
    }

    /// Shutdown the service
    pub async fn shutdown(self) -> Result<(), String> {
        if let Some(handle) = self.discovery_task.lock().await.take() {
            handle.abort();
        }

        if let Some(router) = self.router {
            router
                .shutdown()
                .await
                .map_err(|e| format!("Failed to shutdown router: {}", e))?;
        }
        self.endpoint.close().await;
        Ok(())
    }
}

// ============================================================================
// Protocol Handler (Internal)
// ============================================================================

#[derive(Clone, Debug)]
struct FriendProtocolHandler {
    event_tx: Arc<Mutex<Option<mpsc::UnboundedSender<FriendEvent>>>>,
    pending_requests: Arc<RwLock<Vec<PendingRequest>>>,
}

impl ProtocolHandler for FriendProtocolHandler {
    async fn accept(&self, connection: Connection) -> std::result::Result<(), AcceptError> {
        let remote_id = connection.remote_id().to_string();

        let (send, mut recv) = connection.accept_bi().await?;
        let data = recv.read_to_end(1000).await.map_err(|e| {
            AcceptError::from_err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to read request: {}", e),
            ))
        })?;

        let request: FriendRequestMessage = serde_json::from_slice(&data).map_err(|e| {
            AcceptError::from_err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("Failed to parse request: {}", e),
            ))
        })?;

        let incoming = IncomingRequest {
            from: request.from.clone(),
            name: request.name.clone(),
            remote_id: remote_id.clone(),
        };

        let pending = PendingRequest {
            remote_id: remote_id.clone(),
            connection: Arc::new(connection),
            request: incoming.clone(),
            response_send: Some(send),
        };
        self.pending_requests.write().await.push(pending);

        if let Some(tx) = self.event_tx.lock().await.as_ref() {
            let _ = tx.send(FriendEvent::IncomingRequest { request: incoming });
        }

        Ok(())
    }

    fn on_accepting(
        &self,
        accepting: iroh::endpoint::Accepting,
    ) -> impl Future<Output = std::result::Result<Connection, AcceptError>> + Send {
        async move {
            let conn = accepting.await?;
            Ok(conn)
        }
    }

    fn shutdown(&self) -> impl Future<Output = ()> + Send {
        async move {}
    }
}

// ============================================================================
// Tauri Commands
// ============================================================================

pub type ServiceState = Arc<Mutex<Option<FriendExchangeService>>>;

#[tauri::command]
pub async fn init_friend_service(state: State<'_, ServiceState>) -> Result<String, String> {
    let service = FriendExchangeService::new().await?;
    let endpoint_id = service.get_endpoint_id();
    *state.lock().await = Some(service);
    Ok(endpoint_id)
}

#[tauri::command]
pub async fn set_share_data(
    state: State<'_, ServiceState>,
    share_data: ShareData,
) -> Result<(), String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.set_share_data(share_data).await;
        Ok(())
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn start_friend_service(
    state: State<'_, ServiceState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let (tx, mut rx) = mpsc::unbounded_channel();

    let app_clone = app_handle.clone();
    tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            let _ = app_clone.emit("friend-event", event);
        }
    });

    let mut service = state.lock().await;
    if let Some(service) = service.as_mut() {
        service.start(tx.clone()).await?;
        Ok(())
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn start_discovery(state: State<'_, ServiceState>) -> Result<(), String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.start_discovery().await;
        Ok(())
    } else {
        Err("Service not initialized".to_string())
    }
}

// ADDED: New command to stop discovery
#[tauri::command]
pub async fn stop_discovery(state: State<'_, ServiceState>) -> Result<(), String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.stop_discovery().await;
        Ok(())
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn send_friend_request(
    state: State<'_, ServiceState>,
    peer_id: String,
    share_data: ShareData,
) -> Result<ShareData, String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.send_friend_request(peer_id, share_data).await
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn accept_friend_request(
    state: State<'_, ServiceState>,
    remote_id: String,
    share_data: ShareData,
) -> Result<ShareData, String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.accept_friend_request(remote_id, share_data).await
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn reject_friend_request(
    state: State<'_, ServiceState>,
    remote_id: String,
) -> Result<(), String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        service.reject_friend_request(remote_id).await
    } else {
        Err("Service not initialized".to_string())
    }
}

#[tauri::command]
pub async fn get_my_endpoint_id(state: State<'_, ServiceState>) -> Result<String, String> {
    let service = state.lock().await;
    if let Some(service) = service.as_ref() {
        Ok(service.get_endpoint_id())
    } else {
        Err("Service not initialized".to_string())
    }
}
