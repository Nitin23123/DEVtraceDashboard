import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { tabContentVariants } from '../components/placements/shared';
import CompaniesSplit from '../components/placements/CompaniesSplit';
import ExperiencesTab from '../components/placements/ExperiencesTab';
import QuestionsTab from '../components/placements/QuestionsTab';
import PrepTab from '../components/placements/PrepTab';
import CalendarTab from '../components/placements/CalendarTab';
import InsightsTab from '../components/placements/InsightsTab';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const tabs = [
  { id: 'companies', label: 'Companies', Comp: CompaniesSplit },
  { id: 'experiences', label: 'Experiences', Comp: ExperiencesTab },
  { id: 'questions', label: 'Questions', Comp: QuestionsTab },
  { id: 'prep', label: 'Prep', Comp: PrepTab },
  { id: 'calendar', label: 'Calendar', Comp: CalendarTab },
  { id: 'insights', label: 'Insights', Comp: InsightsTab },
];

export default function PlacementsPage() {
  const { token } = useAuth();
  const authToken = token || localStorage.getItem('token');
  const [active, setActive] = useState('companies');
  const Active = tabs.find((t) => t.id === active).Comp;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-7">
          <p className="mono text-xs uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--accent)' }}>
            GGSIPU · interview prep
          </p>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Placements</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-soft)' }}>
            Real experiences, company-wise topics, a question bank, and prep roadmaps.
          </p>
        </div>

        {/* Segmented control */}
        <div
          className="inline-flex items-center gap-1 p-1 rounded-xl mb-8 overflow-x-auto max-w-full"
          style={{
            backgroundColor: 'var(--glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
          }}
        >
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={
                  on
                    ? {
                        color: 'var(--accent-fg)',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                        boxShadow: '0 0 16px color-mix(in srgb, var(--accent) 45%, transparent)',
                      }
                    : { color: 'var(--muted)', background: 'transparent' }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
            <Active token={authToken} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
