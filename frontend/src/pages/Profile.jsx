import { useState, useEffect } from 'react';
import API from '../api/axios';

const Profile = () => {
  const [form, setForm] = useState({ bio: '', college: '', skillsToTeach: '', skillsToLearn: '' });
  const [msg, setMsg] = useState('');

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
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">My Profile</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {msg && <p className="text-green-600 font-semibold">{msg}</p>}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">College</label>
          <input className="w-full border p-3 rounded-lg" value={form.college}
            onChange={e => setForm({...form, college: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea className="w-full border p-3 rounded-lg" rows={3} value={form.bio}
            onChange={e => setForm({...form, bio: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Skills I Can Teach <span className="text-gray-400 font-normal">(comma separated)</span></label>
          <input className="w-full border p-3 rounded-lg" placeholder="e.g. React, Python, DSA"
            value={form.skillsToTeach} onChange={e => setForm({...form, skillsToTeach: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Skills I Want to Learn <span className="text-gray-400 font-normal">(comma separated)</span></label>
          <input className="w-full border p-3 rounded-lg" placeholder="e.g. UI Design, ML, Flutter"
            value={form.skillsToLearn} onChange={e => setForm({...form, skillsToLearn: e.target.value})} />
        </div>
        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;