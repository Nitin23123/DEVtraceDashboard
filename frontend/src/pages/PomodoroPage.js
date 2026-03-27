import React, { useState, useEffect, useRef } from 'react';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroPage() {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Fire notification
            const msg = mode === 'work' ? 'Time for a break!' : 'Back to work!';
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro complete!', { body: msg });
            } else {
              alert('Pomodoro complete! ' + msg);
            }
            // Switch mode
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

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(mode === 'work' ? WORK_DURATION : BREAK_DURATION);
  };

  const isWork = mode === 'work';
  const accentColor = isWork ? '#6366f1' : '#10b981';
  const totalDuration = isWork ? WORK_DURATION : BREAK_DURATION;
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Pomodoro Timer</h1>

      <div
        className="bg-surface rounded-2xl p-8 text-center shadow-sm mt-6"
        style={{ border: `2px solid ${accentColor}` }}
      >
        {/* Mode indicator */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: accentColor }}
        >
          {isWork ? 'Work Session' : 'Break Time'}
        </div>

        {/* Countdown */}
        <div className="text-7xl font-bold font-mono mb-6 text-text leading-none">
          {formatTime(secondsLeft)}
        </div>

        {/* Progress bar */}
        <div className="bg-border rounded-full h-2 w-full mb-8">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ background: accentColor, width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!running ? (
            <button
              onClick={handleStart}
              className="px-8 py-2.5 text-white font-semibold rounded-lg text-base transition"
              style={{ background: accentColor }}
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-2.5 bg-slate-500 text-white font-semibold rounded-lg text-base transition"
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-8 py-2.5 border border-border rounded-lg text-base text-text/70 hover:text-text transition"
          >
            Reset
          </button>
        </div>

        {/* Session count badge */}
        <div className="mt-7 inline-flex items-center gap-2 bg-bg border border-border rounded-full px-4 py-1.5 text-sm text-text">
          <span className="text-lg">🍅</span>
          Sessions completed: <strong>{sessions}</strong>
        </div>
      </div>

      {/* Info */}
      <p className="mt-6 text-xs text-text/50 text-center">
        25 min work → 5 min break. Browser notifications fire when each session ends.
      </p>
    </div>
  );
}
