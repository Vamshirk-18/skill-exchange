import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';
import Chat from './pages/Chat';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/browse" element={<PrivateLayout><Browse /></PrivateLayout>} />
        <Route path="/profile" element={<PrivateLayout><Profile /></PrivateLayout>} />
        <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/chat/:swapId" element={<PrivateLayout><Chat /></PrivateLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

const LandingLayout = () => <Landing />;

const AuthLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const PrivateLayout = ({ children }) => {
  const { token } = useAuth();
  return token ? (
    <>
      <Navbar />
      {children}
    </>
  ) : <Navigate to="/login" />;
};

export default App;