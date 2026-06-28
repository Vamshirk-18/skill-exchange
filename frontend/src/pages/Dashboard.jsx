import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState('received');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 0, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/swap/received').then(({ data }) => setReceived(data));
    API.get('/swap/sent').then(({ data }) => setSent(data));
  }, []);

  const respond = async (id, status) => {
    try {
      await API.put(`/swap/${id}/respond`, { status });
      setReceived(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(status === 'accepted' ? 'Swap accepted! 🎉' : 'Request rejected');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const cancel = async (id) => {
    try {
      await API.delete(`/swap/${id}`);
      setSent(prev => prev.filter(r => r._id !== id));
      toast.success('Request cancelled');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const submitRating = async () => {
    if (ratingForm.rating === 0) {
      toast.error('Please select a star rating!');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/rating/give', {
        swapRequestId: ratingModal.swapId,
        revieweeId: ratingModal.revieweeId,
        rating: ratingForm.rating,
        review: ratingForm.review,
      });
      toast.success('Rating submitted! ⭐');
      setRatingModal(null);
      setRatingForm({ rating: 0, review: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      accepted: 'bg-green-100 text-green-700 border border-green-200',
      rejected: 'bg-red-100 text-red-700 border border-red-200'
    };
    return (
      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${styles[status]}`}>
        {status === 'pending' ? '⏳ Pending' : status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-gray-500">Manage your skill swap requests</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('received')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition ${tab === 'received' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          📥 Received ({received.length})
        </button>
        <button onClick={() => setTab('sent')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition ${tab === 'sent' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          📤 Sent ({sent.length})
        </button>
      </div>

      {tab === 'received' && (
        <div className="space-y-4">
          {received.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500">No requests received yet</p>
            </div>
          )}
          {received.map(req => (
            <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {req.sender?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{req.sender?.name}</h3>
                    <p className="text-xs text-gray-500">{req.sender?.college}</p>
                  </div>
                </div>
                {statusBadge(req.status)}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                <p className="text-sm text-gray-600">🎓 They'll teach: <strong>{req.senderSkill}</strong></p>
                <p className="text-sm text-gray-600">📚 They want: <strong>{req.receiverSkill}</strong></p>
                {req.message && <p className="text-sm text-gray-500 italic">"{req.message}"</p>}
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => respond(req._id, 'accepted')}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition font-semibold text-sm">
                    ✅ Accept
                  </button>
                  <button onClick={() => respond(req._id, 'rejected')}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl hover:bg-red-200 transition font-semibold text-sm">
                    ❌ Reject
                  </button>
                </div>
              )}
              {req.status === 'accepted' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => navigate(`/chat/${req._id}`)}
                    className="flex-1 bg-indigo-50 text-indigo-600 border border-indigo-200 py-2 rounded-xl hover:bg-indigo-100 transition font-semibold text-sm">
                    💬 Chat
                  </button>
                  <button onClick={() => setRatingModal({ swapId: req._id, revieweeId: req.sender._id, name: req.sender.name })}
                    className="flex-1 bg-yellow-50 text-yellow-600 border border-yellow-200 py-2 rounded-xl hover:bg-yellow-100 transition font-semibold text-sm">
                    ⭐ Rate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'sent' && (
        <div className="space-y-4">
          {sent.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📤</div>
              <p className="text-gray-500">No requests sent yet. Browse students to get started!</p>
            </div>
          )}
          {sent.map(req => (
            <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                    {req.receiver?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">To: {req.receiver?.name}</h3>
                    <p className="text-xs text-gray-500">{req.receiver?.college}</p>
                  </div>
                </div>
                {statusBadge(req.status)}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                <p className="text-sm text-gray-600">🎓 You'll teach: <strong>{req.senderSkill}</strong></p>
                <p className="text-sm text-gray-600">📚 You want: <strong>{req.receiverSkill}</strong></p>
                {req.message && <p className="text-sm text-gray-500 italic">"{req.message}"</p>}
              </div>
              {req.status === 'pending' && (
                <button onClick={() => cancel(req._id)}
                  className="w-full bg-red-50 text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-100 transition font-semibold text-sm">
                  Cancel Request
                </button>
              )}
              {req.status === 'accepted' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => navigate(`/chat/${req._id}`)}
                    className="flex-1 bg-indigo-50 text-indigo-600 border border-indigo-200 py-2 rounded-xl hover:bg-indigo-100 transition font-semibold text-sm">
                    💬 Chat
                  </button>
                  <button onClick={() => setRatingModal({ swapId: req._id, revieweeId: req.receiver._id, name: req.receiver.name })}
                    className="flex-1 bg-yellow-50 text-yellow-600 border border-yellow-200 py-2 rounded-xl hover:bg-yellow-100 transition font-semibold text-sm">
                    ⭐ Rate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Rate {ratingModal.name}</h3>
            <p className="text-gray-500 text-sm mb-5">How was your skill swap experience?</p>
            <div className="flex justify-center mb-5">
              <StarRating rating={ratingForm.rating} onRate={(r) => setRatingForm({...ratingForm, rating: r})} size="lg" />
            </div>
            <textarea className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
              placeholder="Write a review... (optional)" rows={3}
              value={ratingForm.review} onChange={e => setRatingForm({...ratingForm, review: e.target.value})} />
            <div className="flex gap-3">
              <button onClick={submitRating} disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Rating ⭐'}
              </button>
              <button onClick={() => setRatingModal(null)}
                className="flex-1 bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;