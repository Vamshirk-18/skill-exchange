import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [form, setForm] = useState({ bio: '', college: '', skillsToTeach: '', skillsToLearn: '' });
  const { user } = useAuth();

  useEffect(() => {
    API.get('/profile/me').then(({ data }) => {
      setForm({
        bio: data.bio || '',
        college: data.college || '',
        skillsToTeach: data.skillsToTeach?.join(', ') || '',
        skillsToLearn: data.skillsToLearn?.join(', ') || '',
      });
    });
  }, []);

  const handleSave = async () => {
    try {
      await API.put('/profile/update', {
        bio: form.bio,
        college: form.college,
        skillsToTeach: form.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Profile updated! ✅');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">College</label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="Your college name"
              value={form.college} onChange={e => setForm({...form, college: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
            <textarea className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              rows={3} placeholder="Tell others about yourself..."
              value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skills I Can Teach
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="e.g. React, Python, DSA"
              value={form.skillsToTeach} onChange={e => setForm({...form, skillsToTeach: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skills I Want to Learn
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="e.g. UI Design, ML, Flutter"
              value={form.skillsToLearn} onChange={e => setForm({...form, skillsToLearn: e.target.value})} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">
            Save Profile ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
