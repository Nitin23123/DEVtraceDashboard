import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Label, Chip, GhostButton, Page } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'interview', label: 'Interview Core' },
  { id: 'dev', label: 'Development' },
  { id: 'ai', label: 'AI' },
];

/**
 * Hand-picked study material. Kept as plain data so it is trivial for students
 * to extend via a pull request.
 */
const RESOURCES = [
  {
    group: 'interview',
    topic: 'DSA',
    title: "Striver's A2Z DSA Sheet",
    source: 'takeUforward',
    format: 'Sheet',
    blurb: 'A structured path from basics to advanced, ordered so each step builds on the last. The most complete free DSA roadmap going.',
    url: 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z',
  },
  {
    group: 'interview',
    topic: 'Low-Level Design',
    title: 'LLD Course',
    source: 'AlgoMaster',
    format: 'Course',
    blurb: 'Design patterns and object modelling — the round most candidates skip preparing for, and then fail.',
    url: 'https://algomaster.io/learn/lld/course-introduction',
  },
  {
    group: 'interview',
    topic: 'System Design',
    title: 'System Design Fundamentals',
    source: 'AlgoMaster',
    format: 'Course',
    blurb: 'Scalability, load balancing, caching and databases from first principles.',
    url: 'https://algomaster.io/learn/system-design/course-introduction',
  },
  {
    group: 'interview',
    topic: 'SQL',
    title: 'SQL in One Shot',
    source: 'YouTube',
    format: 'Video',
    blurb: 'Single-sitting coverage of queries and joins. Good the week before an OA.',
    url: 'https://www.youtube.com/watch?v=hlGoQC332VM',
  },
  {
    group: 'interview',
    topic: 'OOPs',
    title: 'OOPs with Java',
    source: 'YouTube',
    format: 'Playlist',
    blurb: 'Object-oriented concepts in Java — the second most-tested subject across IPU drives after DSA.',
    url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk',
  },
  {
    group: 'dev',
    topic: 'Programming Basics',
    title: 'Beginner Programming Playlist',
    source: 'CodeWithHarry',
    format: 'Playlist',
    blurb: 'The best starting point if you are new to code. Hindi-friendly and paced for absolute beginners.',
    url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w',
  },
  {
    group: 'dev',
    topic: 'Web Development',
    title: 'Web Technology',
    source: 'GeeksforGeeks',
    format: 'Docs',
    blurb: 'Reference-style coverage of how the web works — HTTP, HTML, CSS, JS and the layers between.',
    url: 'https://www.geeksforgeeks.org/web-tech/web-technology/',
  },
  {
    group: 'dev',
    topic: 'React',
    title: 'React Full Course',
    source: 'YouTube',
    format: 'Video',
    blurb: 'Components, hooks and state in one long-form course. The framework DevTrace itself is built on.',
    url: 'https://www.youtube.com/watch?v=3LRZRSIh_KE',
  },
  {
    group: 'dev',
    topic: 'Backend',
    title: 'Backend Development',
    source: 'YouTube',
    format: 'Playlist',
    blurb: 'Servers, APIs and databases — what sits behind the interfaces you build.',
    url: 'https://www.youtube.com/playlist?list=PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH',
  },
  {
    group: 'ai',
    topic: 'Agentic AI',
    title: 'Agentic AI Course',
    source: 'YouTube',
    format: 'Playlist',
    blurb: 'Building agents and LLM-backed tools. Increasingly asked about in interviews, rarely taught in college.',
    url: 'https://www.youtube.com/playlist?list=PL8qeqP57-QAYITuzxIiShes9GR5dObHjh',
  },
];

const FORMAT_TONE = {
  Sheet: { bg: 'rgba(165,180,252,0.13)', fg: '#A5B4FC' },
  Course: { bg: 'rgba(139,92,246,0.15)', fg: '#C4B5FD' },
  Playlist: { bg: 'rgba(240,160,140,0.13)', fg: '#F0A08C' },
  Video: { bg: 'rgba(240,160,140,0.13)', fg: '#F0A08C' },
  Docs: { bg: 'rgba(74,222,128,0.12)', fg: '#4ADE80' },
};

const IconLink = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M8 7h9v9" />
  </svg>
);

export default function ResourcesPage() {
  usePageMeta({
    title: 'Curated Developer Resources — DSA, System Design & LLD | DEVtrace',
    description:
      'A hand-picked list of free study material for placement prep: DSA sheets, low-level and system design courses, development guides and AI resources, each with a note on what it is actually good for.',
    path: '/resources',
  });

  const [group, setGroup] = useState('all');
  const shown = group === 'all' ? RESOURCES : RESOURCES.filter((r) => r.group === group);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            Resources
          </h1>
          <p className="mt-2 text-[15px] max-w-2xl" style={{ color: 'var(--text-soft)' }}>
            Free material worth your time, for the subjects IPU drives actually test. All external — DevTrace just points you at the good ones.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {GROUPS.map((g) => (
            <GhostButton key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label}
              {g.id !== 'all' && ` (${RESOURCES.filter((r) => r.group === g.id).length})`}
            </GhostButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shown.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block group"
            >
              <Card className="p-5 h-full transition-transform duration-200 group-hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <Label>{r.topic}</Label>
                  <Chip tone={FORMAT_TONE[r.format]}>{r.format}</Chip>
                </div>

                <h2 className="mt-3 text-[17px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                  {r.title}
                </h2>

                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  {r.blurb}
                </p>

                <div
                  className="mt-4 pt-3.5 flex items-center justify-between mono text-[11px]"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  <span>{r.source}</span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                    Open {IconLink}
                  </span>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <p className="mono text-[11px] mt-8" style={{ color: 'var(--muted)' }}>
          Know something better? Open a pull request — the list lives in one array in this file.
        </p>
      </Page>
    </motion.div>
  );
}
