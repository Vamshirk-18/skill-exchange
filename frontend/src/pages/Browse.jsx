import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Browse = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [swapForm, setSwapForm] = useState({ senderSkill: '', receiverSkill: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async (skill = '') => {
    setLoading(true);
    try {
      const { data } = await API.get(`/profile/all${skill ? `?skill=${skill}` : ''}`);
      const filtered = data.filter(s => s._id !== user?._id);

      // Fetch ratings for each student
      const withRatings = await Promise.all(filtered.map(async (student) => {
        try {
          const { data: ratingData } = await API.get(`/rating/${student._id}`);
          return { ...student, avgRating: ratingData.average, totalRatings: ratingData.total };
        } catch {
          return { ...student, avgRating: 0, totalRatings: 0 };
        }
      }));

      setStudents(withRatings);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const sendRequest = async () => {
    if (!swapForm.senderSkill || !swapForm.receiverSkill) {
      toast.error('Please fill in both skills!');
      return;
    }
    setSending(true);
    try {
      await API.post('/swap/send', { receiverId: modalUser._id, ...swapForm });
      toast.success('Swap request sent! 🎉');
      setModalUser(null);
      setSwapForm({ senderSkill: '', receiverSkill: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Browse Students</h1>
        <p className="text-gray-500">Find students to swap skills with</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input className="flex-1 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="🔍 Search by skill (e.g. React, Python, DSA)"
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold">Search</button>
        <button type="button" onClick={() => { setSearch(''); fetchStudents(); }}
          className="bg-gray-100 px-4 py-3 rounded-xl hover:bg-gray-200 transition">Clear</button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No students found. Try a different skill!</p>
            </div>
          )}
          {students.map(student => (
            <div key={student._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                  {student.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{student.name}</h3>
                  <p className="text-xs text-gray-500">🎓 {student.college || 'Student'}</p>
                  {student.avgRating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(student.avgRating))}</span>
                      <span className="text-xs text-gray-500">{student.avgRating} ({student.totalRatings} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              {student.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{student.bio}</p>}
              <div className="mb-3">
                <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wide">Can Teach</p>
                <div className="flex flex-wrap gap-1">
                  {student.skillsToTeach?.length > 0
                    ? student.skillsToTeach.map(s => (
                        <span key={s} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full">{s}</span>
                      ))
                    : <span className="text-gray-400 text-xs">Not listed</span>
                  }
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide">Wants to Learn</p>
                <div className="flex flex-wrap gap-1">
                  {student.skillsToLearn?.length > 0
                    ? student.skillsToLearn.map(s => (
                        <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-1 rounded-full">{s}</span>
                      ))
                    : <span className="text-gray-400 text-xs">Not listed</span>
                  }
                </div>
              </div>
              <button onClick={() => setModalUser(student)}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">
                🤝 Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Request Swap 🤝</h3>
            <p className="text-gray-500 text-sm mb-5">with <strong>{modalUser.name}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Skill you'll teach</label>
                <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. React" value={swapForm.senderSkill}
                  onChange={e => setSwapForm({...swapForm, senderSkill: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Skill you want to learn</label>
                <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Python" value={swapForm.receiverSkill}
                  onChange={e => setSwapForm({...swapForm, receiverSkill: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Hey! I'd love to swap skills with you..."
                  rows={3} value={swapForm.message}
                  onChange={e => setSwapForm({...swapForm, message: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={sendRequest} disabled={sending}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-60">
                {sending ? 'Sending...' : 'Send Request 🚀'}
              </button>
              <button onClick={() => setModalUser(null)}
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

export default Browse;