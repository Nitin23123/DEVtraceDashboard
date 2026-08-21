import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { predictPlacementReadiness, getReadinessBenchmarks } from '../../api/readiness';
import { getProblems } from '../../api/dsa';
import { tabContentVariants, Badge, inputClass, inputStyle } from './shared';
import { Card, CardHead, Chip, GradButton } from '../ui';

const STAR_LEVELS = [1, 2, 3, 4, 5];

export default function PredictorTab({ authToken, defaultCompanySlug = 'nagarro' }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(defaultCompanySlug);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isSynced, setIsSynced] = useState(true);

  // Simulation state
  const [cgpa, setCgpa] = useState(7.8);
  const [easyDsa, setEasyDsa] = useState(12);
  const [mediumDsa, setMediumDsa] = useState(15);
  const [hardDsa, setHardDsa] = useState(2);
  const [projectsCount, setProjectsCount] = useState(2);
  const [streak, setStreak] = useState(6);
  const [coreCs, setCoreCs] = useState({ dbms: 3, os: 3, networks: 3, oops: 4 });

  // Load benchmarks and user DSA progress on mount
  useEffect(() => {
    getReadinessBenchmarks(authToken)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBenchmarks(data);
      })
      .catch(() => {});

    if (authToken) {
      getProblems(authToken)
        .then((days) => {
          if (Array.isArray(days)) {
            let e = 0, m = 0, h = 0;
            days.forEach((day) => {
              (day.problems || []).forEach((p) => {
                if (p.completed) {
                  if (p.difficulty === 'Easy') e++;
                  else if (p.difficulty === 'Medium') m++;
                  else if (p.difficulty === 'Hard') h++;
                }
              });
            });
            if (e + m + h > 0) {
              setEasyDsa(e);
              setMediumDsa(m);
              setHardDsa(h);
            }
          }
        })
        .catch(() => {});
    }
  }, [authToken]);

  // Recalculate prediction whenever inputs change
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    const payload = {
      targetCompanySlug: selectedCompany,
      cgpa,
      dsa: {
        easy: easyDsa,
        medium: mediumDsa,
        hard: hardDsa,
        total: easyDsa + mediumDsa + hardDsa,
      },
      coreCs,
      github: {
        currentStreak: streak,
        reposCount: projectsCount + 2,
      },
      projectsCount,
      useDbStats: isSynced,
    };

    predictPlacementReadiness(authToken, payload)
      .then((res) => {
        if (isCurrent && res && !res.error) {
          setPrediction(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [authToken, selectedCompany, cgpa, easyDsa, mediumDsa, hardDsa, projectsCount, streak, coreCs, isSynced]);

  const handleCoreRating = (subject, val) => {
    setCoreCs((prev) => ({ ...prev, [subject]: val }));
  };

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* ── Top Header & Company Selector ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
              ✦ ML Placement Predictor
            </span>
            <span className="mono text-xs" style={{ color: 'var(--muted)' }}>v1.0 (Calibrated Model)</span>
          </div>
          <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>
            Company Fit & Clearance Predictor
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-soft)' }}>
            Simulate your hiring odds, detect round bottlenecks, and calculate high-ROI preparation steps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--muted)' }}>
            Target Company:
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className={`${inputClass} !py-2 text-sm font-medium`}
            style={inputStyle}
          >
            {benchmarks.length > 0 ? (
              benchmarks.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name} ({b.tier})
                </option>
              ))
            ) : (
              <>
                <option value="nagarro">Nagarro (Product)</option>
                <option value="indus-valley-partners">Indus Valley Partners (FinTech)</option>
                <option value="to-the-new">To The New (Product)</option>
                <option value="cvent">Cvent (SaaS)</option>
                <option value="unthinkable-solutions">Unthinkable Solutions (Product)</option>
                <option value="tcs">TCS (IT Services / Digital)</option>
                <option value="infosys">Infosys (IT Services)</option>
                <option value="generic-tier1">Tier-1 Product Companies</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* ── Main Grid: Inputs (Left) & Predictions (Right) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Input Simulator Controls (5 Cols) ───────────────────────────────── */}
        <Card className="lg:col-span-5 flex flex-col">
          <CardHead
            title="Candidate Profile & Attributes"
            subtitle="Tweak metrics to test different preparation scenarios"
          />
          <div className="p-5 space-y-5">
            {/* CGPA Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Current CGPA
                </label>
                <span className="mono text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>
                  {cgpa.toFixed(1)} / 10.0
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] mono mt-1" style={{ color: 'var(--muted)' }}>
                <span>5.0</span>
                <span>Cutoff: {prediction?.metricsSummary?.cgpaStatus === 'Eligible' ? '✓ Met' : '⚠️ Below'}</span>
                <span>10.0</span>
              </div>
            </div>

            {/* DSA Solved Breakdown */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  DSA Problems Solved
                </label>
                <span className="mono text-xs font-bold" style={{ color: 'var(--muted)' }}>
                  Total: {easyDsa + mediumDsa + hardDsa}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Easy */}
                <div className="p-2.5 rounded-lg border text-center"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div className="text-[11px] font-semibold text-emerald-400">Easy (1 pt)</div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={easyDsa}
                    onChange={(e) => setEasyDsa(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold text-base bg-transparent mt-1 focus:outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
                {/* Medium */}
                <div className="p-2.5 rounded-lg border text-center"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div className="text-[11px] font-semibold text-amber-400">Medium (2.5 pts)</div>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={mediumDsa}
                    onChange={(e) => setMediumDsa(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold text-base bg-transparent mt-1 focus:outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
                {/* Hard */}
                <div className="p-2.5 rounded-lg border text-center"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div className="text-[11px] font-semibold text-red-400">Hard (5 pts)</div>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={hardDsa}
                    onChange={(e) => setHardDsa(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-bold text-base bg-transparent mt-1 focus:outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
              </div>
            </div>

            {/* Core CS Subject Confidence */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text)' }}>
                Core CS Subject Mastery (1 - 5)
              </label>
              <div className="space-y-2">
                {[
                  { key: 'dbms', label: 'DBMS & SQL' },
                  { key: 'os', label: 'Operating Systems' },
                  { key: 'oops', label: 'OOPs & Low-Level Design' },
                  { key: 'networks', label: 'Computer Networks' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-soft)' }}>{label}</span>
                    <div className="flex gap-1">
                      {STAR_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleCoreRating(key, lvl)}
                          className={`w-6 h-6 rounded text-xs font-bold transition ${
                            coreCs[key] >= lvl
                              ? 'bg-violet-600 text-white'
                              : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Streaks */}
            <div className="pt-2 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text)' }}>
                  Full-Stack Projects
                </label>
                <select
                  value={projectsCount}
                  onChange={(e) => setProjectsCount(parseInt(e.target.value))}
                  className={`${inputClass} !py-2 text-xs`}
                  style={inputStyle}
                >
                  <option value="0">0 Projects</option>
                  <option value="1">1 Project</option>
                  <option value="2">2 Projects</option>
                  <option value="3">3 Projects</option>
                  <option value="4">4+ Projects</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text)' }}>
                  Practice Streak (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={streak}
                  onChange={(e) => setStreak(parseInt(e.target.value) || 0)}
                  className={`${inputClass} !py-2 text-xs mono`}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Output Dashboard (7 Cols) ───────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Score Banner */}
          <Card className="p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Predicted Fit Score
                  </span>
                  <Badge color={prediction?.badgeColor || '#3b82f6'}>
                    {prediction?.targetTier || 'Target'}
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text)' }}>
                  {prediction?.targetCompany || 'Target Company'}
                </h3>
                <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: prediction?.badgeColor || 'var(--accent)' }}>
                  ● {prediction?.readinessTier || 'Calculating...'}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                  Based on historical GGSIPU placement conversion funnels and interview debrief topic frequencies.
                </p>
              </div>

              {/* Big Radial Progress Gauge */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-800"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke={prediction?.badgeColor || '#8b5cf6'}
                      strokeWidth="3.4"
                      strokeDasharray={`${prediction?.overallScore || 0}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black" style={{ color: 'var(--text)' }}>
                      {prediction?.overallScore ?? '—'}
                    </span>
                    <span className="text-xs font-bold block -mt-1" style={{ color: 'var(--muted)' }}>%</span>
                  </div>
                </div>
                <span className="text-[11px] mono mt-1 font-semibold" style={{ color: 'var(--muted)' }}>
                  Readiness Index
                </span>
              </div>
            </div>

            {/* Micro stats bar */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-[10px] mono uppercase" style={{ color: 'var(--muted)' }}>DSA Pts / Target</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text)' }}>
                  {prediction?.metricsSummary?.weightedDsaPoints ?? 0} / {prediction?.metricsSummary?.targetDsaPoints ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] mono uppercase" style={{ color: 'var(--muted)' }}>DSA Coverage</div>
                <div className="text-sm font-bold mt-0.5 text-violet-400">
                  {prediction?.metricsSummary?.dsaCoveragePct ?? 0}%
                </div>
              </div>
              <div>
                <div className="text-[10px] mono uppercase" style={{ color: 'var(--muted)' }}>Eligibility</div>
                <div className={`text-sm font-bold mt-0.5 ${prediction?.metricsSummary?.cgpaStatus === 'Eligible' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {prediction?.metricsSummary?.cgpaStatus ?? 'Eligible'}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Round-by-Round Clearance Probabilities ──────────────────────────── */}
          <Card>
            <CardHead
              title="Round-by-Round Clearance Odds"
              subtitle="Estimated probability of clearing each elimination stage"
            />
            <div className="p-5 space-y-4">
              {prediction?.roundOdds?.map((round, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>
                        {round.roundName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>({round.keyFocus})</span>
                      <span className="mono font-bold" style={{ color: round.clearanceProbability >= 70 ? '#22c55e' : round.clearanceProbability >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {round.clearanceProbability}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${round.clearanceProbability}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: round.clearanceProbability >= 70 ? '#22c55e' : round.clearanceProbability >= 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Skill Matrix & Category Breakdown ───────────────────────────────── */}
          <Card>
            <CardHead
              title="Profile Strengths & Skill Distribution"
              subtitle="Candidate score compared to standard company hire benchmark"
            />
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'DSA Mastery', val: prediction?.radarSkills?.dsa, color: '#8b5cf6' },
                { label: 'Core CS (SQL/OS)', val: prediction?.radarSkills?.coreCs, color: '#3b82f6' },
                { label: 'Projects & Dev', val: prediction?.radarSkills?.projectsAndDev, color: '#06b6d4' },
                { label: 'Academics (CGPA)', val: prediction?.radarSkills?.academics, color: '#10b981' },
              ].map(({ label, val = 0, color }, i) => (
                <div key={i} className="p-3 rounded-xl border text-center"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{label}</div>
                  <div className="text-xl font-bold mt-1" style={{ color }}>{val}%</div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── High-ROI Recommendations & Action Items ─────────────────────────── */}
          <Card>
            <CardHead
              title="Targeted Action Items & High-Yield Improvements"
              subtitle="Concrete steps ranked by maximum score boost for this company"
            />
            <div className="p-5 space-y-3">
              {prediction?.recommendations && prediction.recommendations.length > 0 ? (
                prediction.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: rec.type === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                            color: rec.type === 'critical' ? '#ef4444' : '#22c55e',
                          }}>
                          {rec.impact}
                        </span>
                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {rec.title}
                        </h4>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>
                        {rec.description}
                      </p>
                    </div>

                    <Link
                      to={rec.actionLink}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border text-center transition hover:border-violet-500 hover:text-white"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      {rec.actionText} →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--muted)' }}>
                  🎉 Your profile satisfies all core benchmarks for {prediction?.targetCompany || 'this company'}! Keep practicing to maintain your streak.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
