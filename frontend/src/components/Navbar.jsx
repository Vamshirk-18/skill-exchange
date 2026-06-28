import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path
    ? 'text-white font-semibold border-b-2 border-white pb-1'
    : 'text-indigo-200 hover:text-white transition';

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <Link to={user ? '/browse' : '/'} className="text-xl font-bold flex items-center gap-2">
        🔄 <span>SkillSwap</span>
      </Link>
      <div className="flex gap-6 items-center">
        {user ? (
          <>
            <Link to="/browse" className={isActive('/browse')}>Browse</Link>
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button onClick={handleLogout}
                className="bg-white text-indigo-600 px-3 py-1 rounded-lg font-semibold hover:bg-indigo-50 text-sm transition">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register"
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition text-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;