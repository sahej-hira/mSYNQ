import { useState } from 'react';
import { SyncRoom } from './components/SyncRoom';
import { LogIn } from 'lucide-react';

function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [isHost, setIsHost] = useState(false);
  const [joined, setJoined] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  const createRoom = () => {
    if (!usernameInput.trim()) return;
    const newRoomId = `room_${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(newRoomId);
    setUsername(usernameInput.trim());
    setIsHost(true);
    setJoined(true);
  };

  const joinRoom = () => {
    if (!roomInput.trim() || !usernameInput.trim()) return;
    setRoomId(roomInput.trim());
    setUsername(usernameInput.trim());
    setIsHost(false);
    setJoined(true);
  };

  if (joined) {
    return <SyncRoom roomId={roomId} userId={userId} username={username} isHost={isHost} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2 flex items-center justify-center gap-3">
            <img src="/icon.png" alt="mSYNQ" style={{ height: '1em', width: '1em' }} className="object-contain" />
            <span>mSYNQ</span>
          </h1>
          <p className="text-gray-300">Watch YouTube together in perfect sync</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && usernameInput.trim() && createRoom()}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t border-gray-700 pt-6">
            <button
              onClick={createRoom}
              disabled={!usernameInput.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Create New Room
            </button>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium mb-2">Join Existing Room</label>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && roomInput.trim() && usernameInput.trim() && joinRoom()}
              placeholder="Enter room ID"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={joinRoom}
              disabled={!roomInput.trim() || !usernameInput.trim()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2"
              title={!usernameInput.trim() ? "Please enter your name first" : !roomInput.trim() ? "Please enter a room ID" : "Join room"}
            >
              <LogIn size={20} />
              Join Room
            </button>
            {(!roomInput.trim() || !usernameInput.trim()) && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                {!usernameInput.trim() ? "Enter your name above to continue" : "Enter a room ID to join"}
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Create a room or join with a room ID to start watching together</p>
        </div>
      </div>
    </div>
  );
}

export default App;
