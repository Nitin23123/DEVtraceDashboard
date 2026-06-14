import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCompanies, getCompany } from '../../api/placements';
import Spinner from '../Spinner';
import {
  Badge,
  TopicChip,
  DIFFICULTY_COLOR,
  COMPANY_DIFFICULTY_COLOR,
  TYPE_COLOR,
} from './shared';

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
            <span className="text-white font-medium">{s.value}</span>
          </div>
          <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${max ? (s.value / max) * 100 : 0}%`, backgroundColor: 'white' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CompanyDetail({ data, onClose }) {
  const { company, experiences, questions, topicFocus } = data;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl h-full overflow-y-auto p-6"
        style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-white">{company.name}</h2>
              <Badge color={TYPE_COLOR[company.type] || '#888'}>{company.type}</Badge>
              <Badge color={COMPANY_DIFFICULTY_COLOR[company.difficulty] || '#888'}>
                {company.difficulty} difficulty
              </Badge>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{company.domain}</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none px-2" style={{ color: 'var(--muted)' }}>
            ×
          </button>
        </div>

        <p className="text-sm mb-5" style={{ color: 'var(--text)' }}>{company.summary}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Tech stack</p>
            <div className="flex flex-wrap gap-1.5">
              {company.techStack.map((t) => <Badge key={t} color="#888">{t}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Locations</p>
            <p className="text-white">{company.locations.join(', ') || '—'}</p>
            <p className="text-xs mt-2 mb-1" style={{ color: 'var(--muted)' }}>Visits campus</p>
            <p className="text-white">{company.campusMonths.join(', ') || '—'}</p>
          </div>
        </div>

        {topicFocus?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Most-asked topics</p>
            <div className="flex flex-wrap gap-1.5">
              {topicFocus.map((t) => <TopicChip key={t.topic} topic={t.topic} />)}
            </div>
          </div>
        )}

        {/* Experiences with round breakdowns */}
        <h3 className="text-sm font-semibold text-white mb-3">Interview experiences ({experiences.length})</h3>
        <div className="space-y-4 mb-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="text-sm font-medium text-white">{exp.role}</span>
                <div className="flex items-center gap-2">
                  <Badge color={exp.status === 'selected' ? '#22c55e' : '#f59e0b'}>{exp.status}</Badge>
                  {exp.source === 'community' && <Badge color="#06b6d4">community</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs" style={{ color: 'var(--muted)' }}>
                <span>Eligibility: <span className="text-white">{exp.eligibility}</span></span>
                <span>Bond: <span className="text-white">{exp.bond}</span></span>
              </div>
              <Funnel funnel={exp.funnel} />
              <div className="space-y-2 mt-3">
                {exp.rounds.map((r, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-white font-medium">{r.title}</p>
                    <p className="mt-0.5" style={{ color: 'var(--muted)' }}>{r.detail}</p>
                    {r.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.topics.map((t) => <TopicChip key={t} topic={t} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {exp.tips?.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-medium text-white mb-1">Tips</p>
                  <ul className="space-y-1">
                    {exp.tips.map((tip, i) => (
                      <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}>
                        <span style={{ color: '#22c55e' }}>›</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question bank for this company */}
        {questions.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-white mb-3">Questions asked ({questions.length})</h3>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="flex items-start gap-3 text-xs">
                  <Badge color={DIFFICULTY_COLOR[q.difficulty]}>{q.difficulty}</Badge>
                  <span className="flex-1 text-white">{q.text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CompaniesTab({ token }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getCompanies(token);
      if (Array.isArray(data)) setCompanies(data);
      setLoading(false);
    })();
  }, [token]);

  const openCompany = async (slug) => {
    setDetailLoading(true);
    const data = await getCompany(token, slug);
    setDetail(data);
    setDetailLoading(false);
  };

  const types = ['All', ...new Set(companies.map((c) => c.type))];
  const filtered = companies.filter(
    (c) =>
      (typeFilter === 'All' || c.type === typeFilter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.domain.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Spinner size="lg" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies…"
          className="px-3 py-2 rounded-lg text-sm text-white flex-1 min-w-[180px] focus:outline-none"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
        />
        <div className="flex gap-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={{
                backgroundColor: typeFilter === t ? 'var(--surface-2)' : 'transparent',
                color: typeFilter === t ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <button
            key={c.slug}
            onClick={() => openCompany(c.slug)}
            className="text-left rounded-xl border p-4 transition-colors hover:border-white/20"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">{c.name}</span>
              <Badge color={TYPE_COLOR[c.type] || '#888'}>{c.type}</Badge>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{c.domain}</p>
            <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--muted)' }}>
              <span>{c.experienceCount} exp</span>
              {c.avgRounds != null && <span>~{c.avgRounds} rounds</span>}
              {c.avgConversion != null && (
                <span style={{ color: c.avgConversion < 5 ? '#ef4444' : c.avgConversion < 12 ? '#f59e0b' : '#22c55e' }}>
                  {c.avgConversion}% selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {c.topTopics.slice(0, 4).map((t) => <TopicChip key={t} topic={t} />)}
            </div>
          </button>
        ))}
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <Spinner size="lg" />
        </div>
      )}
      <AnimatePresence>
        {detail && !detailLoading && <CompanyDetail data={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
}
