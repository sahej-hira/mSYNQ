import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, query, limitToLast } from 'firebase/database';
import { database } from '../firebase';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export const Chat = ({ roomId, userId, username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Generate consistent color for user
  const getUserColor = (username) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-orange-500',
      'from-indigo-500 to-purple-500',
    ];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = query(
      ref(database, `rooms/${roomId}/messages`),
      limitToLast(50)
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.values(data);
        setMessages(messageList);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;

    const messagesRef = ref(database, `rooms/${roomId}/messages`);
    await push(messagesRef, {
      userId,
      username,
      text: input.trim(),
      timestamp: Date.now()
    });

    setInput('');
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={14} className="text-indigo-400" />
            <h3 className="font-medium text-sm text-slate-300">Chat</h3>
          </div>
          <span className="text-xs text-slate-600">{messages.length}</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
            <Send size={32} className="mb-3 opacity-20" />
            <p className="text-xs">No messages yet</p>
            <p className="text-[10px] mt-1 text-slate-700">Say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.userId === userId;
            const userColor = getUserColor(msg.username);
            
            return (
              <div 
                key={idx} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <span className={`text-[10px] font-medium text-slate-500 px-2`}>
                    {isOwnMessage ? 'You' : msg.username}
                  </span>
                  <div className={`px-3 py-2 rounded-xl ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
                  }`}>
                    <p className="text-xs break-words leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-700 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-800/50 bg-slate-900/30 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full mb-2 right-4 z-50 shadow-2xl">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="dark"
              width={280}
              height={350}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg transition-colors ${
              showEmojiPicker 
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' 
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-500 border border-slate-700/50'
            }`}
            title="Add emoji"
          >
            <Smile size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message..."
            className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
