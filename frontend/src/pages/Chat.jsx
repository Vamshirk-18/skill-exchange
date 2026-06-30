import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const socket = io('https://skillswap-backend-379k.onrender.com', {
  transports: ['websocket', 'polling'],
  secure: true,
});

const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
};

const Chat = () => {
  const { swapId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [swapInfo, setSwapInfo] = useState(null);
  const [swap, setSwap] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const bottomRef = useRef(null);

  const loadSwap = () => {
    API.get('/swap/received').then(({ data }) => {
      const found = data.find(s => s._id === swapId);
      if (found) {
        setSwapInfo({ name: found.sender?.name, skill: found.senderSkill });
        setSwap(found);
      }
    });
    API.get('/swap/sent').then(({ data }) => {
      const found = data.find(s => s._id === swapId);
      if (found) {
        setSwapInfo({ name: found.receiver?.name, skill: found.receiverSkill });
        setSwap(found);
      }
    });
  };

  useEffect(() => {
    socket.emit('join_room', swapId);

    API.get(`/messages/${swapId}`)
      .then(({ data }) => setMessages(data))
      .catch(() => navigate('/dashboard'));

    loadSwap();

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

  const proposeSession = async () => {
    if (!sessionDate) {
      toast.error('Pick a date and time first!');
      return;
    }
    try {
      const { data } = await API.put(`/swap/${swapId}/propose-session`, { dateTime: sessionDate });
      setSwap(data);
      toast.success('Session proposed! Waiting for confirmation 📅');
      setShowSchedule(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose session');
    }
  };

  const confirmSession = async () => {
    try {
      const meetLink = generateMeetLink();
      const { data } = await API.put(`/swap/${swapId}/confirm-session`, { meetLink });
      setSwap(data);
      socket.emit('send_message', {
        swapId,
        senderId: user._id,
        text: `📅 Session confirmed! Join here: ${meetLink}`,
      });
      toast.success('Session confirmed! Meet link shared 🎥');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm session');
    }
  };

  const isProposer = swap?.session?.proposedBy === user._id || swap?.session?.proposedBy?._id === user._id;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition text-xl p-1">←</button>
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {swapInfo?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 text-sm">{swapInfo?.name || 'Chat'}</h2>
          <p className="text-xs text-gray-500">Skill Swap Partner 🤝</p>
        </div>
        <button onClick={() => setShowSchedule(!showSchedule)}
          className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition">
          📅 Schedule
        </button>
      </div>

      {/* Session banner */}
      {swap?.session?.dateTime && (
        <div className={`px-4 py-3 text-sm ${
          swap.session.confirmed ? 'bg-green-50 border-b border-green-200' : 'bg-yellow-50 border-b border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${swap.session.confirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                {swap.session.confirmed ? '✅ Session Confirmed' : '⏳ Session Proposed'}
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                {new Date(swap.session.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            {!swap.session.confirmed && !isProposer && (
              <button onClick={confirmSession}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                Confirm & Get Meet Link
              </button>
            )}
          </div>
          {swap.session.confirmed && swap.session.meetLink && (
            <a href={swap.session.meetLink} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 bg-white border border-green-300 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
              🎥 Join Google Meet
            </a>
          )}
        </div>
      )}

      {/* Schedule picker */}
      {showSchedule && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex gap-2 items-center">
          <input
            type="datetime-local"
            className="flex-1 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
          />
          <button onClick={proposeSession}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            Propose
          </button>
        </div>
      )}

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
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
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
