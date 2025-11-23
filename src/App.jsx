import { useState } from 'react';
import { SyncRoom } from './components/SyncRoom';
import { Navbar } from './components/Navbar';
import { LogIn, Sparkles, Users, Video } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 opacity-90"></div>
      
      {/* Minimalist grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Soft glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl"></div>
      
      {/* Navbar */}
      <Navbar showParticipants={false} />
      
      <div className="flex items-center justify-center relative z-10 min-h-screen p-6">
        <div className="w-full max-w-[420px] mx-auto space-y-8">
          {/* Hero Section - Clean & Minimal */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-white">
              mSYNQ
            </h1>
            <p className="text-sm text-zinc-400 font-light">
              Watch together, perfectly synced
            </p>
          </div>

          {/* Main Card - Ultra Clean */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800/50 shadow-2xl space-y-6">
            {/* Username Input */}
            <div className="space-y-3">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && usernameInput.trim() && createRoom()}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
              />
            </div>

            {/* Create Room Button - Minimal & Elegant */}
            <button
              onClick={createRoom}
              disabled={!usernameInput.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-indigo-500/20"
            >
              Create Room
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-slate-600 bg-slate-900/50">or</span>
              </div>
            </div>

            {/* Room ID Input */}
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && roomInput.trim() && usernameInput.trim() && joinRoom()}
              placeholder="Room ID"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
            />

            {/* Join Room Button - Subtle */}
            <button
              onClick={joinRoom}
              disabled={!roomInput.trim() || !usernameInput.trim()}
              className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-700 disabled:cursor-not-allowed transition-all text-sm border border-slate-700/50"
              title={!usernameInput.trim() ? "Enter your name first" : !roomInput.trim() ? "Enter a room ID" : "Join room"}
            >
              Join Room
            </button>
          </div>

          {/* Footer - Minimal */}
          <div className="text-center">
            <p className="text-xs text-zinc-600">
              No signup required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
