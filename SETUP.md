# SyncPlay - Synchronized Playback App

A real-time synchronized video playback application that allows multiple users to watch YouTube videos together in perfect sync.

## Features

✅ **Real-time Synchronization** - All users stay synced within ±200ms
✅ **YouTube Integration** - Full YouTube player support with iFrame API
✅ **Host Controls** - Host can play, pause, seek, and change videos
✅ **Auto Drift Correction** - Automatically corrects playback drift
✅ **Live Chat** - Built-in chat for communication
✅ **Room System** - Create or join rooms with unique IDs
✅ **Connection Status** - Visual indicators for sync status

## Architecture

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **react-youtube** - YouTube player integration
- **lucide-react** - Icons

### Backend
- **Firebase Realtime Database** - Real-time data sync
- WebSocket-like pub/sub for instant updates

### Sync Mechanism

The app maintains a shared room state:
```json
{
  "videoId": "dQw4w9WgXcQ",
  "timestamp": 123.45,
  "isPlaying": true,
  "lastUpdated": 1710000000000,
  "hostId": "user_abc123"
}
```

**How Sync Works:**
1. Host controls trigger state updates in Firebase
2. All clients listen to state changes
3. Non-host clients sync their players to match room state
4. Drift correction runs every 2 seconds
5. If drift > 0.5s, player seeks to correct position

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Realtime Database**
4. Set database rules to:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

5. Get your Firebase config from Project Settings > General > Your apps

### 2. Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** 
- Never commit your `.env` file to Git
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template for others

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Creating a Room
1. Enter your name
2. Click "Create New Room"
3. Share the room ID with others
4. Load a YouTube video (URL or ID)
5. Control playback - everyone stays synced!

### Joining a Room
1. Enter your name
2. Enter the room ID
3. Click "Join Room"
4. Watch in sync with the host

## Technical Details

### Drift Correction Algorithm

```javascript
const currentTime = player.getCurrentTime();
const expectedTime = roomState.timestamp + (now - roomState.lastUpdated) / 1000;
const drift = Math.abs(currentTime - expectedTime);

if (drift > SYNC_THRESHOLD) {
  player.seekTo(expectedTime, true);
}
```

### Event Loop Prevention

- `isUpdatingRef` prevents feedback loops
- `lastUpdateRef` throttles rapid updates
- 500ms cooldown between sync operations

### Latency Handling

- Timestamp includes `lastUpdated` for drift calculation
- Expected time = stored timestamp + elapsed time
- Compensates for network latency automatically

## File Structure

```
src/
├── components/
│   ├── YouTubePlayer.jsx    # YouTube player wrapper
│   ├── RoomControls.jsx     # Playback controls
│   ├── Chat.jsx             # Chat component
│   └── SyncRoom.jsx         # Main room component
├── hooks/
│   └── useSyncedPlayer.js   # Sync logic hook
├── firebase.js              # Firebase config
├── App.jsx                  # Entry point
└── main.jsx                 # React root

```

## Advanced Features (Future)

- [ ] WebRTC P2P sync (no server needed)
- [ ] Voice chat integration
- [ ] Playlist support
- [ ] Watch history
- [ ] User authentication
- [ ] HTML5 video/audio file support
- [ ] Spotify integration
- [ ] Screen sharing

## Troubleshooting

**Players not syncing?**
- Check Firebase connection status
- Verify database rules allow read/write
- Check browser console for errors

**High drift?**
- Reduce SYNC_THRESHOLD in useSyncedPlayer.js
- Check network latency
- Ensure stable internet connection

**YouTube videos not loading?**
- Verify video ID is correct
- Check if video allows embedding
- Try a different video

## License

MIT
