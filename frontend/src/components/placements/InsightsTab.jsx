import { useState, useEffect } from 'react';
import { getInsights } from '../../api/placements';
import Spinner from '../Spinner';
import { TOPIC_COLOR } from './shared';

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{label}</p>
    </div>
  );
}

function BarRow({ label, value, max, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white">{label}</span>
        <span style={{ color: 'var(--muted)' }}>{value}</span>
      </div>
      <div className="h-2 rounded-full w-full" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-2 rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function InsightsTab({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getInsights(token).then((d) => !d.error && setData(d));
  }, [token]);

  if (!data) return <Spinner size="lg" className="mt-20" />;

  const topicMax = Math.max(...data.topicLeaderboard.map((t) => t.count), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Companies" value={data.totals.companies} />
        <Stat label="Experiences" value={data.totals.experiences} />
        <Stat label="Questions" value={data.totals.questions} />
        <Stat label="Avg selection rate" value={data.avgConversion != null ? `${data.avgConversion}%` : '—'} />
      </div>

      {/* Topic leaderboard — what to study most */}
      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h3 className="text-sm font-semibold text-white mb-4">Most-tested topics (study these first)</h3>
        <div className="space-y-3">
          {data.topicLeaderboard.slice(0, 10).map((t) => (
            <BarRow key={t.topic} label={t.topic} value={t.count} max={topicMax} color={TOPIC_COLOR[t.topic] || '#888'} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Highest conversion */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Best odds (highest selection rate)</h3>
          <div className="space-y-2">
            {data.conversionLeaderboard.slice(0, 6).map((c) => (
              <div key={c.slug} className="flex items-center justify-between text-sm">
                <span className="text-white">{c.name}</span>
                <span style={{ color: c.conversion >= 5 ? '#22c55e' : '#f59e0b' }}>{c.conversion}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hardest */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Toughest to crack (lowest selection rate)</h3>
          <div className="space-y-2">
            {data.hardest.map((c) => (
              <div key={c.slug} className="flex items-center justify-between text-sm">
                <span className="text-white">{c.name}</span>
                <span style={{ color: '#ef4444' }}>{c.conversion}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Companies by type */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Companies by type</h3>
          <div className="flex flex-wrap gap-2">
            {data.companiesByType.map((t) => (
              <span key={t.type} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                {t.type} · <span className="text-white font-medium">{t.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bonds */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Heads-up: service bonds</h3>
          <div className="space-y-1.5">
            {data.companiesWithBond.map((c) => (
              <div key={c.name} className="text-xs flex justify-between gap-3">
                <span className="text-white shrink-0">{c.name}</span>
                <span className="text-right" style={{ color: 'var(--muted)' }}>{c.bond}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
