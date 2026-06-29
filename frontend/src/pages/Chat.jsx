import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const socket = io('https://skillswap-backend-379k.onrender.com', {
  transports: ['websocket', 'polling'],
  secure: true,
});

const Chat = () => {
  const { swapId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [swapInfo, setSwapInfo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit('join_room', swapId);

    API.get(`/messages/${swapId}`)
      .then(({ data }) => setMessages(data))
      .catch(() => navigate('/dashboard'));

    API.get('/swap/received').then(({ data }) => {
      const swap = data.find(s => s._id === swapId);
      if (swap) setSwapInfo({ name: swap.sender?.name, skill: swap.senderSkill });
    });
    API.get('/swap/sent').then(({ data }) => {
      const swap = data.find(s => s._id === swapId);
      if (swap) setSwapInfo({ name: swap.receiver?.name, skill: swap.receiverSkill });
    });

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => { socket.off('receive_message'); };
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
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition text-xl p-1">←</button>
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {swapInfo?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-sm">{swapInfo?.name || 'Chat'}</h2>
          <p className="text-xs text-gray-500">Skill Swap Partner 🤝</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender._id === user._id || msg.sender === user._id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                isMe
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
              }`}>
                {!isMe && <p className="text-xs font-semibold text-indigo-600 mb-1">{msg.sender.name}</p>}
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

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-3 flex gap-2">
        <input
          className="flex-1 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm">
          🚀
        </button>
      </div>
    </div>
  );
};

export default Chat;
