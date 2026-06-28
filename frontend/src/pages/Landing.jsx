import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 max-w-3xl w-full shadow-2xl">
          <div className="text-6xl mb-6">🔄</div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            SkillSwap
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-xl mx-auto">
            Connect with fellow students. Teach what you know. Learn what you don't. No money involved — just skills.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-lg">
              Get Started Free 🚀
            </Link>
            <Link to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-600 transition">
              Login
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl w-full">
          {[
            { number: '100%', label: 'Free Forever' },
            { number: '🎓', label: 'Student First' },
            { number: '∞', label: 'Skills to Swap' },
          ].map((stat, i) => (
            <div key={i} className="bg-white bg-opacity-10 rounded-2xl p-6 text-center text-white">
              <div className="text-3xl font-bold">{stat.number}</div>
              <div className="text-indigo-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl w-full">
          {[
            { icon: '🔍', title: 'Find Students', desc: 'Search by skill and connect instantly' },
            { icon: '🤝', title: 'Swap Skills', desc: 'Send and receive skill swap requests' },
            { icon: '⭐', title: 'Rate & Review', desc: 'Build your reputation on campus' },
          ].map((f, i) => (
            <div key={i} className="bg-white bg-opacity-10 rounded-2xl p-6 text-center text-white">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-indigo-200 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;