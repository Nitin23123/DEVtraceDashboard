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
    <div style={{ padding: '40px 24px', maxWidth: '480px', margin: '0 auto', color: 'var(--text)' }}>
      <h1 style={{ marginBottom: '8px', color: 'var(--text)' }}>Pomodoro Timer</h1>

      <div style={{
        background: 'var(--surface)',
        border: `2px solid ${accentColor}`,
        borderRadius: '16px',
        padding: '40px 32px',
        textAlign: 'center',
        marginTop: '24px',
        boxShadow: `0 0 24px ${accentColor}22`
      }}>
        {/* Mode indicator */}
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: accentColor,
          marginBottom: '16px'
        }}>
          {isWork ? 'Work Session' : 'Break Time'}
        </div>

        {/* Countdown */}
        <div style={{
          fontSize: '72px',
          fontWeight: 700,
          fontFamily: 'monospace',
          color: 'var(--text)',
          lineHeight: 1,
          marginBottom: '24px'
        }}>
          {formatTime(secondsLeft)}
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, width: '100%', marginBottom: '32px' }}>
          <div style={{
            background: accentColor,
            borderRadius: 8,
            height: 8,
            width: `${progress}%`,
            transition: 'width 0.5s'
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {!running ? (
            <button
              onClick={handleStart}
              style={{
                background: accentColor,
                color: 'white',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                background: '#475569',
                color: 'white',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            style={{
              background: 'none',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              padding: '10px 28px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>

        {/* Session count badge */}
        <div style={{
          marginTop: '28px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '14px',
          color: 'var(--text)'
        }}>
          <span style={{ fontSize: '18px' }}>🍅</span>
          Sessions completed: <strong>{sessions}</strong>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text)', opacity: 0.6, textAlign: 'center' }}>
        25 min work → 5 min break. Browser notifications fire when each session ends.
      </div>
    </div>
  );
}
