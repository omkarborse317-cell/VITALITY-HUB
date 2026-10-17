import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  HeartPulse,
  Leaf,
  Menu,
  MoonStar,
  MoonStar as Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Utensils,
  Users,
  X,
  Home,
  BarChart3,
  CheckCircle2,
  Bell,
  Clock3,
  MessageCircle,
  QrCode,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from './api/axios';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { ASANA_BENEFITS, MEDITATION_PRACTICES, PRANAYAMA_PRACTICES, YOGA_POSES, youtubeSearchUrl } from './wellnessContent';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Wellness', path: '/dashboard', icon: Activity },
  { label: 'Awareness Campaign', path: '/awareness', icon: Sparkles },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Resources', path: '/resources', icon: BookOpen },
  { label: 'Login', path: '/login', icon: ShieldCheck },
  { label: 'Get Started', path: '/register', icon: ArrowRight },
];

const HOME_CARDS = [
  { title: 'Exercise and Movement', description: 'Gentle walking, desk stretches, and simple routines.', icon: Dumbbell, path: '/exercise' },
  { title: 'Yoga and Mindfulness', description: 'Breathing, calm routines, and gentle movement.', icon: Brain, path: '/yoga' },
  { title: 'Healthy Food', description: 'Learn about nourishing everyday choices.', icon: Utensils, path: '/food' },
  { title: 'Daily Routines', description: 'Create consistency without pressure or guilt.', icon: Target, path: '/dashboard' },
  { title: 'Sleep and Hydration', description: 'Build sustainable rest and water habits.', icon: Droplets, path: '/water' },
  { title: 'Community Awareness', description: 'Participate in collective wellness learning.', icon: Users, path: '/survey' },
];

const moods = [
  { label: 'Great', value: 'Great' },
  { label: 'Good', value: 'Good' },
  { label: 'Okay', value: 'Okay' },
  { label: 'Stressed', value: 'Stressed' },
  { label: 'Low', value: 'Low' },
];

const barColors = ['#237A57', '#2E8B57', '#65A36A', '#83C6A5', '#F8E4D6'];

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ user, children }) {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <Routes>
      <Route path="/" element={<PageShell user={user} token={token} logout={logout} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage setUser={setUser} setToken={setToken} />} />
        <Route path="register" element={<RegisterPage setUser={setUser} setToken={setToken} />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="profile" element={<ProtectedRoute user={user}><ProfilePage /> </ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute user={user}><DashboardPage user={user} /></ProtectedRoute>} />
        <Route path="onboarding" element={<ProtectedRoute user={user}><WellnessOnboardingPage /></ProtectedRoute>} />
        <Route path="recommendations" element={<ProtectedRoute user={user}><RecommendationsPage /></ProtectedRoute>} />
        <Route path="exercise" element={<ExercisePage />} />
        <Route path="asanas" element={<AsanaLibraryPage />} />
        <Route path="yoga" element={<YogaPage user={user} />} />
        <Route path="wellness" element={<YogaPage user={user} />} />
        <Route path="food" element={<FoodPage />} />
        <Route path="plate" element={<PlatePage />} />
        <Route path="water" element={<ProtectedRoute user={user}><WaterPage /></ProtectedRoute>} />
        <Route path="sleep" element={<ProtectedRoute user={user}><SleepPage /></ProtectedRoute>} />
        <Route path="mood" element={<ProtectedRoute user={user}><MoodPage /></ProtectedRoute>} />
        <Route path="survey" element={<SurveyPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="challenge" element={<ProtectedRoute user={user}><ChallengePage /></ProtectedRoute>} />
        <Route path="achievements" element={<ProtectedRoute user={user}><AchievementsPage /></ProtectedRoute>} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="chatbot" element={<ProtectedRoute user={user}><ChatbotPage /></ProtectedRoute>} />
        <Route path="awareness" element={<AwarenessPage />} />
        <Route path="settings" element={<ProtectedRoute user={user}><SettingsPage /></ProtectedRoute>} />
        <Route path="admin" element={<AdminRoute user={user}><AdminPage /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

function PageShell({ user, token, logout, menuOpen, setMenuOpen }) {
  const location = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-badge"><Leaf size={18} /></div>
          <div>
            <div className="brand-name">Vitality Hub</div>
            <small>Small Steps. Healthier Habits. Stronger Communities.</small>
          </div>
        </div>

        <nav className="nav desktop-nav">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name}</span>
              <button className="secondary-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            !isAuthRoute && <NavLink to="/login" className="primary-btn">Login</NavLink>
          )}
          <button className="mobile-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-panel">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className="mobile-link" onClick={() => setMenuOpen(false)}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}

      <main className="page-body">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>Vitality Hub</strong>
          <p>This platform provides general wellness and educational information. It is not a medical diagnosis or treatment service.</p>
        </div>
        <div className="footer-links">
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/survey">Survey</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <div className="page-content">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Healthy Community Initiative</span>
          <h1>Vitality Hub</h1>
          <p className="lead">Your digital companion for building healthier everyday habits and creating healthier communities.</p>
          <div className="hero-actions">
            <NavLink to="/register" className="primary-btn">Get Started</NavLink>
            <NavLink to="/exercise" className="secondary-btn">Explore Wellness</NavLink>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-card photo-card">
            <div className="mini-pill">Daily wellbeing</div>
            <img
              className="hero-visual-image"
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80"
              alt="Person doing yoga pose outdoors in a peaceful setting"
            />
          </div>
        </div>
      </section>

      <section className="card-grid six-grid">
        {HOME_CARDS.map(({ title, description, icon: Icon, path }) => (
          <div className="info-card" key={title}>
            <div className="icon-wrap"><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
            <NavLink to={path}>Explore <ChevronRight size={16} /></NavLink>
          </div>
        ))}
      </section>

      <section className="yoga-gallery">
        <div className="image-card" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80')" }}>
          <div className="image-card-overlay">
            <span>Morning Flow</span>
            <strong>Sun Salutations</strong>
          </div>
        </div>
        <div className="image-card tall" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80')" }}>
          <div className="image-card-overlay">
            <span>Breathwork</span>
            <strong>Pranayama</strong>
          </div>
        </div>
        <div className="image-card" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506126279646-a697353d3166?auto=format&fit=crop&w=900&q=80')" }}>
          <div className="image-card-overlay">
            <span>Stillness</span>
            <strong>Meditation</strong>
          </div>
        </div>
      </section>

      <section className="story-section">
        <h2>Healthy Community Initiative</h2>
        <p>Vitality Hub helps people learn about physical activity, balanced nutrition, sleep, hydration, mindfulness, and consistent daily routines in a supportive, community-minded way.</p>
      </section>

      <section className="split-layout">
        <div>
          <h3>Simple daily wellness routine</h3>
          <ul className="check-list">
            <li>Drink water in the morning and keep a bottle nearby.</li>
            <li>Take a short movement break or walk during the day.</li>
            <li>Eat balanced meals with fruits, vegetables, protein, and grains.</li>
            <li>Build an evening routine for calmer rest and sleep.</li>
          </ul>
        </div>
        <div>
          <h3>Awareness campaign</h3>
          <div className="campaign-box">
            <div className="mini-pill green">Exercise</div>
            <div className="mini-pill green">Sleep</div>
            <div className="mini-pill green">Nutrition</div>
            <div className="mini-pill green">Mindfulness</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ setUser, setToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      setToken(data.access_token);
      const me = await api.get('/auth/me');
      setUser(me.data);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Unable to log in.');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Continue building healthy, kind routines.</p>
        {err && <div className="error-box">{err}</div>}
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button className="primary-btn" type="submit">Login</button>
        </form>
        <div className="auth-actions-row">
          <NavLink to="/forgot-password" className="text-link">Forgot password?</NavLink>
          <span className="auth-divider">|</span>
          <NavLink to="/register" className="text-link">Create account</NavLink>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      const tokenText = data.reset_token ? ` Demo reset token: ${data.reset_token}` : '';
      setMessage((data.message || 'Password reset instructions are ready.') + tokenText);
      setError('');
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to process your request.');
      setMessage('');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Reset your password</h2>
        <p>Enter your email to receive a secure reset link in this demo project.</p>
        {error && <div className="error-box">{error}</div>}
        {message && <div className="success-box">{message}</div>}
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button className="primary-btn" type="submit">Send reset link</button>
        </form>
        <p className="small-link"><NavLink to="/login">Back to login</NavLink></p>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: searchParams.get('token') || '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/reset-password', form);
      setMessage(data.message || 'Password reset successful.');
      setError('');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to reset your password.');
      setMessage('');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Choose a new password</h2>
        <p>Create a strong password to continue your wellness journey.</p>
        {error && <div className="error-box">{error}</div>}
        {message && <div className="success-box">{message}</div>}
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Reset token
            <input value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required />
          </label>
          <label>
            New password
            <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required />
          </label>
          <button className="primary-btn" type="submit">Reset password</button>
        </form>
      </div>
    </div>
  );
}

function RegisterPage({ setUser, setToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' });
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      setToken(data.access_token);
      setUser(data.user);
      navigate('/profile');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Unable to create account.');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p>Start your journey with simple, sustainable habits.</p>
        {err && <div className="error-box">{err}</div>}
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required />
          </label>
          <button className="primary-btn" type="submit">Create account</button>
        </form>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [form, setForm] = useState({ age: '', height_cm: '', weight_kg: '', activity_level: 'Moderate', sleep_duration_hours: '', water_intake_liters: '', goal: 'Improve Daily Routine' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/profile');
        if (data && Object.keys(data).length) {
          setForm({
            age: data.age || '',
            height_cm: data.height_cm || '',
            weight_kg: data.weight_kg || '',
            activity_level: data.activity_level || 'Moderate',
            sleep_duration_hours: data.sleep_duration_hours || '',
            water_intake_liters: data.water_intake_liters || '',
            goal: data.goal || 'Improve Daily Routine',
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/profile', form);
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="section-page">
      <h2>Your wellness profile</h2>
      <p>Optional details help personalize gentle suggestions without diagnosing or labeling. </p>
      {saved && <div className="success-box">Profile saved successfully.</div>}
      <form onSubmit={handleSubmit} className="profile-form stack-form">
        <div className="row-fields">
          <label>Age<input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label>
          <label>Height (cm)<input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /></label>
          <label>Weight (kg)<input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></label>
        </div>
        <div className="row-fields">
          <label>Activity level
            <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
              <option>Low</option>
              <option>Moderate</option>
              <option>Active</option>
            </select>
          </label>
          <label>Typical sleep duration (hours)<input type="number" step="0.5" value={form.sleep_duration_hours} onChange={(e) => setForm({ ...form, sleep_duration_hours: e.target.value })} /></label>
          <label>Water intake (L)<input type="number" step="0.1" value={form.water_intake_liters} onChange={(e) => setForm({ ...form, water_intake_liters: e.target.value })} /></label>
        </div>
        <label>Wellness goal
          <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
            <option>Stay Active</option>
            <option>Improve Daily Routine</option>
            <option>Improve Fitness Habits</option>
            <option>Improve Sleep Routine</option>
            <option>Improve Hydration</option>
          </select>
        </label>
        <button className="primary-btn" type="submit">Save profile</button>
      </form>
    </div>
  );
}

function DashboardPage({ user }) {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percent: 0 });
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [goalRes, progressRes, profileRes] = await Promise.all([
          api.get('/goals/today'),
          api.get('/goals/progress'),
          api.get('/profile'),
        ]);
        setGoals(goalRes.data);
        setProgress(progressRes.data);
        setProfile(profileRes.data || {});
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const markGoal = async (goalId, completed) => {
    try {
      await api.put(`/goals/${goalId}`, { completed });
      const [goalRes, progressRes] = await Promise.all([
        api.get('/goals/today'),
        api.get('/goals/progress'),
      ]);
      setGoals(goalRes.data);
      setProgress(progressRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const cards = [
    { label: 'Water intake', value: `${Math.round((profile.water_intake_liters || 2) * 1000)} mL`, icon: Droplets },
    { label: 'Walking', value: '30 min goal', icon: Dumbbell },
    { label: 'Mindfulness', value: '5 min reset', icon: Brain },
    { label: 'Healthy food', value: 'Balanced meals', icon: Leaf },
    { label: 'Sleep', value: `${profile.sleep_duration_hours || 7.5} hr`, icon: Moon },
    { label: 'Wellness streak', value: `${progress.completed || 0} of ${progress.total || 0}`, icon: CheckCircle2 },
  ];

  return (
    <div className="section-page dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Welcome back, {user?.name || 'friend'} 👋</p>
          <h2>Small steps count. Let’s see how your day is going.</h2>
        </div>
      </div>

      <div className="progress-panel">
        <div>
          <strong>{progress.percent || 0}%</strong>
          <span>of today’s goals complete</span>
        </div>
        <div className="progress-bar"><span style={{ width: `${progress.percent || 0}%` }} /></div>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card">
            <Icon size={18} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="goal-panel">
        <h3>Today’s Goals</h3>
        {goals.length === 0 ? <div className="empty-box">No goals yet. Start by adding one in your Profile page.</div> : (
          <div className="goal-list">
            {goals.map((goal) => (
              <div key={goal.id} className={`goal-item ${goal.completed ? 'done' : ''}`}>
                <div>
                  <h4>{goal.title}</h4>
                  <p>{goal.description}</p>
                </div>
                <button className="secondary-btn" onClick={() => markGoal(goal.id, !goal.completed)}>
                  {goal.completed ? 'Undo' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExercisePage() {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/exercises', { params: { q: query, category } });
      setExercises(data);
    };
    load();
  }, [query, category]);

  return (
    <div className="section-page">
      <h2>Exercise and movement</h2>
      <div className="toolbar-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Walking">Walking</option>
          <option value="Stretching">Stretching</option>
          <option value="Beginner exercises">Beginner</option>
          <option value="Desk exercises">Desk</option>
          <option value="Mobility">Mobility</option>
        </select>
      </div>
      <div className="card-grid three-grid">
        {exercises.map((item) => (
          <div className="info-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <ul className="tiny-list">
              <li>Difficulty: {item.difficulty}</li>
              <li>Duration: {item.duration}</li>
              <li>Equipment: {item.equipment || 'None'}</li>
            </ul>
            <div className="mini-pill green">{item.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AsanaLibraryPage() {
  const [asanas, setAsanas] = useState([]);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAsanas = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/asanas', {
          params: {
            q: query || undefined,
            difficulty: difficulty || undefined,
            category: category || undefined,
            max_duration: maxDuration || undefined,
          },
        });
        setAsanas(data);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.detail || 'Unable to load the asana library.');
      } finally {
        setLoading(false);
      }
    };
    loadAsanas();
  }, [query, difficulty, category, maxDuration]);

  return (
    <div className="section-page asana-library-page">
      <p className="eyebrow">Explore at your own pace</p>
      <h2>Yoga asana library</h2>
      <p className="lead">Beginner-oriented movement education with supported alternatives. Choose only what feels comfortable.</p>
      <div className="toolbar-row asana-filters">
        <label>
          Search poses
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Sanskrit name, or description" />
        </label>
        <label>
          Experience
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="beginner-adaptable">Beginner-adaptable</option>
          </select>
        </label>
        <label>
          Movement type
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All types</option>
            <option value="standing">Standing</option>
            <option value="balance">Balance</option>
            <option value="seated">Seated</option>
            <option value="kneeling">Kneeling</option>
            <option value="mobility">Mobility</option>
            <option value="supine">Lying on the back</option>
            <option value="prone">Lying on the front</option>
            <option value="core">Supported strength</option>
            <option value="relaxation">Relaxation</option>
          </select>
        </label>
        <label>
          Time available
          <select value={maxDuration} onChange={(event) => setMaxDuration(event.target.value)}>
            <option value="">Any duration</option>
            <option value="1">Up to 1 minute</option>
            <option value="2">Up to 2 minutes</option>
            <option value="3">Up to 3 minutes</option>
            <option value="5">Up to 5 minutes</option>
          </select>
        </label>
      </div>
      <p className="small-note" role="status">
        {loading ? 'Loading poses…' : `${asanas.length} pose${asanas.length === 1 ? '' : 's'} found`}
      </p>
      {error && <div className="error-box" role="alert">{error}</div>}
      {!loading && !error && asanas.length === 0 && (
        <div className="empty-box">No poses match those filters. Try broadening your search.</div>
      )}
      <div className="asana-library-grid">
        {asanas.map((asana) => (
          <article className="info-card asana-library-card" key={asana.id}>
            <div className="asana-card-meta">
              <span className="mini-pill green">{asana.category}</span>
              <span className="mini-pill">{asana.duration_minutes} min</span>
            </div>
            <h3>{asana.name}</h3>
            {asana.sanskrit_name && <p className="asana-sanskrit">{asana.sanskrit_name}</p>}
            <p>{asana.description}</p>
            <p className="practice-benefit"><strong>Possible benefit:</strong> {ASANA_BENEFITS[asana.name]}</p>
            <p className="small-note">Level: {asana.difficulty.replace('-', ' ')}</p>
            <img className="practice-image" src="/images/yoga-asana.svg" alt={`Illustration for ${asana.name}`} loading="lazy" />
            <details>
              <summary>Instructions, adaptations, and safety</summary>
              <dl className="asana-guidance">
                <dt>How to explore</dt><dd>{asana.instructions}</dd>
                <dt>Breathing</dt><dd>{asana.breathing}</dd>
                <dt>Common things to avoid</dt><dd>{asana.common_mistakes}</dd>
                <dt>Supported option</dt><dd>{asana.modification}</dd>
                <dt>Equipment</dt><dd>{asana.equipment || 'None required'}</dd>
                <dt>Safety</dt><dd>{asana.safety_note}</dd>
              </dl>
            </details>
            <a className="video-link" href={youtubeSearchUrl(`${asana.sanskrit_name || asana.name} gentle beginner yoga instructions`)} target="_blank" rel="noreferrer">
              Find a guided YouTube video <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </div>
      <p className="small-note">This is general education, not medical advice. Stop if you experience pain, dizziness, or distress.</p>
    </div>
  );
}

function YogaPage({ user }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get('/wellness/activities').then((res) => setActivities(res.data));
  }, []);

  return (
    <div className="section-page yoga-page">
      <div className="yoga-hero">
        <div>
          <p className="eyebrow">Yoga flow</p>
          <h2>Move gently. Breathe deeply. Restore your balance.</h2>
          <NavLink className="primary-btn wellness-plan-link" to={user ? '/recommendations' : '/login'}>
            {user ? 'View my wellness plan' : 'Sign in for a personal plan'}
          </NavLink>
          <NavLink className="secondary-btn wellness-plan-link" to="/asanas">Browse the asana library</NavLink>
        </div>
        <div className="yoga-breath-ring">
          <span>Inhale</span>
        </div>
      </div>

      <div className="wellness-timer-box">
        <Clock3 size={18} />
        <div>
          <strong>Practice gently and at your own pace</strong>
          <p>Benefits are general educational possibilities, not medical claims. Stop if you feel pain, dizziness, breathlessness, or distress. Video links open YouTube search results so you can choose a guide that suits you.</p>
        </div>
      </div>

      <section className="yoga-section">
        <div className="section-heading">
          <div><h3>Yoga asanas</h3><p className="small-note">Beginner-friendly poses with simple variations</p></div>
          <NavLink to="/asanas">Explore all 25 poses</NavLink>
        </div>
        <div className="practice-grid">
          {YOGA_POSES.map((asana) => (
            <article className="practice-card" key={asana.name}>
              <img className="practice-image" src="/images/yoga-asana.svg" alt={`Illustration for ${asana.name}`} loading="lazy" />
              <div className="practice-card-body">
                <span className="mini-pill green">{asana.time} · {asana.focus}</span>
                <h4>{asana.name}</h4>
                <p className="asana-sanskrit">{asana.sanskrit}</p>
                <p><strong>Possible benefit:</strong> {asana.benefit}</p>
                <details><summary>How to try it</summary><p>{asana.steps}</p></details>
                <a className="video-link" href={youtubeSearchUrl(`${asana.sanskrit} beginner yoga pose instructions`)} target="_blank" rel="noreferrer">
                  Find a guided YouTube video <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="yoga-section">
        <div className="section-heading">
          <div><h3>Pranayama & breathing</h3><p className="small-note">Gentle practices—no breath holds required</p></div>
        </div>
        <div className="practice-grid">
          {PRANAYAMA_PRACTICES.map((item) => (
            <article className="practice-card" key={item.name}>
              <img className="practice-image" src="/images/pranayama.svg" alt={`Illustration for ${item.name}`} loading="lazy" />
              <div className="practice-card-body">
                <span className="mini-pill green">{item.rhythm}</span>
                <h4>{item.name}</h4>
                <p>{item.detail}</p>
                <p><strong>Possible benefit:</strong> {item.benefit}</p>
                <details><summary>Gentle steps</summary><p>{item.instructions}</p></details>
                <a className="video-link" href={youtubeSearchUrl(`${item.name} gentle guided breathing practice`)} target="_blank" rel="noreferrer">
                  Find a guided YouTube video <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="yoga-section">
        <div className="section-heading">
          <div><h3>Meditation & mindfulness</h3><p className="small-note">Short, flexible practices for everyday reflection</p></div>
        </div>
        <div className="practice-grid">
          {MEDITATION_PRACTICES.map((item) => (
            <article className="practice-card" key={item.name}>
              <img className="practice-image" src="/images/meditation.svg" alt={`Illustration for ${item.name}`} loading="lazy" />
              <div className="practice-card-body">
                <span className="mini-pill green">{item.time}</span>
                <h4>{item.name}</h4>
                <p>{item.text}</p>
                <p><strong>Possible benefit:</strong> {item.benefit}</p>
                <details><summary>How to try it</summary><p>{item.instructions}</p></details>
                <a className="video-link" href={youtubeSearchUrl(`${item.name} short guided meditation`)} target="_blank" rel="noreferrer">
                  Find a guided YouTube video <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="yoga-section">
        <div className="section-heading">
          <h3>Gentle routines</h3>
          <span>Daily yoga guidance</span>
        </div>
        <div className="card-grid three-grid">
          {activities.map((item) => (
            <div className="info-card" key={item.id || item.name}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <ul className="tiny-list">
                <li>{item.duration}</li>
                <li>{item.category}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const wellnessInterestOptions = [
  { value: 'yoga', label: 'Yoga and gentle movement' },
  { value: 'breathing', label: 'Breathing practices' },
  { value: 'mindfulness', label: 'Mindfulness and relaxation' },
  { value: 'stretching', label: 'Gentle stretching' },
];

function WellnessOnboardingPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({ interests: [], available_minutes: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data } = await api.get('/preferences/wellness');
        if (data) setPreferences(data);
      } catch (requestError) {
        setLoadFailed(true);
        setError(requestError.response?.data?.detail || 'Unable to load your wellness preferences.');
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const toggleInterest = (interest) => {
    setPreferences((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/preferences/wellness', preferences);
      navigate('/recommendations');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-page preference-page">
      <p className="eyebrow">A plan that fits your day</p>
      <h2>Personalize your wellness suggestions</h2>
      <p className="lead">Choose a few interests and the time you usually have. You can change these preferences whenever you like.</p>
      {error && <div className="error-box" role="alert">{error}</div>}
      {loading ? <p role="status">Loading your preferences…</p> : (
        <form className="preference-form" onSubmit={savePreferences}>
          <fieldset className="preference-options">
            <legend>What would you like to explore?</legend>
            <p className="small-note">Select any interests, or leave them blank to see general suggestions.</p>
            {wellnessInterestOptions.map(({ value, label }) => (
              <label key={value} className="preference-option">
                <input
                  type="checkbox"
                  checked={preferences.interests.includes(value)}
                  onChange={() => toggleInterest(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <label className="available-time-field">
            How much time do you have for a practice?
            <select
              value={preferences.available_minutes}
              onChange={(event) => setPreferences({
                ...preferences,
                available_minutes: Number(event.target.value),
              })}
            >
              {[3, 5, 10, 15, 20, 30, 60].map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} minutes</option>
              ))}
            </select>
          </label>
          <p className="small-note">These preferences are saved to your account and used only to sort wellness activities. No health or diagnosis details are requested.</p>
          <div className="preference-actions">
            <button className="primary-btn" type="submit" disabled={saving || loadFailed}>
              {saving ? 'Saving…' : 'Save and view suggestions'}
            </button>
            <NavLink className="secondary-btn" to="/recommendations">Skip for now</NavLink>
          </div>
        </form>
      )}
    </div>
  );
}

function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const { data } = await api.get('/recommendations');
        setRecommendations(data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || 'Unable to load your wellness suggestions.');
      }
    };
    loadRecommendations();
  }, []);

  return (
    <div className="section-page recommendations-page">
      <p className="eyebrow">Your wellness plan</p>
      <h2>Ideas for your next small step</h2>
      <div className="recommendation-toolbar">
        <p className="small-note">{recommendations?.message || 'Loading suggestions…'}</p>
        <NavLink className="secondary-btn" to="/onboarding">Edit preferences</NavLink>
      </div>
      {error && <div className="error-box" role="alert">{error}</div>}
      {recommendations && recommendations.items.length === 0 && (
        <div className="empty-box">
          No activities in the current library match that time and interest combination. Try adjusting your preferences or explore the full library.
        </div>
      )}
      <div className="recommendation-grid">
        {recommendations?.items.map((item) => (
          <article className="info-card recommendation-card" key={item.id}>
            <div className="mini-pill green">{item.category} · {item.duration}</div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p className="recommendation-reason"><Sparkles size={15} /> {item.reason}</p>
            <details>
              <summary>Practice guidance</summary>
              <p>{item.instructions}</p>
              {item.safety_note && <p className="small-note">Safety: {item.safety_note}</p>}
            </details>
          </article>
        ))}
      </div>
      <p className="small-note">Suggestions are general wellness education, not medical advice. Stop if an activity feels uncomfortable.</p>
      <NavLink className="text-link" to="/yoga">Explore the full wellness library</NavLink>
    </div>
  );
}

function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/foods', { params: { query } }).then((res) => setFoods(res.data));
  }, [query]);

  return (
    <div className="section-page">
      <h2>Healthy food explorer</h2>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food" />
      <div className="card-grid three-grid">
        {foods.map((item) => (
          <div className="info-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="chip-row"><span className="mini-pill green">{item.category}</span></div>
            <p><strong>Serving:</strong> {item.serving}</p>
            <p><strong>Pairing:</strong> {item.pairings}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatePage() {
  return (
    <div className="section-page">
      <h2>Interactive healthy plate</h2>
      <div className="plate-wrap">
        <div className="plate">
          <div className="plate-section veg">Vegetables<br />& Fruits</div>
          <div className="plate-section grains">Grains</div>
          <div className="plate-section protein">Protein</div>
        </div>
      </div>
      <p className="small-note">This is an educational illustration, not a rigid prescription or personalized diet plan.</p>
    </div>
  );
}

function WaterPage() {
  const [today, setToday] = useState({ total_ml: 0, target_ml: 2000, percent: 0, logs: [] });
  const [input, setInput] = useState(250);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await api.get('/water/today');
    setToday(data);
  };

  const addWater = async () => {
    await api.post('/water', { amount_ml: Number(input) });
    load();
  };

  return (
    <div className="section-page">
      <h2>Your Water Tracker</h2>
      <div className="water-box">
        <div>
          <strong>{today.total_ml} / {today.target_ml} mL</strong>
          <p>{today.percent}% of your personal daily target</p>
        </div>
        <div className="progress-bar"><span style={{ width: `${today.percent}%` }} /></div>
      </div>
      <div className="toolbar-row">
        <input type="number" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="primary-btn" onClick={addWater}>Add a glass</button>
      </div>
      <ul className="tiny-list">
        {today.logs.map((log) => <li key={log.id}>{log.amount_ml} mL logged</li>)}
      </ul>
    </div>
  );
}

function SleepPage() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ bedtime: '22:30', wake_time: '06:30', quality: 'Good' });

  useEffect(() => {
    api.get('/sleep/weekly').then((res) => setRecords(res.data.records));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const bedtime = new Date();
    const wake = new Date();
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [wh, wm] = form.wake_time.split(':').map(Number);
    bedtime.setHours(bh, bm, 0, 0);
    wake.setHours(wh, wm, 0, 0);
    if (wake <= bedtime) wake.setDate(wake.getDate() + 1);

    await api.post('/sleep', {
      bedtime: bedtime.toISOString(),
      wake_time: wake.toISOString(),
      quality: form.quality,
    });
    const { data } = await api.get('/sleep/weekly');
    setRecords(data.records);
  };

  return (
    <div className="section-page">
      <h2>Sleep tracker</h2>
      <form onSubmit={save} className="stack-form">
        <div className="row-fields">
          <label>Bedtime<input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} /></label>
          <label>Wake-up time<input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} /></label>
        </div>
        <label>Sleep quality<select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
          <option>Good</option>
          <option>Fair</option>
          <option>Restless</option>
        </select></label>
        <button className="primary-btn" type="submit">Save sleep record</button>
      </form>
      <div style={{ height: 220, marginTop: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="duration_minutes" fill="#237A57" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MoodPage() {
  const [history, setHistory] = useState([]);
  const [mood, setMood] = useState('Good');

  useEffect(() => {
    api.get('/mood/history').then((res) => setHistory(res.data));
  }, []);

  const saveMood = async () => {
    await api.post('/mood', { mood, note: 'Daily check-in' });
    const { data } = await api.get('/mood/history');
    setHistory(data);
  };

  return (
    <div className="section-page">
      <h2>How are you feeling today?</h2>
      <div className="mood-row">
        {moods.map((item) => (
          <button key={item.value} className={mood === item.value ? 'mood-btn active' : 'mood-btn'} onClick={() => setMood(item.value)}>
            {item.label}
          </button>
        ))}
      </div>
      <button className="primary-btn" onClick={saveMood}>Save mood check-in</button>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-item">{entry.mood} — {new Date(entry.created_at).toLocaleDateString()}</div>
        ))}
      </div>
    </div>
  );
}

function SurveyPage() {
  const [form, setForm] = useState({ age_group: '18-24', activity_level: 'Moderate', sleep_range: '6-7 hours', water_range: '2-3L', exercise_frequency: '3-4 times/week', food_habits: 'Mostly balanced', mood: 'Good' });
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/survey', form);
    setSent(true);
  };

  return (
    <div className="section-page">
      <h2>Community survey</h2>
      <p>Anonymous participation helps us understand broader community patterns while protecting individual privacy.</p>
      {sent && <div className="success-box">Survey submitted. Thank you for contributing.</div>}
      <form onSubmit={submit} className="stack-form">
        <div className="row-fields">
          <label>Age group<select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })}><option>18-24</option><option>25-34</option><option>35-44</option><option>45+</option></select></label>
          <label>Activity level<select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}><option>Low</option><option>Moderate</option><option>Active</option></select></label>
        </div>
        <div className="row-fields">
          <label>Sleep range<select value={form.sleep_range} onChange={(e) => setForm({ ...form, sleep_range: e.target.value })}><option>4-5 hours</option><option>6-7 hours</option><option>7-8 hours</option><option>8+ hours</option></select></label>
          <label>Water range<select value={form.water_range} onChange={(e) => setForm({ ...form, water_range: e.target.value })}><option>1-2L</option><option>2-3L</option><option>3-4L</option></select></label>
        </div>
        <div className="row-fields">
          <label>Exercise frequency<select value={form.exercise_frequency} onChange={(e) => setForm({ ...form, exercise_frequency: e.target.value })}><option>Never</option><option>1-2 times/week</option><option>3-4 times/week</option><option>5+ times/week</option></select></label>
          <label>Food habits<select value={form.food_habits} onChange={(e) => setForm({ ...form, food_habits: e.target.value })}><option>Mostly balanced</option><option>Sometimes balanced</option><option>I’m learning</option></select></label>
        </div>
        <label>General mood<select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}><option>Good</option><option>Okay</option><option>Stressed</option><option>Low</option></select></label>
        <button className="primary-btn" type="submit">Submit survey</button>
      </form>
    </div>
  );
}

function CommunityPage() {
  const [data, setData] = useState({ total_responses: 0, exercise_participation_percent: 0, average_sleep_hours: 0, average_water_liters: 0, data_source: 'survey respondents' });
  const [exerciseSeries, setExerciseSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [summary, exercise] = await Promise.all([api.get('/community/summary'), api.get('/community/exercise')]);
      setData(summary.data);
      setExerciseSeries(exercise.data.series);
    };
    load();
  }, []);

  return (
    <div className="section-page">
      <h2>Community analytics</h2>
      <div className="stats-grid">
        <div className="stat-card"><BarChart3 size={18} /><span>Eligible participants</span><strong>{data.eligible_participants || 0}</strong></div>
        <div className="stat-card"><HeartPulse size={18} /><span>Exercise participation</span><strong>{data.exercise_participation_percent || 0}%</strong></div>
        <div className="stat-card"><MoonStar size={18} /><span>Average sleep</span><strong>{data.average_sleep_hours || 0} hrs</strong></div>
        <div className="stat-card"><Droplets size={18} /><span>Average water</span><strong>{data.average_water_liters || 0} L</strong></div>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={exerciseSeries}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2d7a52" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChallengePage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/challenges').then((res) => setList(res.data));
  }, []);

  const join = async (id) => {
    await api.post(`/challenges/${id}/join`);
    const { data } = await api.get('/challenges');
    setList(data);
  };

  return (
    <div className="section-page">
      <h2>Community challenges</h2>
      {list.map((challenge) => (
        <div className="challenge-card" key={challenge.id}>
          <h3>{challenge.title}</h3>
          <p>{challenge.description}</p>
          <small>{challenge.start_date} to {challenge.end_date}</small>
          <button className="primary-btn" onClick={() => join(challenge.id)}>Join challenge</button>
        </div>
      ))}
    </div>
  );
}

function AchievementsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/achievements').then((res) => setItems(res.data));
  }, []);

  return (
    <div className="section-page">
      <h2>Achievements</h2>
      <div className="card-grid three-grid">
        {items.map((item) => (
          <div key={item.id} className={`badge-card ${item.unlocked ? 'unlocked' : ''}`}>
            <BadgeCheck size={18} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{item.unlocked ? 'Unlocked' : 'Locked'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/resources').then((res) => setItems(res.data));
  }, []);

  return (
    <div className="section-page">
      <h2>Help and resources</h2>
      <div className="card-grid two-grid">
        {items.map((item) => (
          <div key={item.id} className="info-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.location}</small>
            <a href={item.url} target="_blank" rel="noreferrer">Open resource</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatbotPage() {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'I’m a wellness assistant. Ask me about movement, food, sleep, hydration, or routines.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', text: input }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chatbot', { message: input });
      setMessages([...next, { role: 'bot', text: data.reply }]);
    } catch (e) {
      setMessages([...next, { role: 'bot', text: 'I could not answer that right now. Try a wellness question about movement, sleep, food, or hydration.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-page">
      <h2>Vitality Wellness Assistant</h2>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'chat bubble-right' : 'chat bubble-left'}>{msg.text}</div>
        ))}
        {loading && <div className="chat bubble-left">Thinking...</div>}
      </div>
      <div className="chat-input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about exercise, sleep, food, or mindfulness" />
        <button className="primary-btn" onClick={send}>Send</button>
      </div>
    </div>
  );
}

function AwarenessPage() {
  return (
    <div className="section-page">
      <h2>Awareness campaign</h2>
      <div className="campaign-grid">
        <div className="info-card"><HeartPulse size={18} /><h3>Exercise awareness</h3><p>Build consistent movement into your day, in a way that feels sustainable.</p></div>
        <div className="info-card"><Brain size={18} /><h3>Mindful routines</h3><p>Take short pauses to reduce stress and anchor attention.</p></div>
        <div className="info-card"><Utensils size={18} /><h3>Nutrition awareness</h3><p>Focus on simple, colorful, balanced meals and snacks.</p></div>
        <div className="info-card"><Moon size={18} /><h3>Sleep awareness</h3><p>Create evening habits that support calmer, regular rest.</p></div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ category: 'Water', enabled: true, frequency: 'daily', message: 'Take a quick minute for your wellness routine.' });

  useEffect(() => {
    api.get('/reminders').then((res) => setReminders(res.data));
  }, []);

  const saveReminder = async () => {
    const { data } = await api.post('/reminders', form);
    setReminders([...reminders, data]);
  };

  return (
    <div className="section-page">
      <h2>Reminder settings</h2>
      <div className="stack-form">
        <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Water</option><option>Exercise</option><option>Sleep</option><option>Mindfulness</option></select></label>
        <label>Frequency<select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}><option>daily</option><option>weekly</option></select></label>
        <label>Message<input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
        <button className="primary-btn" onClick={saveReminder}>Save reminder</button>
      </div>
      <div className="history-list">
        {reminders.map((item) => <div key={item.id} className="history-item">{item.category} · {item.enabled ? 'enabled' : 'disabled'}</div>)}
      </div>
    </div>
  );
}

function AdminPage() {
  const [data, setData] = useState({ users: 0, survey_responses: 0, exercises: 0, resources: 0, challenges: 0 });

  useEffect(() => {
    api.get('/admin/summary').then((res) => setData(res.data));
  }, []);

  return (
    <div className="section-page">
      <h2>Admin dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><Users size={18} /><span>Users</span><strong>{data.users}</strong></div>
        <div className="stat-card"><BarChart3 size={18} /><span>Survey responses</span><strong>{data.survey_responses}</strong></div>
        <div className="stat-card"><Dumbbell size={18} /><span>Exercises</span><strong>{data.exercises}</strong></div>
        <div className="stat-card"><BookOpen size={18} /><span>Resources</span><strong>{data.resources}</strong></div>
      </div>
    </div>
  );
}

export default App;
