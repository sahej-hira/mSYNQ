# SyncPlay Architecture

## System Overview

SyncPlay is a real-time synchronized video playback application built with React and Firebase Realtime Database.

## Architecture Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User 1    │         │   User 2    │         │   User 3    │
│   Browser   │         │   Browser   │         │   Browser   │
│ (Any can    │         │ (Any can    │         │ (Any can    │
│  control)   │         │  control)   │         │  control)   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Firebase Realtime  │
                    │     Database        │
                    │  (Room State Store) │
                    └─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   YouTube iFrame    │
                    │      API Server     │
                    └─────────────────────┘
```

## Core Components

### 1. Frontend Layer

**App.jsx**
- Entry point and routing
- Room creation/join logic
- User authentication (username)
- Session management

**SyncRoom.jsx**
- Main room container
- Coordinates all components
- Manages room state
- Handles player events

**YouTubePlayer.jsx**
- YouTube iFrame API wrapper
- Player initialization
- Event handling
- Video loading

**RoomControls.jsx**
- Playback controls UI
- Collaborative controls (anyone can control)
- Seek functionality
- Time display

**Chat.jsx**
- Real-time messaging with emoji picker
- Message history (50 messages)
- User identification
- Auto-scroll

**Queue.jsx**
- Video queue management
- Add/remove videos
- Auto-play next video
- Smart video ID extraction

**ParticipantNames.jsx**
- Real-time presence detection
- Participant list display
- Online/offline status
- Heartbeat system


### 2. Sync Logic Layer

**useSyncedPlayer.js Hook**

Core synchronization logic:

```javascript
// Room State Structure
{
  videoId: string,        // YouTube video ID
  timestamp: number,      // Current playback position (seconds)
  isPlaying: boolean,     // Play/pause state
  lastUpdated: number,    // Timestamp of last update (ms)
  updatedBy: string      // User ID who made last update
}
```

**Key Functions:**

1. **updateRoomState()** - Any user updates Firebase
2. **syncToRoomState()** - All users sync to Firebase state
3. **driftCorrection()** - Periodic sync checks (every 2s)
4. **createRoom()** - Initialize new room
5. **extractVideoId()** - Parse YouTube URLs and clean IDs

### 3. Backend Layer

**Firebase Realtime Database**

- Real-time pub/sub system
- WebSocket-based updates
- Automatic reconnection
- Offline support

**Database Structure:**
```
rooms/
  └── {roomId}/
      ├── videoId
      ├── timestamp
      ├── isPlaying
      ├── lastUpdated
      ├── updatedBy
      ├── messages/
      │   └── {messageId}/
      │       ├── userId
      │       ├── username
      │       ├── text
      │       └── timestamp
      ├── queue/
      │   └── {queueId}/
      │       ├── videoId
      │       ├── addedAt
      │       └── addedBy
      └── participants/
          └── {userId}/
              ├── username
              ├── joinedAt
              └── lastSeen
```

## Synchronization Mechanism

### 1. Event Flow

**Any User Actions (Collaborative Control):**
```
User clicks play
    ↓
YouTube player plays
    ↓
onStateChange event fires
    ↓
updateRoomState() called
    ↓
Firebase updates room state
    ↓
All other users receive update
```

**All Users Sync:**
```
Firebase state changes
    ↓
onValue listener fires
    ↓
Calculate expected time
    ↓
Check drift
    ↓
If drift > 0.5s, seek to correct position
    ↓
Sync play/pause state
```

### 2. Drift Correction Algorithm

```javascript
// Calculate expected time based on last update
const now = Date.now();
const timeSinceUpdate = (now - roomState.lastUpdated) / 1000;
const expectedTime = roomState.timestamp + timeSinceUpdate;

// Get current player time
const currentTime = player.getCurrentTime();

// Calculate drift
const drift = Math.abs(currentTime - expectedTime);

// Correct if drift exceeds threshold
if (drift > SYNC_THRESHOLD) {
  player.seekTo(expectedTime, true);
}
```

**Constants:**
- `SYNC_THRESHOLD = 0.5` seconds
- `DRIFT_CHECK_INTERVAL = 2000` ms

### 3. Latency Handling

**Network Latency Compensation:**
- Store `lastUpdated` timestamp with each state change
- Calculate elapsed time since update
- Add elapsed time to stored timestamp
- Result: compensates for network delay

**Example:**
```
Host pauses at 100.0s at time T0
Network delay: 200ms
Client receives update at T0 + 200ms
Client calculates: 100.0s + 0.2s = 100.2s
Client seeks to 100.2s (correct position)
```

### 4. Event Loop Prevention

**Problem:** Host updates → Firebase → Host receives own update → Updates again → Loop

**Solution:**
```javascript
const isUpdatingRef = useRef(false);

// Before updating
isUpdatingRef.current = true;
updateRoomState(newState);

// After short delay
setTimeout(() => {
  isUpdatingRef.current = false;
}, 100);

// In event handler
if (isUpdatingRef.current) return; // Skip own updates
```

### 5. Reconnection Handling

**Automatic Resync:**
- Firebase handles reconnection automatically
- `onValue` listener fires with latest state
- Client syncs to current position
- No manual reconnection logic needed

## Data Flow Diagrams

### Play Event Flow
```
User 1              Firebase              User 2
  │                    │                    │
  ├─ playVideo()       │                    │
  │                    │                    │
  ├─ onStateChange     │                    │
  │                    │                    │
  ├─ updateRoomState ─→│                    │
  │                    │                    │
  │                    ├─ onValue ─────────→│
  │                    │                    │
  │                    │                    ├─ syncToState()
  │                    │                    │
  │                    │                    ├─ playVideo()
```

### Seek Event Flow
```
User 1              Firebase              User 2
  │                    │                    │
  ├─ seekTo(120)       │                    │
  │                    │                    │
  ├─ updateRoomState ─→│                    │
  │   {timestamp:120}  │                    │
  │                    │                    │
  │                    ├─ onValue ─────────→│
  │                    │                    │
  │                    │                    ├─ getCurrentTime()
  │                    │                    │   (returns 100)
  │                    │                    │
  │                    │                    ├─ drift = 20s
  │                    │                    │
  │                    │                    ├─ seekTo(120)
```

### Video ID Extraction Flow
```
User Input                    extractVideoId()                  Result
  │                                  │                            │
  ├─ "https://youtube.com/          │                            │
  │   watch?v=dQw4w9WgXcQ"          │                            │
  │                                  │                            │
  │                                  ├─ Regex match URL          │
  │                                  │                            │
  │                                  ├─ Extract 11 chars ────────→ "dQw4w9WgXcQ"
  │                                  │                            │
  ├─ "dQw4w9WgXcQ?si=abc123"        │                            │
  │                                  │                            │
  │                                  ├─ No URL match             │
  │                                  │                            │
  │                                  ├─ Split on '?'             │
  │                                  │                            │
  │                                  ├─ Validate 11 chars ───────→ "dQw4w9WgXcQ"
```

## Performance Optimizations

### 1. Throttling
- Limit updates to every 500ms
- Prevent rapid Firebase writes
- Reduce bandwidth usage

### 2. Selective Syncing
- Only sync if drift > threshold
- Skip unnecessary seeks
- Reduce player disruption

### 3. Efficient Listeners
- Single Firebase listener per room
- Cleanup on unmount
- No memory leaks

## Security Considerations

**Current Implementation:**
- Open read/write access
- No authentication required
- Suitable for demo/prototype

**Production Recommendations:**
- Add Firebase Authentication
- Implement room ownership
- Rate limit updates
- Validate data server-side
- Add room expiration

## Scalability

**Current Limits:**
- Firebase free tier: 100 concurrent connections
- No server-side processing
- Client-side sync logic

**Scaling Strategies:**
- Upgrade Firebase plan
- Add CDN for static assets
- Implement room sharding
- Add load balancing

## Key Features Implemented

1. **Collaborative Control** - Everyone can control playback
2. **Video Queue** - Add multiple videos, auto-play next
3. **Smart URL Parsing** - Handles all YouTube URL formats
4. **Real-time Chat** - With emoji picker support
5. **Presence Detection** - See who's online with heartbeat system
6. **Drift Correction** - Automatic sync every 2 seconds
7. **Mobile Responsive** - Works on all devices

## Future Enhancements

1. **WebRTC P2P Sync** - Direct peer connections
2. **Voice Chat** - Real-time audio communication
3. **Reactions** - Emoji reactions during playback
4. **Watch History** - Track watched content
5. **User Profiles** - Persistent user data
6. **HTML5 Video** - Support non-YouTube content
7. **Mobile Apps** - React Native implementation
8. **Room Passwords** - Private rooms with authentication
