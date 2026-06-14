import { useState, useEffect } from 'react';
import { getCalendar } from '../../api/placements';
import Spinner from '../Spinner';
import { Badge, TYPE_COLOR, COMPANY_DIFFICULTY_COLOR, SectionEmpty } from './shared';

export default function CalendarTab({ token }) {
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCalendar(token).then((d) => {
      if (Array.isArray(d)) setCalendar(d);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <Spinner size="lg" className="mt-20" />;
  if (calendar.length === 0) return <SectionEmpty text="No calendar data yet." />;

  return (
    <div>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        When companies typically visit GGSIPU campuses (drives cluster Sept–Nov). Plan your prep backwards from these.
      </p>
      <div className="relative pl-6" style={{ borderLeft: '2px solid var(--border)' }}>
        {calendar.map((month) => (
          <div key={month.month} className="mb-8 relative">
            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--accent)', border: '3px solid var(--bg)' }} />
            <h3 className="text-base font-semibold text-white mb-3">{month.month}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {month.companies.map((c) => (
                <div key={c.slug} className="flex items-center justify-between rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <span className="text-sm text-white">{c.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge color={TYPE_COLOR[c.type] || '#888'}>{c.type}</Badge>
                    <Badge color={COMPANY_DIFFICULTY_COLOR[c.difficulty] || '#888'}>{c.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
