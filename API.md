# API Documentation

## Firebase Realtime Database API

### Room State Schema

```typescript
interface RoomState {
  videoId: string;        // YouTube video ID
  timestamp: number;      // Current playback position in seconds
  isPlaying: boolean;     // Whether video is playing
  lastUpdated: number;    // Unix timestamp in milliseconds
  hostId: string;        // User ID of the room host
  createdAt: number;     // Room creation timestamp
}
```

### Message Schema

```typescript
interface Message {
  userId: string;        // Sender's user ID
  username: string;      // Sender's display name
  text: string;         // Message content
  timestamp: number;    // Unix timestamp in milliseconds
}
```

### Database Paths

```
/rooms/{roomId}
  - videoId: string
  - timestamp: number
  - isPlaying: boolean
  - lastUpdated: number
  - hostId: string
  - createdAt: number
  
/rooms/{roomId}/messages/{messageId}
  - userId: string
  - username: string
  - text: string
  - timestamp: number
```

## React Hooks API

### useSyncedPlayer

Main hook for synchronization logic.

```typescript
function useSyncedPlayer(
  roomId: string,
  userId: string,
  isHost: boolean
): UseSyncedPlayerReturn
```

**Parameters:**
- `roomId` - Unique room identifier
- `userId` - Current user's unique ID
- `isHost` - Whether user is the room host

**Returns:**
```typescript
interface UseSyncedPlayerReturn {
  roomState: RoomState | null;
  isConnected: boolean;
  playerRef: React.RefObject<YouTubePlayer>;
  updateRoomState: (updates: Partial<RoomState>) => Promise<void>;
  createRoom: (videoId: string) => Promise<void>;
  isUpdatingRef: React.RefObject<boolean>;
}
```

**Example:**
```javascript
const {
  roomState,
  isConnected,
  playerRef,
  updateRoomState,
  createRoom
} = useSyncedPlayer('room_abc123', 'user_xyz', true);

// Update playback state
await updateRoomState({
  isPlaying: true,
  timestamp: 120.5
});
```

## Component APIs

### YouTubePlayer

YouTube player wrapper component.

```typescript
interface YouTubePlayerProps {
  videoId: string;
  onReady?: (event: YouTubeEvent) => void;
  onStateChange?: (event: YouTubeEvent) => void;
  onPlaybackRateChange?: (event: YouTubeEvent) => void;
  playerRef: React.RefObject<YouTubePlayer>;
}
```

**Example:**
```jsx
<YouTubePlayer
  videoId="dQw4w9WgXcQ"
  onReady={handleReady}
  onStateChange={handleStateChange}
  playerRef={playerRef}
/>
```

### RoomControls

Playback control component.

```typescript
interface RoomControlsProps {
  isHost: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  currentTime?: number;
}
```

**Example:**
```jsx
<RoomControls
  isHost={true}
  isPlaying={false}
  onPlay={handlePlay}
  onPause={handlePause}
  onSeek={handleSeek}
  currentTime={45.2}
/>
```

### Chat

Chat component for room communication.

```typescript
interface ChatProps {
  roomId: string;
  userId: string;
  username: string;
}
```

**Example:**
```jsx
<Chat
  roomId="room_abc123"
  userId="user_xyz"
  username="Alice"
/>
```

### SyncRoom

Main room container component.

```typescript
interface SyncRoomProps {
  roomId: string;
  userId: string;
  username: string;
  isHost: boolean;
}
```

**Example:**
```jsx
<SyncRoom
  roomId="room_abc123"
  userId="user_xyz"
  username="Alice"
  isHost={true}
/>
```

## YouTube Player API

### Player Methods

```typescript
interface YouTubePlayer {
  // Playback controls
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  
  // Video loading
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  
  // Getters
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): PlayerState;
  getVideoData(): VideoData;
  
  // Volume
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
}
```

### Player States

```typescript
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5
}
```

## Firebase Operations

### Read Operations

```javascript
import { ref, onValue } from 'firebase/database';

// Listen to room state
const roomRef = ref(database, `rooms/${roomId}`);
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  console.log('Room state:', data);
});
```

### Write Operations

```javascript
import { ref, set, update } from 'firebase/database';

// Create room
const roomRef = ref(database, `rooms/${roomId}`);
await set(roomRef, {
  videoId: 'dQw4w9WgXcQ',
  timestamp: 0,
  isPlaying: false,
  lastUpdated: Date.now(),
  hostId: userId
});

// Update room
await update(roomRef, {
  isPlaying: true,
  timestamp: 120.5,
  lastUpdated: Date.now()
});
```

### Chat Operations

```javascript
import { ref, push } from 'firebase/database';

// Send message
const messagesRef = ref(database, `rooms/${roomId}/messages`);
await push(messagesRef, {
  userId: 'user_xyz',
  username: 'Alice',
  text: 'Hello!',
  timestamp: Date.now()
});
```

## Sync Algorithm API

### Drift Calculation

```javascript
function calculateDrift(
  currentTime: number,
  roomState: RoomState
): number {
  const now = Date.now();
  const elapsed = (now - roomState.lastUpdated) / 1000;
  const expectedTime = roomState.timestamp + elapsed;
  return Math.abs(currentTime - expectedTime);
}
```

### Sync Decision

```javascript
function shouldSync(drift: number): boolean {
  return drift > SYNC_THRESHOLD; // 0.5 seconds
}
```

### Sync Execution

```javascript
async function syncPlayer(
  player: YouTubePlayer,
  roomState: RoomState
): Promise<void> {
  const now = Date.now();
  const elapsed = (now - roomState.lastUpdated) / 1000;
  const targetTime = roomState.timestamp + elapsed;
  
  // Seek if needed
  const currentTime = player.getCurrentTime();
  if (Math.abs(currentTime - targetTime) > SYNC_THRESHOLD) {
    player.seekTo(targetTime, true);
  }
  
  // Sync play/pause
  const currentState = player.getPlayerState();
  if (roomState.isPlaying && currentState !== PlayerState.PLAYING) {
    player.playVideo();
  } else if (!roomState.isPlaying && currentState === PlayerState.PLAYING) {
    player.pauseVideo();
  }
}
```

## Constants

```javascript
// Sync configuration
export const SYNC_THRESHOLD = 0.5;           // seconds
export const DRIFT_CHECK_INTERVAL = 2000;    // milliseconds
export const UPDATE_COOLDOWN = 500;          // milliseconds
export const MAX_MESSAGES = 50;              // chat history limit

// Player configuration
export const PLAYER_OPTS = {
  height: '100%',
  width: '100%',
  playerVars: {
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
    rel: 0
  }
};
```

## Error Handling

### Firebase Errors

```javascript
try {
  await updateRoomState(newState);
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    console.error('Database permission denied');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network connection failed');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Player Errors

```javascript
try {
  player.playVideo();
} catch (error) {
  console.error('Player error:', error);
  // Retry or show error to user
}
```

## Events

### Room Events

```typescript
type RoomEvent = 
  | { type: 'play', timestamp: number }
  | { type: 'pause', timestamp: number }
  | { type: 'seek', timestamp: number }
  | { type: 'videoChange', videoId: string }
  | { type: 'userJoin', userId: string }
  | { type: 'userLeave', userId: string };
```

### Player Events

```typescript
interface YouTubeEvent {
  target: YouTubePlayer;
  data: PlayerState;
}
```

## Rate Limits

Firebase Realtime Database (Free Tier):
- Concurrent connections: 100
- GB stored: 1 GB
- GB downloaded: 10 GB/month
- Writes: Unlimited (but throttled)

Recommendations:
- Throttle updates to max 2/second
- Batch multiple changes
- Use transactions for critical updates
