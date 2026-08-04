import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getCompanies, getInsights } from '../api/placements';
import { scrollTo } from '../lenis';
import { tabContentVariants } from '../components/placements/shared';
import CompaniesSplit from '../components/placements/CompaniesSplit';
import ExperiencesTab from '../components/placements/ExperiencesTab';
import QuestionsTab from '../components/placements/QuestionsTab';
import PrepTab from '../components/placements/PrepTab';
import CalendarTab from '../components/placements/CalendarTab';
import InsightsTab from '../components/placements/InsightsTab';
import { Card, CardHead, Label, Bar, Chip, GradButton, Page } from '../components/ui';

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

const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IconBuilding = <Icon d={<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01" /></>} />;
const IconCard = <Icon d={<><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="2.2" /><path d="M14 10h5M14 14h3" /></>} />;
const IconMic = <Icon d={<><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></>} />;
const IconBook = <Icon d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>} />;

export default function PlacementsPage() {
  const { token } = useAuth();
  const authToken = token || localStorage.getItem('token');
  const [active, setActive] = useState('companies');
  const Active = tabs.find((t) => t.id === active).Comp;

  const [companies, setCompanies] = useState([]);
  const [insights, setInsights] = useState(null);
  const [focusCompany, setFocusCompany] = useState(null);
  const tabsRef = useRef(null);

  /**
   * Hub shortcuts switch the tab AND scroll down to it. Without the scroll the
   * tab silently changes below the fold and the button reads as broken.
   */
  const goToTab = (id, companySlug = null) => {
    setActive(id);
    if (companySlug) setFocusCompany(companySlug);
    requestAnimationFrame(() => scrollTo(tabsRef.current));
  };

  useEffect(() => {
    getCompanies(authToken).then((d) => setCompanies(Array.isArray(d) ? d : [])).catch(() => {});
    getInsights(authToken).then((d) => setInsights(d && d.totals ? d : null)).catch(() => {});
  }, [authToken]);

  // Companies with the most debriefs lead the hub — those are the ones we can
  // actually say something useful about.
  const topCompanies = [...companies]
    .sort((a, b) => (b.experienceCount || 0) - (a.experienceCount || 0))
    .slice(0, 3);

  const topTopics = insights?.topTopics?.slice(0, 3) || [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[40px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            Placement Prep Hub
          </h1>
          <p className="mt-2 text-[15px] max-w-2xl" style={{ color: 'var(--text-soft)' }}>
            Company-specific tracks, real interview debriefs, and question banks from placed GGSIPU seniors.
          </p>
        </div>

        {/* ── Hub row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5">
          {/* Company-wise prep */}
          <Card className="flex flex-col">
            <CardHead
              title="Company-wise Prep"
              subtitle="Ranked by how many debriefs we hold"
              icon={IconBuilding}
              action={
                <button onClick={() => goToTab('companies')} className="mono text-[11px] shrink-0" style={{ color: 'var(--accent)' }}>
                  View all
                </button>
              }
            />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {topCompanies.length === 0 && (
                <p className="text-[13px] sm:col-span-3" style={{ color: 'var(--muted)' }}>Loading company data…</p>
              )}
              {topCompanies.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => goToTab('companies', c.slug)}
                  className="rounded-lg p-4 text-left transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</div>
                  <div className="mono text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                    {c.experienceCount} debrief{c.experienceCount === 1 ? '' : 's'} · {c.difficulty}
                  </div>
                  {c.avgConversion != null && (
                    <div className="mt-4">
                      <Bar value={c.avgConversion} max={100} height={5} />
                      <div className="mono text-[10px] mt-1.5 text-right" style={{ color: 'var(--accent)' }}>
                        {c.avgConversion}% convert
                      </div>
                    </div>
                  )}
                  {c.topTopics?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.topTopics.slice(0, 2).map((t) => <Chip key={t}>{t}</Chip>)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Side stack */}
          <div className="space-y-5">
            <Card className="p-5">
              <span style={{ color: 'var(--accent)' }}>{IconCard}</span>
              <h3 className="text-[17px] font-semibold mt-3" style={{ color: 'var(--text)' }}>Developer Card</h3>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                Turn your DSA progress, streak and GitHub stats into one shareable card.
              </p>
              <Link to="/dev-card" className="inline-block mt-4">
                <GradButton>Build your card</GradButton>
              </Link>
            </Card>

            <Card className="p-5" style={{ borderLeft: '3px solid var(--accent-2)' }}>
              <span style={{ color: 'var(--accent-2)' }}>{IconMic}</span>
              <h3 className="text-[17px] font-semibold mt-3" style={{ color: 'var(--text)' }}>HR & Behavioural</h3>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                The HR questions that actually come up in IPU rounds, with prep roadmaps per company.
              </p>
              <button
                onClick={() => goToTab('prep')}
                className="mono text-[11.5px] mt-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                Open prep roadmaps →
              </button>
            </Card>
          </div>
        </div>

        {/* ── Topic focus strip ───────────────────────────────────────── */}
        {topTopics.length > 0 && (
          <Card className="mt-5">
            <CardHead title="Most-tested Subjects" subtitle="Across every debrief in the dataset" icon={IconBook} />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topTopics.map((t) => (
                <div key={t.topic} className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <Label>{t.topic}</Label>
                  <div className="mono text-[22px] font-bold mt-2 tnum grad-text">{t.count}</div>
                  <div className="mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>round mentions</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────
            Sticky so the six tabs stay reachable while browsing a long list.
            z-30 sits under the mobile header (z-40) and far under Modal (z-200),
            so it can never overlap either. */}
        <div
          ref={tabsRef}
          className="sticky top-2 lg:top-4 z-30 flex items-center gap-1 p-1 rounded-xl my-6 overflow-x-auto"
          style={{
            backgroundColor: 'var(--glass)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid var(--border)',
          }}
        >
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap"
                style={
                  on
                    ? { color: 'var(--accent-fg)', backgroundImage: 'var(--grad)' }
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
            <Active token={authToken} initialSlug={active === 'companies' ? focusCompany : undefined} />
          </motion.div>
        </AnimatePresence>
      </Page>
    </motion.div>
  );
}
