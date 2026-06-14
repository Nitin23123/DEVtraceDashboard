import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCompanies, getCompany } from '../../api/placements';
import Spinner from '../Spinner';
import { Badge, TopicChip, DIFFICULTY_COLOR, COMPANY_DIFFICULTY_COLOR, TYPE_COLOR } from './shared';

const glass = {
  backgroundColor: 'var(--glass)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderColor: 'var(--border)',
};

function Funnel({ funnel }) {
  if (!funnel || (!funnel.registered && !funnel.selected)) return null;
  const stages = [
    { label: 'Registered', value: funnel.registered },
    { label: 'Shortlisted', value: funnel.shortlisted },
    { label: 'Selected', value: funnel.selected },
  ].filter((s) => s.value != null);
  const max = funnel.registered || Math.max(...stages.map((s) => s.value));
  return (
    <div className="space-y-2">
      {stages.map((s) => (
        <div key={s.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'var(--muted)' }}>{s.label}</span>
            <span className="tnum" style={{ color: 'var(--text)' }}>{s.value}</span>
          </div>
          <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'var(--surface-2)' }}>
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${max ? (s.value / max) * 100 : 0}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                boxShadow: '0 0 8px color-mix(in srgb, var(--accent) 60%, transparent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Detail({ data }) {
  const { company, experiences, questions, topicFocus } = data;
  return (
    <motion.div
      key={company.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-y-auto p-5 sm:p-6 max-h-[70vh] md:max-h-[calc(100vh-210px)]"
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--text)' }}>{company.name}</h2>
          <p className="mono text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{company.domain}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={TYPE_COLOR[company.type] || '#888'}>{company.type}</Badge>
          <Badge color={COMPANY_DIFFICULTY_COLOR[company.difficulty] || '#888'}>{company.difficulty}</Badge>
        </div>
      </div>

      <p className="text-sm mb-5" style={{ color: 'var(--text-soft)' }}>{company.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="mono text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {company.techStack.map((t) => <Badge key={t} color="var(--accent-2)">{t}</Badge>)}
          </div>
        </div>
        <div>
          <p className="mono text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Locations · Months</p>
          <p style={{ color: 'var(--text)' }}>{company.locations.join(', ') || '—'}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{company.campusMonths.join(', ') || '—'}</p>
        </div>
      </div>

      {topicFocus?.length > 0 && (
        <div className="mb-6">
          <p className="mono text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Most-asked topics</p>
          <div className="flex flex-wrap gap-1.5">
            {topicFocus.map((t) => <TopicChip key={t.topic} topic={t.topic} />)}
          </div>
        </div>
      )}

      <h3 className="mono text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
        Experiences ({experiences.length})
      </h3>
      <div className="space-y-4 mb-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exp.role}</span>
              <div className="flex items-center gap-2">
                <Badge color={exp.status === 'selected' ? '#22c55e' : '#f59e0b'}>{exp.status}</Badge>
                {exp.source === 'community' && <Badge color="var(--accent)">community</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span>Eligibility: <span style={{ color: 'var(--text-soft)' }}>{exp.eligibility}</span></span>
              <span>Bond: <span style={{ color: 'var(--text-soft)' }}>{exp.bond}</span></span>
            </div>
            <Funnel funnel={exp.funnel} />
            <div className="space-y-2 mt-3">
              {exp.rounds.map((r, i) => (
                <div key={i} className="text-xs">
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{r.title}</p>
                  <p className="mt-0.5" style={{ color: 'var(--muted)' }}>{r.detail}</p>
                  {r.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">{r.topics.map((t) => <TopicChip key={t} topic={t} />)}</div>
                  )}
                </div>
              ))}
            </div>
            {exp.tips?.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <ul className="space-y-1">
                  {exp.tips.map((tip, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-soft)' }}>
                      <span style={{ color: 'var(--accent)' }}>›</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <>
          <h3 className="mono text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Questions asked ({questions.length})
          </h3>
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 text-xs">
                <Badge color={DIFFICULTY_COLOR[q.difficulty]}>{q.difficulty}</Badge>
                <span className="flex-1" style={{ color: 'var(--text-soft)' }}>{q.text}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function CompaniesSplit({ token }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail' (mobile only)

  useEffect(() => {
    (async () => {
      const data = await getCompanies(token);
      if (Array.isArray(data)) {
        setCompanies(data);
        if (data[0]) open(data[0].slug, false);
      }
      setLoading(false);
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (slug, switchView = true) => {
    setSelected(slug);
    if (switchView) setMobileView('detail');
    setDetailLoading(true);
    const d = await getCompany(token, slug);
    setDetail(d.error ? null : d);
    setDetailLoading(false);
  };

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner size="lg" className="mt-20" />;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left: list (full width on mobile; hidden when viewing detail on mobile) */}
      <div className={`w-full md:w-[300px] shrink-0 rounded-2xl border overflow-hidden ${mobileView === 'detail' ? 'hidden md:block' : 'block'}`} style={glass}>
        <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies…"
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="overflow-y-auto max-h-[55vh] md:max-h-[calc(100vh-268px)]">
          {filtered.map((c) => {
            const active = c.slug === selected;
            return (
              <button
                key={c.slug}
                onClick={() => open(c.slug)}
                className="w-full text-left px-4 py-3 transition-colors relative"
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                }}
              >
                {active && (
                  <span className="absolute left-0 top-0 h-full w-[2px]" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: active ? 'var(--text)' : 'var(--text-soft)' }}>{c.name}</span>
                  <Badge color={TYPE_COLOR[c.type] || '#888'}>{c.type}</Badge>
                </div>
                <div className="text-xs mt-1 flex gap-3 mono" style={{ color: 'var(--muted)' }}>
                  <span>{c.experienceCount} exp</span>
                  {c.avgConversion != null && <span style={{ color: 'var(--accent)' }}>{c.avgConversion}%</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: detail (hidden on mobile until a company is tapped) */}
      <div className={`flex-1 rounded-2xl border overflow-hidden min-h-[300px] ${mobileView === 'list' ? 'hidden md:block' : 'block'}`} style={glass}>
        {/* Mobile back button */}
        <button
          onClick={() => setMobileView('list')}
          className="md:hidden flex items-center gap-1.5 text-sm px-4 py-3 w-full text-left"
          style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Companies
        </button>
        {detailLoading ? (
          <Spinner size="lg" className="mt-24" />
        ) : detail ? (
          <Detail data={detail} />
        ) : (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>Select a company.</div>
        )}
      </div>
    </div>
  );
}
