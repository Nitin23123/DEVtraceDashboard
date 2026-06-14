import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExperiences, createExperience, getCompanies } from '../../api/placements';
import Spinner from '../Spinner';
import { Badge, TopicChip, modalVariants, inputClass, inputStyle, SectionEmpty } from './shared';

const TOPIC_OPTIONS = [
  'DSA', 'DBMS/SQL', 'OOPs', 'JavaScript', 'React', 'System Design',
  'HR/Behavioral', 'Aptitude', 'Project', 'Testing', 'OS', 'CN', 'Cloud', 'C#/.NET',
];

const emptyRound = () => ({ title: '', detail: '', topics: [] });

function SubmitModal({ token, companies, onClose, onCreated }) {
  const [form, setForm] = useState({
    companySlug: '',
    companyName: '',
    role: '',
    status: 'selected',
    eligibility: '',
    bond: '',
    rounds: [emptyRound()],
    tips: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setRound = (i, patch) =>
    setForm((f) => ({ ...f, rounds: f.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));

  const toggleTopic = (i, topic) =>
    setRound(i, {
      topics: form.rounds[i].topics.includes(topic)
        ? form.rounds[i].topics.filter((t) => t !== topic)
        : [...form.rounds[i].topics, topic],
    });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.companySlug && !form.companyName.trim()) {
      setError('Pick a company or type a new one.');
      return;
    }
    setSaving(true);
    const res = await createExperience(token, {
      ...form,
      tips: form.tips.split('\n').map((t) => t.trim()).filter(Boolean),
    });
    setSaving(false);
    if (res.error) setError(res.error);
    else {
      onCreated(res);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants} initial="initial" animate="animate" exit="exit"
        className="w-full max-w-lg rounded-xl border p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-1">Share an interview experience</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
          Help juniors at GGSIPU. Note: stored in-memory for now — it resets on server restart until persistence is added.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Company</label>
              <select
                value={form.companySlug}
                onChange={(e) => setForm({ ...form, companySlug: e.target.value })}
                className={inputClass} style={inputStyle}
              >
                <option value="">— New / other —</option>
                {companies.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">…or new company</label>
              <input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="e.g. Acme Corp"
                disabled={!!form.companySlug}
                className={inputClass} style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Role</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required placeholder="Software Engineer" className={inputClass} style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Outcome</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass} style={inputStyle}>
                <option value="selected">Selected</option>
                <option value="pending">Pending / Result awaited</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Eligibility</label>
              <input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="60%+ CGPA, no backlogs" className={inputClass} style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Bond</label>
              <input value={form.bond} onChange={(e) => setForm({ ...form, bond: e.target.value })} placeholder="e.g. 1-year" className={inputClass} style={inputStyle} />
            </div>
          </div>

          {/* Rounds */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-white">Rounds</label>
            {form.rounds.map((r, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <input
                    value={r.title}
                    onChange={(e) => setRound(i, { title: e.target.value })}
                    placeholder={`Round ${i + 1} title`}
                    className={inputClass} style={inputStyle}
                  />
                  {form.rounds.length > 1 && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, rounds: f.rounds.filter((_, idx) => idx !== i) }))} className="text-red-500 text-lg px-1">×</button>
                  )}
                </div>
                <textarea
                  value={r.detail}
                  onChange={(e) => setRound(i, { detail: e.target.value })}
                  rows={2} placeholder="What happened in this round…"
                  className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                />
                <div className="flex flex-wrap gap-1">
                  {TOPIC_OPTIONS.map((t) => (
                    <button
                      key={t} type="button" onClick={() => toggleTopic(i, t)}
                      className="text-xs px-2 py-0.5 rounded-full transition"
                      style={{
                        backgroundColor: r.topics.includes(t) ? 'var(--accent)' : 'var(--surface-2)',
                        color: r.topics.includes(t) ? 'var(--accent-fg)' : 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm((f) => ({ ...f, rounds: [...f.rounds, emptyRound()] }))} className="text-xs" style={{ color: 'var(--accent)' }}>
              + Add round
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white">Tips (one per line)</label>
            <textarea value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} rows={3} placeholder="Practice SQL joins&#10;Know your project deeply" className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
              {saving ? 'Posting…' : 'Post experience'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ExperienceCard({ exp }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{exp.company}</span>
            <Badge color={exp.status === 'selected' ? '#22c55e' : '#f59e0b'}>{exp.status}</Badge>
            {exp.source === 'community' && <Badge color="#06b6d4">community</Badge>}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{exp.role}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs block" style={{ color: 'var(--muted)' }}>{exp.rounds.length} rounds</span>
          {exp.conversion != null && <span className="text-xs" style={{ color: '#f59e0b' }}>{exp.conversion}% selected</span>}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs" style={{ color: 'var(--muted)' }}>
                <span>Eligibility: <span className="text-white">{exp.eligibility}</span></span>
                <span>Bond: <span className="text-white">{exp.bond}</span></span>
              </div>
              {exp.rounds.map((r, i) => (
                <div key={i} className="text-xs">
                  <p className="text-white font-medium">{r.title}</p>
                  <p className="mt-0.5" style={{ color: 'var(--muted)' }}>{r.detail}</p>
                  {r.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">{r.topics.map((t) => <TopicChip key={t} topic={t} />)}</div>
                  )}
                </div>
              ))}
              {exp.tips?.length > 0 && (
                <ul className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  {exp.tips.map((tip, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#22c55e' }}>›</span>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExperiencesTab({ token }) {
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    const data = await getExperiences(token, { q: search, status: statusFilter });
    if (Array.isArray(data)) setExperiences(data);
    setLoading(false);
  }, [token, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCompanies(token).then((d) => Array.isArray(d) && setCompanies(d)); }, [token]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search experiences…"
          className="px-3 py-2 rounded-lg text-sm text-white flex-1 min-w-[160px] focus:outline-none"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <option value="">All outcomes</option>
          <option value="selected">Selected</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
          + Share yours
        </button>
      </div>

      {loading ? (
        <Spinner size="lg" className="mt-20" />
      ) : experiences.length === 0 ? (
        <SectionEmpty text="No experiences match your filters." />
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <SubmitModal
            token={token}
            companies={companies}
            onClose={() => setShowModal(false)}
            onCreated={() => load()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
