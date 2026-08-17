import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, Label, Page } from '../components/ui';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const PRESETS = [
  { id: 'classic', label: '25 / 5', work: 25 * 60, break: 5 * 60 },
  { id: 'long', label: '50 / 10', work: 50 * 60, break: 10 * 60 },
  { id: 'short', label: '15 / 3', work: 15 * 60, break: 3 * 60 },
];

const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IconPlay = <Icon d={<polygon points="6 3 20 12 6 21 6 3" />} />;
const IconPause = <Icon d={<><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>} />;
const IconReset = <Icon d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>} />;
const IconExpand = <Icon d={<><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>} />;
const IconShrink = <Icon d={<><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></>} />;

/** Progress ring — gradient stroke driven by the active theme. */
function Ring({ progress, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" className="-rotate-90 absolute inset-0">
      <defs>
        <linearGradient id="pomo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
      <circle
        cx="110" cy="110" r={RADIUS}
        fill="none"
        stroke="url(#pomo-grad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 0.4s linear' }}
      />
    </svg>
  );
}

export default function PomodoroPage() {
  const [presetId, setPresetId] = useState(() => localStorage.getItem('pomodoroPreset') || 'classic');
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];

  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(preset.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => Number(localStorage.getItem('pomodoroSessions')) || 0);
  const [isFull, setIsFull] = useState(false);
  const [flash, setFlash] = useState('');

  const shellRef = useRef(null);
  const deadlineRef = useRef(null);

  const total = mode === 'work' ? preset.work : preset.break;
  const isWork = mode === 'work';
  const progress = total > 0 ? (total - secondsLeft) / total : 0;

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => { localStorage.setItem('pomodoroSessions', String(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('pomodoroPreset', presetId); }, [presetId]);

  // Countdown driven by a wall-clock deadline rather than by counting ticks.
  // Browsers throttle timers in background tabs to roughly once a minute, so a
  // tick-counting timer silently loses minutes while you work in another tab.
  useEffect(() => {
    if (!running) return undefined;

    if (deadlineRef.current == null) deadlineRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      const remaining = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      setSecondsLeft(Math.ceil(remaining));
      if (remaining <= 0) finish();
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const notify = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    setFlash(body);
    setTimeout(() => setFlash(''), 6000);
  };

  const finish = useCallback(() => {
    setRunning(false);
    deadlineRef.current = null;
    setMode((m) => {
      if (m === 'work') {
        setSessions((s) => s + 1);
        setSecondsLeft(preset.break);
        notify('Focus block complete', 'Time for a break.');
        return 'break';
      }
      setSecondsLeft(preset.work);
      notify('Break over', 'Back to focus.');
      return 'work';
    });
  }, [preset]);

  const start = () => {
    deadlineRef.current = Date.now() + secondsLeft * 1000;
    setRunning(true);
  };
  const pause = () => { deadlineRef.current = null; setRunning(false); };
  const reset = () => {
    deadlineRef.current = null;
    setRunning(false);
    setSecondsLeft(total);
  };
  const switchPreset = (p) => {
    deadlineRef.current = null;
    setRunning(false);
    setPresetId(p.id);
    setSecondsLeft(mode === 'work' ? p.work : p.break);
  };

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shellRef.current?.requestFullscreen();
    } catch { /* denied or unsupported — stay windowed */ }
  };

  // Keyboard: space start/pause, R reset, F fullscreen.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
      else if (e.key.toLowerCase() === 'r') reset();
      else if (e.key.toLowerCase() === 'f') toggleFull();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-bound each render so the handlers close over current state

  // Countdown in the tab title, so it stays visible from another tab.
  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} · ${isWork ? 'Focus' : 'Break'} — DevTrace` : 'DevTrace';
    return () => { document.title = 'DevTrace'; };
  }, [secondsLeft, running, isWork]);

  const ringSize = isFull ? 420 : 240;

  const controls = (
    <div className="flex items-center gap-3">
      <button
        onClick={running ? pause : start}
        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold transition-transform hover:-translate-y-0.5"
        style={{ backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }}
      >
        {running ? IconPause : IconPlay}
        {running ? 'Pause' : secondsLeft < total ? 'Resume' : 'Start'}
      </button>
      <button
        onClick={reset}
        title="Reset (R)"
        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        {IconReset}
      </button>
      <button
        onClick={toggleFull}
        title={isFull ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        {isFull ? IconShrink : IconExpand}
      </button>
    </div>
  );

  const timer = (
    <div className="relative flex items-center justify-center" style={{ height: ringSize, width: ringSize }}>
      <Ring progress={progress} size={ringSize} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="mono font-bold tabular-nums tracking-tight"
          style={{ color: 'var(--text)', fontSize: isFull ? 'clamp(56px, 11vw, 132px)' : '54px', lineHeight: 1 }}
        >
          {formatTime(secondsLeft)}
        </span>
        <span
          className="mono uppercase tracking-[0.28em] mt-3"
          style={{ color: isWork ? 'var(--accent)' : 'var(--accent-2)', fontSize: isFull ? 14 : 11 }}
        >
          {isWork ? 'Focus' : 'Break'}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* This node is what goes fullscreen, so it needs its own background —
          the fullscreen backdrop is black by default and ignores the page. */}
      <div
        ref={shellRef}
        style={{ backgroundColor: isFull ? 'var(--bg)' : 'transparent' }}
        className={isFull ? 'h-screen w-screen flex flex-col items-center justify-center gap-12' : ''}
      >
        {isFull ? (
          <>
            {timer}
            {controls}
          </>
        ) : (
          <Page>
            <div className="mb-8">
              <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
                Pomodoro
              </h1>
              <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
                Focus in blocks. Press <span className="mono">F</span> for fullscreen.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5 items-start">
              <Card className="p-8 flex flex-col items-center gap-9">
                {timer}
                {controls}
                {flash && (
                  <p className="mono text-[11.5px]" style={{ color: 'var(--accent)' }}>{flash}</p>
                )}
              </Card>

              <div className="space-y-5">
                <Card className="p-5">
                  <Label>Session length</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => switchPreset(p)}
                        className="px-3.5 py-2 rounded-lg mono text-[11.5px] font-semibold transition-colors"
                        style={
                          p.id === presetId
                            ? { backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }
                            : { backgroundColor: 'var(--surface-2)', color: 'var(--text-soft)', border: '1px solid var(--border)' }
                        }
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <p className="mono text-[10.5px] mt-3" style={{ color: 'var(--muted)' }}>
                    Switching resets the current block.
                  </p>
                </Card>

                <Card className="p-5">
                  <Label>Completed</Label>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="mono text-[34px] font-bold leading-none grad-text tabular-nums">{sessions}</span>
                    <span className="text-[14px]" style={{ color: 'var(--text-soft)' }}>
                      focus block{sessions === 1 ? '' : 's'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSessions(0)}
                    className="mono text-[10.5px] mt-4 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--muted)' }}
                  >
                    Reset counter
                  </button>
                </Card>

                <Card className="p-5">
                  <Label>Shortcuts</Label>
                  <ul className="mt-3 space-y-2">
                    {[['Space', running ? 'Pause' : 'Start'], ['R', 'Reset block'], ['F', 'Fullscreen']].map(([k, v]) => (
                      <li key={k} className="flex items-center justify-between text-[13px]" style={{ color: 'var(--text-soft)' }}>
                        <span>{v}</span>
                        <kbd
                          className="mono text-[10px] px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                        >
                          {k}
                        </kbd>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </Page>
        )}
      </div>
    </motion.div>
  );
}
