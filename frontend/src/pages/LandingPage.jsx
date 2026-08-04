import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

// ── Palette ──────────────────────────────────────────────────────────────────
// Single source of truth for the landing page's look. Change these values to
// retheme the whole page.
const C = {
  bg: '#08080C',
  surface: '#0F0F15',
  surface2: '#14141B',
  border: '#22222C',
  text: '#F2F2F5',
  soft: '#A9A9B8',
  muted: '#75758A',
};
const GRAD = 'linear-gradient(100deg, #8B5CF6 0%, #A78BFA 45%, #F0A08C 100%)';

const gradientText = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

// ── Inline SVG icons ─────────────────────────────────────────────────────────
const IconSvg = ({ children, size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const IconArrowRight = (p) => <IconSvg {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></IconSvg>;
const IconChevronLeft = (p) => <IconSvg {...p}><path d="m15 18-6-6 6-6" /></IconSvg>;
const IconBuilding = (p) => (
  <IconSvg {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M8 10h.01M8 14h.01M16 10h.01M16 14h.01" />
  </IconSvg>
);
const IconBookOpen = (p) => (
  <IconSvg {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconSvg>
);
const IconTrend = (p) => <IconSvg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></IconSvg>;
const IconPlay = (p) => <IconSvg {...p}><polygon points="6 3 20 12 6 21 6 3" /></IconSvg>;
const IconCopy = (p) => <IconSvg {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></IconSvg>;
const IconCheck = (p) => <IconSvg {...p}><polyline points="20 6 9 17 4 12" /></IconSvg>;
const IconShare = (p) => (
  <IconSvg {...p}>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
  </IconSvg>
);
const IconLayers = (p) => <IconSvg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></IconSvg>;
const IconTimer = (p) => <IconSvg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></IconSvg>;
const IconCode = (p) => <IconSvg {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></IconSvg>;
const IconZap = (p) => <IconSvg {...p}><path d="m13 2-3 7h5l-3 7" /></IconSvg>;
const IconCalendar = (p) => <IconSvg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconSvg>;
const IconHelp = (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconSvg>;
const IconGithub = (p) => (
  <IconSvg {...p}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </IconSvg>
);
const IconFlame = (p) => (
  <IconSvg {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </IconSvg>
);

// ── Shared primitives ────────────────────────────────────────────────────────
const GradientButton = ({ children, onClick, className = '', size = 'md' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-[#0B0713] transition-transform duration-200 hover:-translate-y-0.5 ${
      size === 'lg' ? 'px-7 py-3.5 text-[15px]' : 'px-4 py-2 text-sm'
    } ${className}`}
    style={{ backgroundImage: GRAD }}
  >
    {children}
  </button>
);

const Eyebrow = ({ children }) => (
  <span className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
    {children}
  </span>
);

const Panel = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-xl ${className}`}
    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, ...style }}
  >
    {children}
  </div>
);

const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`relative z-10 px-5 sm:px-8 py-20 sm:py-24 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
);

const SectionHead = ({ eyebrow, title, body, center = true }) => (
  <div className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="mt-3 text-[28px] sm:text-[33px] font-bold tracking-tight leading-tight" style={{ color: C.text }}>
      {title}
    </h2>
    {body && <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.soft }}>{body}</p>}
  </div>
);

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
};

// ── Content ──────────────────────────────────────────────────────────────────
const CAMPUS_DATA = {
  USICT: { name: 'USICT Main Campus', topCompany: 'Amazon / IVP', avgPackage: '₹11.2 LPA' },
  MAIT: { name: 'MAIT Sector 22', topCompany: 'Nagarro / Zomato', avgPackage: '₹9.8 LPA' },
  MSIT: { name: 'MSIT Janakpuri', topCompany: 'Impressico / Josh Tech', avgPackage: '₹9.4 LPA' },
  BVCOE: { name: 'BVCOE Paschim Vihar', topCompany: 'TCS Digital / IVP', avgPackage: '₹8.6 LPA' },
  BPIT: { name: 'BPIT Rohini', topCompany: 'Newgen / Nagarro', avgPackage: '₹8.2 LPA' },
};

// Every number below is counted from the seeded dataset — nothing invented.
const STATS = [
  { n: '16', label: 'companies' },
  { n: '22', label: 'interview debriefs' },
  { n: '50', label: 'tagged questions' },
  { n: '79', label: 'DSA problems' },
  { n: '23', label: 'day curriculum' },
];

const FEATURES = [
  {
    icon: <IconBuilding size={20} />,
    title: 'Split-Pane Company Directory',
    body: 'Browse companies visiting IPU campuses — IVP, Nagarro, Impressico, Josh Technology — with selection rates, round structures, and CGPA criteria.',
  },
  {
    icon: <IconBookOpen size={20} />,
    title: 'Real Interview Debriefs',
    body: 'Round-by-round experiences from placed seniors: questions actually asked, service bonds, eligibility rules, and what to prepare.',
  },
  {
    icon: <IconTrend size={20} />,
    title: 'Company-Wise Topic Trends',
    body: 'See which topics each company leans on — OOPs, SQL, DSA, System Design — weighted by how often they appear in real rounds.',
  },
];

// Real problems and days from the seeded DSA curriculum.
const DSA_DAYS = [
  {
    day: 15,
    topic: 'Trees Basic',
    problems: [
      { title: 'Invert Binary Tree', diff: 'Easy', done: true },
      { title: 'Maximum Depth of Binary Tree', diff: 'Easy', done: true },
      { title: 'Diameter of Binary Tree', diff: 'Easy', done: true },
      { title: 'Balanced Binary Tree', diff: 'Easy', done: true },
    ],
  },
  {
    day: 16,
    topic: 'Trees Traversal',
    problems: [
      { title: 'Binary Tree Level Order Traversal', diff: 'Medium', done: true },
      { title: 'Binary Tree Zigzag Level Order', diff: 'Medium', done: true },
      { title: 'Binary Tree Right Side View', diff: 'Medium', done: false },
    ],
  },
  {
    day: 17,
    topic: 'BST',
    problems: [
      { title: 'Validate Binary Search Tree', diff: 'Medium', done: false },
      { title: 'Lowest Common Ancestor of BST', diff: 'Medium', done: false },
      { title: 'Kth Smallest Element in a BST', diff: 'Medium', done: false },
    ],
  },
];

const DIFF_TONE = {
  Easy: { bg: '#0E2417', fg: '#4ADE80' },
  Medium: { bg: '#2A2410', fg: '#FACC15' },
  Hard: { bg: '#2A1215', fg: '#F87171' },
};

// Companies grouped by the months they actually visit campus (from the dataset).
const CALENDAR = [
  { month: 'September', companies: ['Indus Valley Partners', 'To The New', 'Infosys', 'Yamaha', 'Symbiotic Consulting'] },
  { month: 'October', companies: ['Nagarro', 'Unthinkable Solutions', 'Crowe', 'bangMetrix', 'Zinnia', 'Invansys'] },
  { month: 'November', companies: ['TCS', 'Cvent', 'Descartes', 'CloudKeeper', 'NextThoughts'] },
];

const TOOLKIT = [
  { icon: <IconLayers size={18} />, title: 'Workspace', body: 'Tasks, notes and goals in one view — status cycling, priorities, due dates, pinning.' },
  { icon: <IconTimer size={18} />, title: 'Pomodoro', body: '25/5 focus cycles with browser notifications when each block ends.' },
  { icon: <IconCode size={18} />, title: 'Snippets', body: 'Save reusable code by language with one-click copy to clipboard.' },
  { icon: <IconZap size={18} />, title: 'API Tester', body: 'Send any HTTP method, inspect the response, and keep a request history.' },
  { icon: <IconHelp size={18} />, title: 'Question Bank', body: 'Filter past questions by company, topic, round, and difficulty.' },
  { icon: <IconCalendar size={18} />, title: 'Campus Calendar', body: 'Know which companies visit which month before the season starts.' },
];

// Deterministic pseudo-random contribution levels (0–4) so the grid is stable
// across renders without pulling in real data on a public page.
const heatLevel = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  const f = x - Math.floor(x);
  return f > 0.82 ? 4 : f > 0.68 ? 3 : f > 0.5 ? 2 : f > 0.3 ? 1 : 0;
};
const HEAT_TONES = ['#16161E', '#2E1A54', '#4C2A8C', '#7C4DDB', '#A78BFA'];

const THEME_SWATCHES = {
  Neon: { bg: '#070A12', surface: '#0D1320', text: '#E7F0FF', accent: '#22D3EE', border: '#1E2A40' },
  Black: { bg: '#0A0A0A', surface: '#141414', text: '#FFFFFF', accent: '#FFFFFF', border: '#2A2A2A' },
  White: { bg: '#F6F6F6', surface: '#FFFFFF', text: '#0A0A0A', accent: '#0A0A0A', border: '#E3E3E3' },
};

// ── Hero product mock ────────────────────────────────────────────────────────
function ProductMock() {
  return (
    <Panel className="overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="mono text-[10px] mx-auto px-3 py-0.5 rounded" style={{ backgroundColor: C.surface2, color: C.muted }}>
          devtrace.app/dashboard
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: C.text }}>Placement Readiness</span>
          <span className="mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: '#1C1430', color: '#C4B5FD' }}>USICT</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="mono text-3xl font-bold" style={gradientText}>62%</span>
          <span className="mono text-[10px]" style={{ color: C.muted }}>ready for Indus Valley Partners</span>
        </div>

        {[
          { label: 'DSA', value: 51, tone: '#8B5CF6' },
          { label: 'OOPs', value: 33, tone: '#A78BFA' },
          { label: 'DBMS / SQL', value: 67, tone: '#F0A08C' },
        ].map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between mono text-[10px]" style={{ color: C.soft }}>
              <span>{row.label}</span><span>{row.value}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.surface2 }}>
              <div className="h-full rounded-full" style={{ width: `${row.value}%`, backgroundColor: row.tone }} />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2 pt-1">
          {[{ k: 'DSA solved', v: '42 / 79' }, { k: 'Active streak', v: '7 days' }].map((s) => (
            <div key={s.k} className="rounded-lg px-3 py-2" style={{ backgroundColor: C.surface2 }}>
              <div className="mono text-[9px] uppercase tracking-wider" style={{ color: C.muted }}>{s.k}</div>
              <div className="mono text-xs font-semibold mt-0.5" style={{ color: C.text }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCampus, setSelectedCampus] = useState('USICT');
  const campus = CAMPUS_DATA[selectedCampus];

  const [swatch, setSwatch] = useState('Neon');
  const sw = THEME_SWATCHES[swatch];

  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('/api/placements/companies');
  const [apiResponse, setApiResponse] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLaunch = () => navigate(user ? '/dashboard' : '/login');
  const handleRegister = () => navigate(user ? '/dashboard' : '/register');

  const executeSandboxApi = () => {
    setIsExecuting(true);
    setApiResponse(null);
    setTimeout(() => {
      if (apiUrl.includes('placements')) {
        setApiResponse({
          company: 'Indus Valley Partners',
          role: 'Associate Software Engineer',
          eligibility: '6.5 CGPA, no active backlogs',
          topTopics: ['OOPs', 'SQL Joins', 'DSA Arrays'],
          rounds: ['Online Assessment', 'Technical Interview', 'Director Round', 'HR'],
          verifiedExperiences: 14,
        });
      } else if (apiUrl.includes('dsa')) {
        setApiResponse({
          curriculum: '79 problems across 23 days',
          activeDay: 16,
          topic: 'Trees Traversal',
          problems: [
            { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', status: 'completed' },
            { title: 'Binary Tree Right Side View', difficulty: 'Medium', status: 'pending' },
          ],
        });
      } else {
        setApiResponse({ currentStreak: 7, longestStreak: 21, commitsThisYear: 847, topLanguages: ['JavaScript', 'C++', 'SQL'] });
      }
      setIsExecuting(false);
    }, 600);
  };

  const navLinks = [
    { href: '#placements', label: 'IPU Placements' },
    { href: '#dsa', label: 'DSA Tracker' },
    { href: '#sandbox', label: 'API Sandbox' },
    { href: '#toolkit', label: 'Toolkit' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: C.bg, color: C.text }}>
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] rounded-full blur-[140px] opacity-40"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(8,8,12,0.72)', borderBottom: `1px solid ${C.border}` }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-bold text-[17px] tracking-tight" style={{ color: C.text }}>DEVtrace</span>
          </button>

          <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: C.soft }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <GradientButton onClick={() => navigate('/dashboard')}>Go to Dashboard</GradientButton>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm transition-colors hover:text-white" style={{ color: C.soft }}>
                  Log In
                </button>
                <GradientButton onClick={() => navigate('/register')}>Get Started Free</GradientButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mono text-[10px] uppercase tracking-[0.16em]"
              style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.soft }}
            >
              <IconChevronLeft size={12} />
              Built exclusively for GGSIPU engineering developers
            </span>

            <h1 className="mt-7 font-extrabold tracking-tight leading-[1.08] text-[42px] sm:text-[56px]" style={{ color: C.text }}>
              Master Your Code, DSA &{' '}
              <span style={gradientText}>GGSIPU Campus Placements</span>
            </h1>

            <p className="mt-6 text-[15px] leading-relaxed max-w-md" style={{ color: C.soft }}>
              The all-in-one developer productivity platform for GGSIPU students preparing for
              top-tier tech placements.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <GradientButton size="lg" onClick={handleRegister}>
                {user ? 'Open Dashboard' : 'Get Started Free'}
              </GradientButton>
              <a
                href="#placements"
                className="inline-flex items-center gap-2 text-[15px] font-semibold transition-colors hover:text-white"
                style={{ color: C.text }}
              >
                Explore GGSIPU Hub
                <IconArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative lg:-mr-24 xl:-mr-32"
            style={{ perspective: '1600px' }}
          >
            <div style={{ transform: 'rotateY(-16deg) rotateX(4deg) rotateZ(1deg)', transformStyle: 'preserve-3d' }}>
              <ProductMock />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Numbers strip ───────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 sm:px-8">
        <motion.div {...fadeUp} className="max-w-6xl mx-auto">
          <Panel className="px-6 py-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="mono text-[26px] font-bold" style={gradientText}>{s.n}</div>
                <div className="mono text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </Panel>
        </motion.div>
      </div>

      {/* ── Placements ──────────────────────────────────────────────────── */}
      <Section id="placements">
        <motion.div {...fadeUp}>
          <SectionHead
            eyebrow="Placement Prep Matrix"
            title="Tailored for GGSIPU Campus & Pool Drives"
            body="Real interview debriefs, question banks, and round roadmaps from placed seniors across top IPU engineering colleges."
          />
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Panel className="p-6 h-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.surface2, color: C.soft }}>
                  {f.icon}
                </div>
                <h3 className="mt-5 text-[17px] font-semibold" style={{ color: C.text }}>{f.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: C.soft }}>{f.body}</p>
              </Panel>
            </motion.div>
          ))}
        </div>

        {/* Campus strip */}
        <motion.div {...fadeUp} className="mt-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(CAMPUS_DATA).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCampus(key)}
                  className="px-3.5 py-1.5 rounded-lg mono text-[11px] font-semibold transition-colors"
                  style={selectedCampus === key ? { backgroundImage: GRAD, color: '#0B0713' } : { backgroundColor: C.surface2, color: C.soft }}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {[
                { k: 'Campus', v: campus.name },
                { k: 'Top recruiters', v: campus.topCompany },
                { k: 'Average package', v: campus.avgPackage },
              ].map((s) => (
                <div key={s.k}>
                  <div className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>{s.k}</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: C.text }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </Section>

      {/* ── Campus calendar ─────────────────────────────────────────────── */}
      <Section id="calendar">
        <motion.div {...fadeUp}>
          <SectionHead
            eyebrow="Drive Season"
            title="Know who visits campus, and when"
            body="Companies grouped by the month they run their IPU drives — so you prepare for the right rounds at the right time."
          />
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {CALENDAR.map((m, i) => (
            <motion.div key={m.month} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Panel className="p-5 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold" style={{ color: C.text }}>{m.month}</span>
                  <span className="mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: C.surface2, color: C.muted }}>
                    {m.companies.length} drives
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.companies.map((c) => (
                    <span
                      key={c}
                      className="mono text-[10.5px] px-2 py-1 rounded"
                      style={{ backgroundColor: C.surface2, color: C.soft, border: `1px solid ${C.border}` }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── DSA Tracker ─────────────────────────────────────────────────── */}
      <Section id="dsa">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <SectionHead
              eyebrow="Structured Practice"
              center={false}
              title="A 23-day DSA curriculum that tracks itself"
              body="79 curated problems grouped by day and topic — arrays through dynamic programming. Tick problems off and your progress persists across devices."
            />
            <div className="mt-7 flex items-center gap-8">
              <div>
                <div className="mono text-[28px] font-bold" style={gradientText}>42 / 79</div>
                <div className="mono text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: C.muted }}>problems solved</div>
              </div>
              <div>
                <div className="mono text-[28px] font-bold" style={{ color: C.text }}>Day 16</div>
                <div className="mono text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: C.muted }}>currently active</div>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full overflow-hidden max-w-sm" style={{ backgroundColor: C.surface2 }}>
              <div className="h-full rounded-full" style={{ width: '53%', backgroundImage: GRAD }} />
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <Panel className="p-5 space-y-5">
              {DSA_DAYS.map((d) => (
                <div key={d.day}>
                  <div className="flex items-center justify-between pb-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <span className="mono text-[11px] font-semibold" style={{ color: C.text }}>
                      Day {d.day} · {d.topic}
                    </span>
                    <span className="mono text-[10px]" style={{ color: C.muted }}>
                      {d.problems.filter((p) => p.done).length}/{d.problems.length}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {d.problems.map((p) => (
                      <li key={p.title} className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={
                            p.done
                              ? { backgroundImage: GRAD, color: '#0B0713' }
                              : { border: `1px solid ${C.border}`, backgroundColor: C.surface2 }
                          }
                        >
                          {p.done && <IconCheck size={10} />}
                        </span>
                        <span
                          className="text-[12.5px] flex-1 truncate"
                          style={{ color: p.done ? C.muted : C.text, textDecoration: p.done ? 'line-through' : 'none' }}
                        >
                          {p.title}
                        </span>
                        <span
                          className="mono text-[9.5px] px-1.5 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: DIFF_TONE[p.diff].bg, color: DIFF_TONE[p.diff].fg }}
                        >
                          {p.diff}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Panel>
          </motion.div>
        </div>
      </Section>

      {/* ── GitHub telemetry ────────────────────────────────────────────── */}
      <Section id="github">
        <motion.div {...fadeUp}>
          <SectionHead
            eyebrow="GitHub OAuth"
            title="Your real commit history, in your dashboard"
            body="Connect GitHub once and DevTrace pulls your contribution calendar, streaks, top repositories, and open pull requests."
          />
        </motion.div>

        <motion.div {...fadeUp} className="mt-12">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5" style={{ color: C.soft }}>
                <IconGithub size={17} />
                <span className="mono text-[11px]">contributions · last 52 weeks</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mono text-[10px]" style={{ color: C.muted }}>
                <span>less</span>
                {HEAT_TONES.map((t) => (
                  <span key={t} className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: t }} />
                ))}
                <span>more</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-max">
                {Array.from({ length: 52 * 7 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[9px] h-[9px] rounded-[2px]"
                    style={{ backgroundColor: HEAT_TONES[heatLevel(i)] }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
              {[
                { icon: <IconFlame size={15} />, k: 'Current streak', v: '7 days' },
                { icon: <IconTrend size={15} />, k: 'Longest streak', v: '21 days' },
                { icon: <IconGithub size={15} />, k: 'Commits this year', v: '847' },
              ].map((s) => (
                <div key={s.k}>
                  <div className="flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
                    {s.icon}<span className="hidden sm:inline">{s.k}</span>
                  </div>
                  <div className="mono text-[19px] font-bold mt-1.5" style={{ color: C.text }}>{s.v}</div>
                  <div className="sm:hidden mono text-[9px] mt-0.5" style={{ color: C.muted }}>{s.k}</div>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </Section>

      {/* ── API Sandbox ─────────────────────────────────────────────────── */}
      <Section id="sandbox">
        <motion.div {...fadeUp}>
          <SectionHead
            title="In-Browser API Sandbox"
            body="Test endpoints, inspect responses, and format JSON without leaving your workflow."
          />
        </motion.div>

        <motion.div {...fadeUp} className="mt-12">
          <Panel className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: C.surface2, borderBottom: `1px solid ${C.border}` }}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="mono text-[10px] mx-auto px-3 py-0.5 rounded" style={{ backgroundColor: C.bg, color: C.muted }}>
                devtrace.app/sandbox
              </span>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="p-5 space-y-4" style={{ borderRight: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2">
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value)}
                    className="mono text-xs font-semibold px-2.5 py-2 rounded-lg focus:outline-none"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 mono text-xs px-3 py-2 rounded-lg focus:outline-none"
                    style={{ backgroundColor: C.surface2, color: C.soft, border: `1px solid ${C.border}` }}
                  />
                </div>

                <div
                  className="rounded-lg h-40 flex items-center justify-center mono text-[11px]"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                >
                  Query Params / Body Payload Builder Area
                </div>

                <div className="flex flex-wrap gap-2">
                  {['/api/placements/companies', '/api/dsa/problems', '/api/profile/activity'].map((ep) => (
                    <button
                      key={ep}
                      onClick={() => setApiUrl(ep)}
                      className="mono text-[10px] px-2 py-1 rounded transition-colors"
                      style={{ backgroundColor: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}
                    >
                      {ep.replace('/api', '')}
                    </button>
                  ))}
                </div>

                <GradientButton onClick={executeSandboxApi}>
                  <IconPlay size={12} />
                  {isExecuting ? 'Sending…' : 'Send Request'}
                </GradientButton>
              </div>

              <div className="p-5" style={{ backgroundColor: C.bg }}>
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 mono text-[11px]">
                    <span className="px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: '#0E2417', color: '#4ADE80' }}>
                      {apiResponse ? '200 OK' : '—'}
                    </span>
                    <span style={{ color: C.muted }}>42ms</span>
                    <span style={{ color: C.muted }}>1.2kb</span>
                  </div>
                  <span style={{ color: C.muted }}><IconCopy size={13} /></span>
                </div>

                <pre className="mono text-[11px] leading-relaxed mt-3 overflow-x-auto min-h-[220px]" style={{ color: C.soft }}>
                  {isExecuting ? 'Fetching payload…' : apiResponse ? JSON.stringify(apiResponse, null, 2) : 'Click "Send Request" to run a sample query.'}
                </pre>
              </div>
            </div>
          </Panel>
        </motion.div>
      </Section>

      {/* ── Toolkit grid ────────────────────────────────────────────────── */}
      <Section id="toolkit">
        <motion.div {...fadeUp}>
          <SectionHead
            eyebrow="One Workspace"
            title="Everything else you open a tab for"
            body="The small tools that add up — all behind the same login, all synced to your account."
          />
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLKIT.map((t, i) => (
            <motion.div key={t.title} {...fadeUp} transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}>
              <Panel className="p-5 h-full flex gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: C.surface2, color: C.soft }}
                >
                  {t.icon}
                </div>
                <div>
                  <h3 className="text-[14.5px] font-semibold" style={{ color: C.text }}>{t.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: C.soft }}>{t.body}</p>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Theme switcher ──────────────────────────────────────────────── */}
      <Section id="themes">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <SectionHead
              eyebrow="Make it yours"
              center={false}
              title="Three themes, one keystroke away"
              body="Neon, Black and White — every surface, border and accent is driven by CSS variables, so switching restyles the entire app instantly."
            />
            <div className="mt-7 flex gap-2">
              {Object.keys(THEME_SWATCHES).map((k) => (
                <button
                  key={k}
                  onClick={() => setSwatch(k)}
                  className="px-4 py-2 rounded-lg mono text-[11px] font-semibold transition-colors"
                  style={swatch === k ? { backgroundImage: GRAD, color: '#0B0713' } : { backgroundColor: C.surface2, color: C.soft }}
                >
                  {k}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <div
              className="rounded-xl p-5 transition-colors duration-300"
              style={{ backgroundColor: sw.bg, border: `1px solid ${sw.border}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: sw.text }}>Today</span>
                <span className="mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: sw.surface, color: sw.accent }}>
                  7 day streak
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[{ k: 'Tasks', v: '6' }, { k: 'Notes', v: '14' }, { k: 'Solved', v: '42' }].map((s) => (
                  <div key={s.k} className="rounded-lg p-3" style={{ backgroundColor: sw.surface, border: `1px solid ${sw.border}` }}>
                    <div className="mono text-[20px] font-bold" style={{ color: sw.accent }}>{s.v}</div>
                    <div className="mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: sw.text, opacity: 0.6 }}>{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: sw.surface }}>
                <div className="h-full rounded-full" style={{ width: '53%', backgroundColor: sw.accent }} />
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Dev Badge (not yet built — labelled as such) ─────────────────── */}
      <Section id="badge">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3">
              <Eyebrow>Share your progress</Eyebrow>
              <span
                className="mono text-[9.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded"
                style={{ backgroundColor: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}
              >
                In development
              </span>
            </div>
            <h2 className="mt-3 text-[28px] sm:text-[33px] font-bold tracking-tight leading-tight" style={{ color: C.text }}>
              Generate Your GGSIPU Developer Card
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed max-w-xl" style={{ color: C.soft }}>
              A single shareable card combining your DSA count, GitHub streak, and campus — built
              from data DevTrace already tracks. Coming soon.
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <Panel className="p-5" style={{ opacity: 0.85 }}>
              <div className="flex items-center justify-between pb-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2">
                  <Logo size={22} />
                  <span className="text-sm font-semibold" style={{ color: C.text }}>DEVtrace Badge</span>
                </div>
                <span className="mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: '#1C1430', color: '#C4B5FD' }}>
                  {selectedCampus}
                </span>
              </div>

              <div className="mt-4">
                <div className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>Developer profile</div>
                <div className="mt-1 text-[15px] font-semibold" style={{ color: C.text }}>IPU Engineering Student</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                {[{ k: 'DSA solved', v: '42 / 79' }, { k: 'Active streak', v: '7 days' }].map((s) => (
                  <div key={s.k}>
                    <div className="mono text-[10px]" style={{ color: C.muted }}>{s.k}</div>
                    <div className="mono text-sm font-bold mt-0.5" style={gradientText}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3.5 flex items-center justify-between mono text-[10px]" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>
                <span>devtracedash.netlify.app</span>
                <span className="flex items-center gap-1.5"><IconShare size={11} /> Share card</span>
              </div>
            </Panel>
          </motion.div>
        </div>
      </Section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <Section>
        <motion.div {...fadeUp}>
          <Panel className="px-6 py-16 text-center relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full blur-[110px] opacity-25"
              style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
            />
            <h2 className="relative text-[26px] sm:text-[32px] font-bold tracking-tight" style={{ color: C.text }}>
              Start tracking what actually <span style={gradientText}>gets you placed.</span>
            </h2>
            <div className="relative mt-8 flex justify-center">
              <GradientButton size="lg" onClick={handleRegister}>
                {user ? 'Go to Dashboard' : 'Create Free Account'}
              </GradientButton>
            </div>
            <p className="relative mt-6 mono text-[11px]" style={{ color: C.muted }}>
              Built for GGSIPU students · Free forever for individuals
            </p>
          </Panel>
        </motion.div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-5 sm:px-8 pt-16 pb-8" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="font-bold text-[15px]" style={{ color: C.text }}>DEVtrace</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed max-w-[240px]" style={{ color: C.muted }}>
              The technical workspace engineered for GGSIPU developers aiming for top-tier placements.
            </p>
          </div>

          {[
            { title: 'Product', links: ['Dashboard', 'Workspace', 'DSA Tracker', 'Snippets', 'Pomodoro Timer'] },
            { title: 'Placements', links: ['Company Directory', 'Interview Debriefs', 'Question Bank', 'Campus Calendar'] },
            { title: 'Developer', links: ['API Sandbox', 'GitHub Profile', 'Themes'] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-[13px] font-semibold" style={{ color: C.text }}>{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <button onClick={handleLaunch} className="text-[13px] transition-colors hover:text-white text-left" style={{ color: C.muted }}>
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="max-w-6xl mx-auto mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 mono text-[11px]"
          style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}
        >
          <span>© {new Date().getFullYear()} DevTrace. Built for developers.</span>
          <span>React · Node.js · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
