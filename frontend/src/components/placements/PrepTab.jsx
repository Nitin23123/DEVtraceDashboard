import { useState, useEffect } from 'react';
import { getCompanies, getPrep, getHrQuestions } from '../../api/placements';
import Spinner from '../Spinner';
import { Badge, TopicChip, TOPIC_COLOR } from './shared';

function Roadmap({ prep }) {
  const max = Math.max(...prep.checklist.map((c) => c.weight), 1);
  return (
    <div className="rounded-xl border p-5 mb-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <h3 className="text-lg font-semibold text-white">{prep.company.name} — prep roadmap</h3>
      <p className="text-sm mt-1 mb-3" style={{ color: 'var(--muted)' }}>{prep.company.summary}</p>

      {prep.company.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prep.company.techStack.map((t) => <Badge key={t} color="#888">{t}</Badge>)}
        </div>
      )}

      {prep.rounds?.length > 0 && (
        <div className="mb-5">
          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Round structure</p>
          <div className="flex flex-wrap items-center gap-2">
            {prep.rounds.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>{r}</span>
                {i < prep.rounds.length - 1 && <span style={{ color: 'var(--muted)' }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>What to master (by frequency)</p>
      <div className="space-y-3 mb-5">
        {prep.checklist.map((c) => (
          <div key={c.topic}>
            <div className="flex items-center justify-between mb-1">
              <TopicChip topic={c.topic} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>weight {c.weight}</span>
            </div>
            <div className="h-1.5 rounded-full w-full mb-2" style={{ backgroundColor: 'var(--border)' }}>
              <div className="h-1.5 rounded-full" style={{ width: `${(c.weight / max) * 100}%`, backgroundColor: TOPIC_COLOR[c.topic] || '#888' }} />
            </div>
            {c.practice.length > 0 && (
              <ul className="space-y-1 ml-1">
                {c.practice.map((p, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--accent)' }}>▹</span>{p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {prep.tips?.length > 0 && (
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-medium text-white mb-2">Tips from those who cleared it</p>
          <ul className="space-y-1.5">
            {prep.tips.map((tip, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#22c55e' }}>✓</span>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HrFlashcard({ q }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <Badge color="#22c55e">{q.category}</Badge>
      <p className="text-sm text-white mt-2">{q.text}</p>
    </div>
  );
}

export default function PrepTab({ token }) {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState('');
  const [prep, setPrep] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [hr, setHr] = useState([]);

  useEffect(() => {
    getCompanies(token).then((d) => {
      if (Array.isArray(d)) {
        setCompanies(d);
        if (d[0]) setSelected(d[0].slug);
      }
    });
    getHrQuestions(token).then((d) => Array.isArray(d) && setHr(d));
  }, [token]);

  useEffect(() => {
    if (!selected) return;
    setPrepLoading(true);
    getPrep(token, selected).then((d) => {
      setPrep(d.error ? null : d);
      setPrepLoading(false);
    });
  }, [token, selected]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm text-white font-medium">Target company</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {companies.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {prepLoading ? <Spinner size="lg" className="mt-12 mb-8" /> : prep && <Roadmap prep={prep} />}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">HR & behavioral prep</h3>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{hr.length} common questions</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hr.map((q) => <HrFlashcard key={q.id} q={q} />)}
      </div>
    </div>
  );
}
