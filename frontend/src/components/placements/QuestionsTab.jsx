import { useState, useEffect, useCallback } from 'react';
import { getQuestions, getCompanies } from '../../api/placements';
import Spinner from '../Spinner';
import { Badge, TopicChip, DIFFICULTY_COLOR, SectionEmpty } from './shared';

function FilterRow({ label, options, value, onChange, renderOption }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs w-16 shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
      <button
        onClick={() => onChange('')}
        className="px-2.5 py-1 rounded-full text-xs transition"
        style={{
          backgroundColor: value === '' ? 'var(--surface-2)' : 'transparent',
          color: value === '' ? 'white' : 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        All
      </button>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const display = renderOption ? renderOption(opt) : val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className="px-2.5 py-1 rounded-full text-xs transition"
            style={{
              backgroundColor: value === val ? 'var(--surface-2)' : 'transparent',
              color: value === val ? 'white' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            {display}
          </button>
        );
      })}
    </div>
  );
}

export default function QuestionsTab({ token }) {
  const [questions, setQuestions] = useState([]);
  const [facets, setFacets] = useState({ topics: [], rounds: [], difficulties: [] });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company: '', topic: '', round: '', difficulty: '', q: '' });

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const load = useCallback(async () => {
    const data = await getQuestions(token, filters);
    if (data.questions) {
      setQuestions(data.questions);
      setFacets(data.facets);
    }
    setLoading(false);
  }, [token, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCompanies(token).then((d) => Array.isArray(d) && setCompanies(d)); }, [token]);

  return (
    <div>
      <input
        value={filters.q}
        onChange={(e) => set('q', e.target.value)}
        placeholder="Search questions…"
        className="px-3 py-2 rounded-lg text-sm text-white w-full mb-4 focus:outline-none"
        style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
      />

      <div className="space-y-2 mb-5 rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <FilterRow
          label="Company"
          options={companies.map((c) => ({ value: c.slug, label: c.name }))}
          value={filters.company}
          onChange={(v) => set('company', v)}
          renderOption={(o) => o.label}
        />
        <FilterRow label="Topic" options={facets.topics} value={filters.topic} onChange={(v) => set('topic', v)} />
        <FilterRow label="Round" options={facets.rounds} value={filters.round} onChange={(v) => set('round', v)} />
        <FilterRow label="Level" options={facets.difficulties} value={filters.difficulty} onChange={(v) => set('difficulty', v)} />
      </div>

      {loading ? (
        <Spinner size="lg" className="mt-16" />
      ) : questions.length === 0 ? (
        <SectionEmpty text="No questions match your filters." />
      ) : (
        <>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{questions.length} questions</p>
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <p className="text-sm text-white mb-2">{q.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="#888">{q.company}</Badge>
                  <TopicChip topic={q.topic} />
                  <Badge color={DIFFICULTY_COLOR[q.difficulty]}>{q.difficulty}</Badge>
                  <Badge color="#6366f1">{q.round}</Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
