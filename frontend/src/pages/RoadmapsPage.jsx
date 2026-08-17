import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TRACKS, CADENCE, TAGS } from '../data/roadmaps';
import { Card, CardHead, Label, Bar, Chip, GhostButton, Page } from '../components/ui';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const STORAGE_KEY = 'roadmapProgress';

const keyFor = (trackId, phaseIdx, itemIdx) => `${trackId}:${phaseIdx}:${itemIdx}`;

const loadProgress = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IconCheck = <Icon d={<polyline points="20 6 9 17 4 12" />} size={11} />;
const IconRepeat = <Icon d={<><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>} />;

export default function RoadmapsPage() {
  const [done, setDone] = useState(loadProgress);
  const [activeId, setActiveId] = useState(() => localStorage.getItem('roadmapTrack') || TRACKS[0].id);
  const [tag, setTag] = useState('All');

  const track = TRACKS.find((t) => t.id === activeId) || TRACKS[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  }, [done]);
  useEffect(() => { localStorage.setItem('roadmapTrack', activeId); }, [activeId]);

  const toggle = (k) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  // Completion per track, so the list can show progress at a glance.
  const trackStats = useMemo(() => {
    const out = {};
    TRACKS.forEach((t) => {
      let total = 0;
      let complete = 0;
      t.phases.forEach((p, pi) => {
        p.items.forEach((_, ii) => {
          total += 1;
          if (done.has(keyFor(t.id, pi, ii))) complete += 1;
        });
      });
      out[t.id] = { total, complete };
    });
    return out;
  }, [done]);

  const visibleTracks = tag === 'All' ? TRACKS : TRACKS.filter((t) => t.tag === tag);
  const active = trackStats[track.id] || { total: 0, complete: 0 };

  const clearTrack = () =>
    setDone((prev) => {
      const next = new Set(prev);
      [...next].forEach((k) => { if (k.startsWith(`${track.id}:`)) next.delete(k); });
      return next;
    });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            Roadmaps
          </h1>
          <p className="mt-2 text-[15px] max-w-2xl" style={{ color: 'var(--text-soft)' }}>
            Ten structured tracks, month by month. Tick topics off as you go — progress is saved in this browser.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TAGS.map((t) => (
            <GhostButton key={t} active={tag === t} onClick={() => setTag(t)}>{t}</GhostButton>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-5 items-start">
          {/* Track list */}
          <Card className="overflow-hidden">
            {visibleTracks.map((t, i) => {
              const s = trackStats[t.id];
              const on = t.id === track.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className="w-full text-left px-4 py-3.5 relative transition-colors"
                  style={{
                    borderBottom: i < visibleTracks.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: on ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  }}
                >
                  {on && <span className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundImage: 'var(--grad)' }} />}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold truncate" style={{ color: on ? 'var(--text)' : 'var(--text-soft)' }}>
                      {t.title}
                    </span>
                    <span className="mono text-[10px] shrink-0" style={{ color: 'var(--muted)' }}>{t.duration}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1"><Bar value={s.complete} max={s.total} height={4} /></div>
                    <span className="mono text-[10px] tabular-nums shrink-0" style={{ color: s.complete ? 'var(--accent)' : 'var(--muted)' }}>
                      {s.complete}/{s.total}
                    </span>
                  </div>
                </button>
              );
            })}
          </Card>

          {/* Selected track */}
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <Chip>{track.tag}</Chip>
                    <Chip>{track.duration}</Chip>
                  </div>
                  <h2 className="mt-3 text-[24px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>{track.title}</h2>
                  <p className="mt-1.5 text-[14px]" style={{ color: 'var(--text-soft)' }}>{track.summary}</p>
                </div>
                <div className="text-right">
                  <div className="mono text-[30px] font-bold leading-none grad-text tabular-nums">
                    {active.total ? Math.round((active.complete / active.total) * 100) : 0}%
                  </div>
                  <div className="mono text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{active.complete} / {active.total} topics</div>
                </div>
              </div>

              <div className="mt-5"><Bar value={active.complete} max={active.total || 1} height={6} /></div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="mono text-[11px]" style={{ color: 'var(--accent)' }}>Target · {track.goal}</p>
                {active.complete > 0 && (
                  <button onClick={clearTrack} className="mono text-[10.5px] transition-opacity hover:opacity-70" style={{ color: 'var(--muted)' }}>
                    Reset this track
                  </button>
                )}
              </div>
            </Card>

            {/* Phases */}
            {track.phases.map((phase, pi) => {
              const total = phase.items.length;
              const complete = phase.items.filter((_, ii) => done.has(keyFor(track.id, pi, ii))).length;
              const allDone = complete === total;

              return (
                <Card key={phase.title}>
                  <CardHead
                    title={`${track.unit} ${pi + 1} — ${phase.title}`}
                    subtitle={phase.note}
                    action={
                      <span
                        className="mono text-[10.5px] px-2 py-1 rounded shrink-0"
                        style={
                          allDone
                            ? { backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }
                            : { backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }
                        }
                      >
                        {complete}/{total}
                      </span>
                    }
                  />
                  <div className="p-4 flex flex-wrap gap-2">
                    {phase.items.map((item, ii) => {
                      const k = keyFor(track.id, pi, ii);
                      const on = done.has(k);
                      return (
                        <button
                          key={item}
                          onClick={() => toggle(k)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors"
                          style={
                            on
                              ? {
                                  backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)',
                                  color: 'var(--accent)',
                                  border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
                                }
                              : { backgroundColor: 'var(--surface-2)', color: 'var(--text-soft)', border: '1px solid var(--border)' }
                          }
                        >
                          <span
                            className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                            style={on ? { backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border)' }}
                          >
                            {on && IconCheck}
                          </span>
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            {/* Cadence */}
            <Card>
              <CardHead
                title="Throughout your career"
                subtitle="The habits, not the checklist — this part never finishes"
                icon={IconRepeat}
              />
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {CADENCE.map((c) => (
                  <div key={c.every}>
                    <Label>{c.every}</Label>
                    <ul className="mt-2.5 space-y-1.5">
                      {c.items.map((i) => (
                        <li key={i} className="flex gap-2 text-[13px]" style={{ color: 'var(--text-soft)' }}>
                          <span style={{ color: 'var(--accent)' }}>›</span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Page>
    </motion.div>
  );
}
