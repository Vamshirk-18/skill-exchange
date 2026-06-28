import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data, data.token);
      toast.success(`Welcome to SkillSwap, ${data.name}! 🎉`);
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-indigo-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎓</div>
          <h2 className="text-2xl font-bold text-gray-800">Join SkillSwap</h2>
          <p className="text-gray-500 text-sm mt-1">Connect with students, swap skills</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="text" placeholder="Vamshi K"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">College</label>
            <input className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="text" placeholder="Sahyadri College of Engineering"
              value={form.college} onChange={e => setForm({...form, college: e.target.value})} />
          </div>
          <button disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : 'Create Account 🚀'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;