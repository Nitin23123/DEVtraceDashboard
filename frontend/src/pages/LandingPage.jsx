import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

// ── 1. Inline SVG Icon Helpers ───────────────────────────────────────────────
const IconSvg = ({ children, size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const IconSparkles = (props) => (
  <IconSvg {...props}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </IconSvg>
);

const IconArrowRight = (props) => (
  <IconSvg {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </IconSvg>
);

const IconGraduationCap = (props) => (
  <IconSvg {...props}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </IconSvg>
);

const IconBuilding = (props) => (
  <IconSvg {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M8 10h.01M8 14h.01M16 10h.01M16 14h.01" />
  </IconSvg>
);

const IconBookOpen = (props) => (
  <IconSvg {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconSvg>
);

const IconUserCheck = (props) => (
  <IconSvg {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </IconSvg>
);

const IconCheckCircle = (props) => (
  <IconSvg {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </IconSvg>
);

const IconCode = (props) => (
  <IconSvg {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </IconSvg>
);

const IconFlame = (props) => (
  <IconSvg {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </IconSvg>
);

const IconPlay = (props) => (
  <IconSvg {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </IconSvg>
);

const IconShare2 = (props) => (
  <IconSvg {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </IconSvg>
);


// ── 2. Interactive Signal Canvas Component ──────────────────────────────────
function SignalCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracker
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate static grid nodes
    const nodeSpacing = 65;
    const nodes = [];
    for (let x = 30; x < width; x += nodeSpacing) {
      for (let y = 30; y < height; y += nodeSpacing) {
        nodes.push({ x, y, baseAlpha: 0.15 + Math.random() * 0.15 });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint grid dots
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Highlight nodes near mouse
        if (dist < 130) {
          const intensity = 1 - dist / 130;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5 + intensity * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 243, 255, ${0.4 + intensity * 0.6})`;
          ctx.fill();

          // Draw electric trace connection line to mouse
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 243, 255, ${intensity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${node.baseAlpha * 0.3})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
    />
  );
}


// ── 3. Magnetic Physics Button Component ─────────────────────────────────────
function MagneticButton({ children, onClick, className = '' }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 160, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}


// ── 4. Interactive 3D Parallax Tilt Card ──────────────────────────────────────
function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl transition-all duration-200 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}


// ── 5. Campus Data Mock Dictionary ──────────────────────────────────────────
const CAMPUS_DATA = {
  USICT: {
    name: 'USICT Main Campus',
    placed: '128 Students',
    topCompany: 'Amazon / IVP',
    avgPackage: '₹11.2 LPA',
    recentDrive: 'Indus Valley Partners — OA Active (6.5 CGPA)',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/60',
  },
  MAIT: {
    name: 'MAIT Sector 22',
    placed: '194 Students',
    topCompany: 'Nagarro / Zomato',
    avgPackage: '₹9.8 LPA',
    recentDrive: 'Nagarro SDE Drive — 42 Candidates Shortlisted',
    badgeColor: 'border-violet-500/40 text-violet-400 bg-violet-950/60',
  },
  MSIT: {
    name: 'MSIT Janakpuri',
    placed: '162 Students',
    topCompany: 'Impressico / Josh Tech',
    avgPackage: '₹9.4 LPA',
    recentDrive: 'Josh Technology Pool Drive — Round 2 Interviews',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/60',
  },
  BVCOE: {
    name: 'BVCOE Paschim Vihar',
    placed: '115 Students',
    topCompany: 'TCS Digital / IVP',
    avgPackage: '₹8.6 LPA',
    recentDrive: 'TCS Digital Drive — 28 Selected for 7+ LPA',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/60',
  },
  BPIT: {
    name: 'BPIT Rohini',
    placed: '98 Students',
    topCompany: 'Newgen / Nagarro',
    avgPackage: '₹8.2 LPA',
    recentDrive: 'Newgen Software — On-Campus Drive Registration',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/60',
  },
};


// ── 6. Main Landing Page Component ─────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCampus, setSelectedCampus] = useState('USICT');

  // API Tester Sandbox State
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('/api/placements/companies');
  const [apiStatus, setApiStatus] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLaunch = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleRegister = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Live API Sandbox Execution Handler
  const executeSandboxApi = () => {
    setIsExecuting(true);
    setApiStatus(null);
    setApiResponse(null);

    setTimeout(() => {
      if (apiUrl.includes('placements')) {
        setApiStatus(200);
        setApiResponse({
          company: 'Indus Valley Partners',
          role: 'Associate Software Engineer',
          avgPackage: '8.5 LPA',
          eligibility: '6.5 CGPA, no active backlogs',
          topTopics: ['OOPs', 'SQL Joins', 'C# / Java', 'DSA Arrays'],
          roundStructure: ['Round 1: Online Assessment', 'Round 2: Tech Interview', 'Round 3: HR'],
          verifiedExperiences: 14,
        });
      } else if (apiUrl.includes('dsa')) {
        setApiStatus(200);
        setApiResponse({
          curriculum: '79 DSA Problems across 23 Days',
          activeDay: 12,
          topic: 'Binary Trees & BST',
          problems: [
            { title: 'Lowest Common Ancestor', difficulty: 'Medium', status: 'completed' },
            { title: 'Serialize & Deserialize Tree', difficulty: 'Hard', status: 'pending' },
          ],
        });
      } else {
        setApiStatus(200);
        setApiResponse({
          userStreak: 7,
          longestStreak: 21,
          totalCommitsThisYear: 847,
          topLanguages: ['JavaScript', 'C++', 'SQL'],
        });
      }
      setIsExecuting(false);
    }, 600);
  };

  const campus = CAMPUS_DATA[selectedCampus];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* 2D Signal Canvas Cursor Tracing */}
      <SignalCanvas />

      {/* Ambient background glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-violet-600/15 to-transparent blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-[900px] right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#070a12]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={32} />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                DEVtrace
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase -mt-1">
                Signal Matrix
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#placements" className="hover:text-cyan-400 transition-colors">IPU Placements</a>
            <a href="#dsa" className="hover:text-cyan-400 transition-colors">DSA Neural Map</a>
            <a href="#sandbox" className="hover:text-cyan-400 transition-colors">API Sandbox</a>
            <a href="#flexcard" className="hover:text-cyan-400 transition-colors">Dev Badge</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <MagneticButton
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <span>Go to Dashboard</span>
                <IconArrowRight size={16} />
              </MagneticButton>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <MagneticButton
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg hover:brightness-110 transition-all shadow-md shadow-cyan-500/20"
                >
                  <span>Get Started Free</span>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner"
          >
            <IconSparkles size={14} className="text-cyan-400 animate-pulse" />
            <span>Built Exclusively for GGSIPU Engineering Developers</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.15]"
          >
            Master Your Code, DSA &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              GGSIPU Campus Placements
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            The all-in-one developer productivity platform. Track tasks, DSA progress, API tests, Pomodoro focus, and access real GGSIPU campus interview experiences across USICT, MAIT, MSIT, BVCOE & BPIT.
          </motion.p>

          {/* ── Campus Recalibration Switcher ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl"
          >
            {Object.keys(CAMPUS_DATA).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCampus(key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedCampus === key
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {key}
              </button>
            ))}
          </motion.div>

          {/* Campus Live Feed Banner */}
          <motion.div
            key={selectedCampus}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-mono border ${campus.badgeColor}`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span><strong>{campus.name}:</strong> {campus.recentDrive}</span>
          </motion.div>

          {/* CTA Group with Magnetic Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton
              onClick={handleLaunch}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 rounded-xl hover:brightness-110 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group"
            >
              <span>{user ? 'Open Your Dashboard' : 'Launch Dashboard Now'}</span>
              <IconArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <a
              href="#placements"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <IconGraduationCap size={18} className="text-cyan-400" />
              <span>Explore GGSIPU Hub</span>
            </a>
          </motion.div>

          {/* Live 3D Parallax Product Preview Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 relative max-w-5xl mx-auto"
          >
            <TiltCard className="text-left">
              {/* Window Header Dots */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">devtrace.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {selectedCampus} Signal Live
                </div>
              </div>

              {/* Dynamic Mock Dashboard Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {/* Card 1: Campus Drive */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-cyan-400 mb-2">
                    <IconBuilding size={20} />
                    <span className="text-[11px] font-mono bg-cyan-950 px-2 py-0.5 rounded text-cyan-300">Drive Sync</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{campus.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Top Recruiter: {campus.topCompany} • {campus.avgPackage}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span>{campus.placed}</span>
                    <span className="text-emerald-400">Verified Feed</span>
                  </div>
                </div>

                {/* Card 2: DSA Tracker */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-violet-400 mb-2">
                    <IconCode size={20} />
                    <span className="text-[11px] font-mono bg-violet-950 px-2 py-0.5 rounded text-violet-300">23 Days</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">DSA Curriculum</h4>
                  <p className="text-xs text-slate-400 mt-1">Arrays, Trees, Graphs, DP</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span>Progress: 42/79</span>
                    <span className="text-violet-400">Day 12 Active</span>
                  </div>
                </div>

                {/* Card 3: Developer Activity */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <IconFlame size={20} />
                    <span className="text-[11px] font-mono bg-amber-950 px-2 py-0.5 rounded text-amber-300">7 Day Streak</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">GitHub Telemetry</h4>
                  <p className="text-xs text-slate-400 mt-1">847 Commits • 42 Repositories</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span>Top: JavaScript</span>
                    <span className="text-amber-400">Streak Active</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </section>

      {/* ── GGSIPU Placements Section ────────────────────────────────────── */}
      <section id="placements" className="py-20 bg-slate-950/70 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Placement Prep Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
              Tailored for GGSIPU Campus & Pool Drives
            </h2>
            <p className="text-slate-400 mt-4 text-base">
              Real interview debriefs, question banks, company-wise topic trends, and round roadmaps from placed seniors across top IPU engineering colleges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <TiltCard>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <IconBuilding size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Split-Pane Company Directory</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Browse company profiles visiting IPU campuses (IVP, Nagarro, Impressico, Josh Tech) with selection rates, round structures, and CGPA criteria.
              </p>
            </TiltCard>

            <TiltCard>
              <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5">
                <IconBookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">GGSIPU Question Bank</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Filter past technical and HR interview questions by company, topic (OOPs, SQL, DSA), difficulty level, and interview round.
              </p>
            </TiltCard>

            <TiltCard>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <IconUserCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Verified Peer Debriefs</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Read authentic candidate experiences detailing round-by-round tips, service agreement bonds, eligibility rules, and actual questions asked.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── Interactive API Sandbox Simulator ──────────────────────────────── */}
      <section id="sandbox" className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Live Interactive Sandbox
            </span>
            <h2 className="text-3xl font-extrabold text-slate-100 mt-2">
              Test DEVtrace APIs Directly in Your Browser
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Our API proxy engine bypasses browser CORS limits and logs JSON responses server-side.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
            {/* Address Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pb-4 border-b border-slate-800">
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-mono font-bold bg-slate-950 text-emerald-400 border border-slate-700 rounded-lg focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full flex-1 px-3 py-2 text-xs font-mono bg-slate-950 text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={executeSandboxApi}
                disabled={isExecuting}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <IconPlay size={14} />
                <span>{isExecuting ? 'Sending Signal...' : 'Send Signal'}</span>
              </button>
            </div>

            {/* Quick URL Selectors */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Quick Endpoints:</span>
              <button
                onClick={() => setApiUrl('/api/placements/companies')}
                className="px-2 py-1 bg-slate-950 hover:text-cyan-400 rounded border border-slate-800"
              >
                /placements/companies
              </button>
              <button
                onClick={() => setApiUrl('/api/dsa/problems')}
                className="px-2 py-1 bg-slate-950 hover:text-violet-400 rounded border border-slate-800"
              >
                /dsa/problems
              </button>
              <button
                onClick={() => setApiUrl('/api/profile/activity')}
                className="px-2 py-1 bg-slate-950 hover:text-amber-400 rounded border border-slate-800"
              >
                /profile/activity
              </button>
            </div>

            {/* Response Viewer */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[160px] text-xs font-mono">
              <div className="flex items-center justify-between text-slate-500 pb-2 mb-2 border-b border-slate-900">
                <span>STATUS: {apiStatus ? <strong className="text-emerald-400">200 OK</strong> : 'Ready'}</span>
                <span>TYPE: application/json</span>
              </div>
              {isExecuting ? (
                <div className="text-cyan-400 animate-pulse py-4">Fetching data payload...</div>
              ) : apiResponse ? (
                <pre className="text-slate-300 overflow-x-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 italic py-4">Click "Send Signal" above to execute real-time API test request.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dev Flex Card Studio Section ───────────────────────────────────── */}
      <section id="flexcard" className="py-20 bg-slate-950/60 border-y border-slate-800/80 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
                Social Flex Engine
              </span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-2">
                Generate Your GGSIPU Developer Card
              </h2>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                Showcase your DSA problem count, GitHub streak, and placement readiness badge directly to WhatsApp class groups and LinkedIn.
              </p>
              <div className="mt-6 space-y-3 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <IconCheckCircle size={16} className="text-emerald-400" />
                  <span>Auto-synced with LeetCode & GitHub stats</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheckCircle size={16} className="text-emerald-400" />
                  <span>College-wise rank verification tag</span>
                </div>
              </div>
            </div>

            {/* Dynamic Card Preview */}
            <TiltCard className="bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Logo size={24} />
                  <span className="font-bold text-sm text-cyan-400">DEVtrace Badge</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {selectedCampus} Verified
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono">Developer Profile</div>
                  <div className="text-base font-bold text-slate-100">IPU Engineering Student</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-slate-400">DSA Solved</div>
                    <div className="text-violet-400 font-bold">42 / 79 Problems</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Active Streak</div>
                    <div className="text-amber-400 font-bold">7 Consecutive Days</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">devtracedash.netlify.app</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <IconShare2 size={12} /> Share Card
                </span>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ────────────────────────────────────────── */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Ready to Accelerate Your Developer Growth?
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
              Join engineering developers across GGSIPU tracking their daily progress, mastering DSA, and cracking top campus placement drives.
            </p>
            <div className="mt-8 flex justify-center">
              <MagneticButton
                onClick={handleRegister}
                className="px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 rounded-xl hover:brightness-110 transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2"
              >
                <span>{user ? 'Go to Dashboard' : 'Get Started Free Today'}</span>
                <IconArrowRight size={18} />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-800/80 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-semibold text-slate-300">DEVtrace</span>
            <span>— Developer Dashboard & Placement Hub</span>
          </div>
          <div>
            Built with React, Node.js & PostgreSQL • GGSIPU Signal Matrix
          </div>
        </div>
      </footer>
    </div>
  );
}
