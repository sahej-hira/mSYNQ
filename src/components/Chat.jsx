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
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-gray-700 p-2 rounded">
            <span className="text-blue-400 text-sm font-semibold">
              {msg.username}:
            </span>
            <span className="text-gray-200 ml-2">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full mb-2 right-4 z-50">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="dark"
              width={320}
              height={400}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            title="Add emoji"
          >
            <Smile size={20} className={showEmojiPicker ? 'text-yellow-400' : 'text-gray-400'} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
