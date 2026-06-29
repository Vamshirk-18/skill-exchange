import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusStyles = {
  proposed: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border border-blue-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabels = {
  proposed: '⏳ Proposed',
  confirmed: '✅ Confirmed',
  completed: '🎓 Completed',
  cancelled: '❌ Cancelled',
};

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    swapRequestId: '',
    scheduledAt: '',
    mode: 'online',
    meetingLink: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sessionsRes, receivedRes, sentRes] = await Promise.all([
        API.get('/session/mine'),
        API.get('/swap/received'),
        API.get('/swap/sent'),
      ]);
      setSessions(sessionsRes.data);
      const allAccepted = [
        ...receivedRes.data.filter(s => s.status === 'accepted'),
        ...sentRes.data.filter(s => s.status === 'accepted'),
      ];
      setAcceptedSwaps(allAccepted);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async () => {
    if (!form.swapRequestId || !form.scheduledAt) {
      toast.error('Please select a swap and date/time');
      return;
    }
    try {
      await API.post('/session/propose', form);
      toast.success('Session proposed! 🎉');
      setShowForm(false);
      setForm({ swapRequestId: '', scheduledAt: '', mode: 'online', meetingLink: '', location: '', notes: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose');
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.put(`/session/${id}/${action}`);
      toast.success(
        action === 'confirm' ? 'Session confirmed! ✅' :
        action === 'complete' ? 'Marked as completed! 🎓' :
        'Session cancelled'
      );
      fetchAll();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const getPartnerName = (session) => {
    const swap = session.swapRequest;
    if (!swap) return 'Unknown';
    const isMe = (id) => id?.toString() === user?._id;
    if (isMe(swap.sender?._id)) return swap.receiver?.name;
    return swap.sender?.name;
  };

  const getSkillInfo = (session) => {
    const swap = session.swapRequest;
    if (!swap) return '';
    const isMe = (id) => id?.toString() === user?._id;
    if (isMe(swap.sender?._id)) return `You teach ${swap.senderSkill} · Learn ${swap.receiverSkill}`;
    return `You teach ${swap.receiverSkill} · Learn ${swap.senderSkill}`;
  };

  const getSwapLabel = (swap) => {
    const isMe = (id) => id?.toString() === user?._id;
    const partner = isMe(swap.sender?._id || swap.sender) ? swap.receiver : swap.sender;
    const partnerName = partner?.name || 'Partner';
    return `Swap with ${partnerName}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Sessions</h1>
          <p className="text-gray-500 text-sm">Schedule and track your skill swap sessions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm"
        >
          + Schedule Session
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Propose a Session</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Swap Partner</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                value={form.swapRequestId}
                onChange={e => setForm({ ...form, swapRequestId: e.target.value })}
              >
                <option value="">-- Choose a swap --</option>
                {acceptedSwaps.map(swap => (
                  <option key={swap._id} value={swap._id}>{getSwapLabel(swap)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                value={form.scheduledAt}
                onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mode</label>
              <div className="flex gap-3">
                {['online', 'offline'].map(m => (
                  <button
                    key={m}
                    onClick={() => setForm({ ...form, mode: m })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition ${
                      form.mode === m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {m === 'online' ? '💻 Online' : '📍 Offline'}
                  </button>
                ))}
              </div>
            </div>
            {form.mode === 'online' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meeting Link <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  placeholder="https://meet.google.com/xxx or Zoom link"
                  value={form.meetingLink}
                  onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  placeholder="e.g. Library, Room 204"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                rows={2}
                placeholder="Topics to cover, bring materials, etc."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handlePropose} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">
                Propose Session 🚀
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500">No sessions scheduled yet.</p>
          <p className="text-gray-400 text-sm mt-1">Accept a swap request first, then schedule a session!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-gray-800">Session with {getPartnerName(session)}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{getSkillInfo(session)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyles[session.status]}`}>
                  {statusLabels[session.status]}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3 text-sm">
                <p className="text-gray-700">
                  📅 <strong>{new Date(session.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  {' · '}
                  🕐 {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-700">
                  {session.mode === 'online' ? '💻 Online' : '📍 Offline'}
                  {session.meetingLink && (
                    <> · <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Join Meeting</a></>
                  )}
                  {session.location && <> · {session.location}</>}
                </p>
                {session.notes && <p className="text-gray-500 italic">📝 {session.notes}</p>}
                <p className="text-gray-400 text-xs">Proposed by {session.proposedBy?.name}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {session.status === 'proposed' && session.proposedBy?._id !== user?._id && (
                  <button onClick={() => handleAction(session._id, 'confirm')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
                    ✅ Confirm Session
                  </button>
                )}
                {session.status === 'proposed' && session.proposedBy?._id === user?._id && (
                  <p className="text-sm text-yellow-600 font-medium py-2">⏳ Waiting for partner to confirm...</p>
                )}
                {session.status === 'confirmed' && (
                  <button onClick={() => handleAction(session._id, 'complete')}
                    className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">
                    🎓 Mark as Completed
                  </button>
                )}
                {(session.status === 'proposed' || session.status === 'confirmed') && (
                  <button onClick={() => handleAction(session._id, 'cancel')}
                    className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
