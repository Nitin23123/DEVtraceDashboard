import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const WORK_DURATION  = 25 * 60;
const BREAK_DURATION = 5 * 60;
const RADIUS         = 88;
const CIRCUMFERENCE  = 2 * Math.PI * RADIUS;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroPage() {
  const [mode, setMode]           = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [running, setRunning]     = useState(false);
  const [sessions, setSessions]   = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window) Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            const msg = mode === 'work' ? 'Time for a break!' : 'Back to work!';
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro complete!', { body: msg });
            } else {
              alert('Pomodoro complete! ' + msg);
            }
            if (mode === 'work') {
              setSessions(s => s + 1);
              setMode('break');
              setRunning(false);
              return BREAK_DURATION;
            } else {
              setMode('work');
              setRunning(false);
              return WORK_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(mode === 'work' ? WORK_DURATION : BREAK_DURATION);
  };

  const isWork        = mode === 'work';
  const totalDuration = isWork ? WORK_DURATION : BREAK_DURATION;
  const progress      = (totalDuration - secondsLeft) / totalDuration;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-sm mx-auto px-6 py-16 flex flex-col items-center">

        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Pomodoro</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--muted)' }}>
          {sessions} session{sessions !== 1 ? 's' : ''} completed
        </p>

        {/* Ring */}
        <div className="relative flex items-center justify-center mb-10" style={{ height: 220, width: 220 }}>
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90 absolute inset-0">
            <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="110" cy="110" r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.9s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono tracking-tight text-white">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--muted)' }}>
              {isWork ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-full">
          {!running ? (
            <button
              onClick={() => setRunning(true)}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {secondsLeft < totalDuration ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="flex-1 py-3 rounded-lg text-sm font-semibold border transition"
              style={{ borderColor: 'var(--border)', color: 'white', backgroundColor: 'var(--surface)' }}
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-lg text-sm border transition"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Reset
          </button>
        </div>

        <p className="text-xs mt-8 text-center" style={{ color: 'var(--muted)' }}>
          25 min focus · 5 min break
        </p>
      </div>
    </motion.div>
  );
}
