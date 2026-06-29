import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path
    ? 'text-white font-semibold border-b-2 border-white pb-1'
    : 'text-indigo-200 hover:text-white transition';

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to={user ? '/browse' : '/'} className="text-xl font-bold flex items-center gap-2">
          🔄 <span>SkillSwap</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <>
              <Link to="/browse" className={isActive('/browse')}>Browse</Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/profile" className={isActive('/profile')}>Profile</Link>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-9 h-9 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <button onClick={handleLogout}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 text-sm transition">
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

        {/* Mobile hamburger */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-indigo-500 px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <Link to="/browse" onClick={() => setMenuOpen(false)}
                className="text-indigo-100 hover:text-white py-2 px-3 rounded-lg hover:bg-indigo-500 transition">
                🔍 Browse
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="text-indigo-100 hover:text-white py-2 px-3 rounded-lg hover:bg-indigo-500 transition">
                📊 Dashboard
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="text-indigo-100 hover:text-white py-2 px-3 rounded-lg hover:bg-indigo-500 transition">
                👤 Profile
              </Link>
              <button onClick={handleLogout}
                className="text-left text-red-300 hover:text-white py-2 px-3 rounded-lg hover:bg-indigo-500 transition">
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-indigo-100 hover:text-white py-2 px-3 rounded-lg hover:bg-indigo-500 transition">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="bg-white text-indigo-600 py-2 px-3 rounded-lg font-semibold text-center">
                Get Started 🚀
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
