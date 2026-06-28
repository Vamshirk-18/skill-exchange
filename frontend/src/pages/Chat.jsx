import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000');

const Chat = () => {
  const { swapId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [swapInfo, setSwapInfo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Join the swap room
    socket.emit('join_room', swapId);

    // Load existing messages
    API.get(`/messages/${swapId}`)
      .then(({ data }) => setMessages(data))
      .catch(() => navigate('/dashboard'));

    // Load swap info
    API.get('/swap/received').then(({ data }) => {
      const swap = data.find(s => s._id === swapId);
      if (swap) setSwapInfo({ name: swap.sender?.name, skill: swap.senderSkill });
    });
    API.get('/swap/sent').then(({ data }) => {
      const swap = data.find(s => s._id === swapId);
      if (swap) setSwapInfo({ name: swap.receiver?.name, skill: swap.receiverSkill });
    });

    // Listen for new messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [swapId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit('send_message', {
      swapId,
      senderId: user._id,
      text: text.trim(),
    });
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition text-xl">←</button>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {swapInfo?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="font-bold text-gray-800">{swapInfo?.name || 'Chat'}</h2>
          <p className="text-xs text-gray-500">Skill Swap Partner 🤝</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-y-auto mb-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-500">No messages yet. Say hello!</p>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((msg, i) => {
            const isMe = msg.sender._id === user._id || msg.sender === user._id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {!isMe && (
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{msg.sender.name}</p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex gap-3">
        <input
          className="flex-1 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          placeholder="Type a message... (Enter to send)"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={sendMessage}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm">
          Send 🚀
        </button>
      </div>
    </div>
  );
};

export default Chat;