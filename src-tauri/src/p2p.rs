// use tauri::Manager;
// use serde::{Serialize, Deserialize};
// use std::sync::Arc;
// use tokio::sync::Mutex;
// use iroh::{node::Node, chat::{Ticket, Channel}};
// use anyhow::Result;

// #[derive(Clone, Serialize, Deserialize)]
// struct FriendInfo {
//     username: String,
//     public_key: String,
// }

// struct AppState {
//     node: Arc<Mutex<Option<Node>>>,
//     channel: Arc<Mutex<Option<Channel>>>,
// }

// #[tauri::command]
// async fn start_node(state: tauri::State<'_, AppState>) -> Result<(), String> {
//     let mut node = state.node.lock().await;
//     *node = Some(Node::builder().spawn().await.map_err(|e| e.to_string())?);
//     Ok(())
// }

// #[tauri::command]
// async fn create_ticket(state: tauri::State<'_, AppState>) -> Result<String, String> {
//     let node = state.node.lock().await;
//     let node = node.as_ref().ok_or("Node not started")?;
//     let channel = node.create_channel().await.map_err(|e| e.to_string())?;
//     let ticket = channel.ticket().serialize();
//     *state.channel.lock().await = Some(channel);
//     Ok(ticket)
// }

// #[tauri::command]
// async fn join_ticket(state: tauri::State<'_, AppState>, ticket: String) -> Result<(), String> {
//     let node = state.node.lock().await;
//     let node = node.as_ref().ok_or("Node not started")?;
//     let ticket = Ticket::deserialize(&ticket).map_err(|e| e.to_string())?;
//     let channel = node.join_channel(ticket).await.map_err(|e| e.to_string())?;
//     *state.channel.lock().await = Some(channel);
//     Ok(())
// }

// #[tauri::command]
// async fn exchange_friend_info(
//     state: tauri::State<'_, AppState>,
//     my_info: FriendInfo,
// ) -> Result<FriendInfo, String> {
//     let mut channel_guard = state.channel.lock().await;
//     let channel = channel_guard.as_mut().ok_or("Not connected")?;

//     // Send your info
//     let json = serde_json::to_vec(&my_info).map_err(|e| e.to_string())?;
//     channel.send(json).await.map_err(|e| e.to_string())?;

//     // Wait for friends info
//     let peer_json = channel.recv().await.map_err(|e| e.to_string())?;
//     let peer_info: FriendInfo = serde_json::from_slice(&peer_json).map_err(|e| e.to_string())?;

//     Ok(peer_info)
// }
