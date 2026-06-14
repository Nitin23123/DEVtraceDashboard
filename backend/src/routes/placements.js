const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { companies, experiences, questions, hrQuestions } = require('../data/placements');

/**
 * Placement Prep API (GGSIPU).
 *
 * Reads from the static seed dataset. Community-submitted experiences are stored
 * in-memory only (NOT persisted) until a DB migration adds a table. They reset
 * when the server restarts — this is intentional given "no migration yet".
 */

// ── In-memory store for community submissions ──────────────────────────────────
const communityExperiences = [];
let nextCommunityId = 1000; // seed ids stay < 1000

const companyBySlug = Object.fromEntries(companies.map((c) => [c.slug, c]));
const companyName = (slug) => (companyBySlug[slug] ? companyBySlug[slug].name : slug);

const allExperiences = () => [...experiences, ...communityExperiences];

// Count topic frequency across a set of experiences' rounds.
function topicFrequency(exps) {
  const freq = {};
  exps.forEach((e) => {
    (e.rounds || []).forEach((r) => {
      (r.topics || []).forEach((t) => {
        freq[t] = (freq[t] || 0) + 1;
      });
    });
  });
  return Object.entries(freq)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

// Conversion rate from a funnel (selected/registered), or null if unknown.
function conversionRate(funnel) {
  if (!funnel || !funnel.registered || funnel.selected == null) return null;
  return +((funnel.selected / funnel.registered) * 100).toFixed(1);
}

// ── GET /api/placements/companies ──────────────────────────────────────────────
// Directory with aggregated stats per company.
router.get('/companies', verifyToken, (req, res) => {
  const data = companies.map((c) => {
    const exps = allExperiences().filter((e) => e.companySlug === c.slug);
    const rates = exps.map((e) => conversionRate(e.funnel)).filter((r) => r != null);
    const avgConversion = rates.length
      ? +(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1)
      : null;
    return {
      ...c,
      experienceCount: exps.length,
      avgRounds: exps.length
        ? Math.round(exps.reduce((a, e) => a + (e.rounds ? e.rounds.length : 0), 0) / exps.length)
        : null,
      avgConversion,
      topTopics: topicFrequency(exps).slice(0, 5).map((t) => t.topic),
    };
  });
  res.json(data);
});

// ── GET /api/placements/companies/:slug ────────────────────────────────────────
// Full company profile + its experiences + its question bank + topic focus.
router.get('/companies/:slug', verifyToken, (req, res) => {
  const company = companyBySlug[req.params.slug];
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const exps = allExperiences()
    .filter((e) => e.companySlug === company.slug)
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  const qs = questions
    .filter((q) => q.companySlug === company.slug)
    .map((q) => ({ ...q, company: company.name }));

  res.json({
    company,
    experiences: exps,
    questions: qs,
    topicFocus: topicFrequency(exps),
  });
});

// ── GET /api/placements/experiences ────────────────────────────────────────────
// Feed, filterable by ?company=slug, ?status=, ?q=
router.get('/experiences', verifyToken, (req, res) => {
  const { company, status, q } = req.query;
  let data = allExperiences();

  if (company) data = data.filter((e) => e.companySlug === company);
  if (status) data = data.filter((e) => e.status === status);
  if (q) {
    const needle = q.toLowerCase();
    data = data.filter(
      (e) =>
        companyName(e.companySlug).toLowerCase().includes(needle) ||
        (e.role || '').toLowerCase().includes(needle) ||
        (e.rounds || []).some((r) => (r.detail || '').toLowerCase().includes(needle))
    );
  }

  data = data
    .map((e) => ({ ...e, company: companyName(e.companySlug), conversion: conversionRate(e.funnel) }))
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

  res.json(data);
});

// ── POST /api/placements/experiences ───────────────────────────────────────────
// Community submission (in-memory only).
router.post('/experiences', verifyToken, (req, res) => {
  const { companySlug, companyName: rawName, role, status, rounds, tips, eligibility, bond, funnel } = req.body;

  if (!role || !Array.isArray(rounds) || rounds.length === 0) {
    return res.status(400).json({ error: 'role and at least one round are required' });
  }

  // Resolve company: known slug, or register a lightweight ad-hoc company name.
  let slug = companySlug;
  if (!slug || !companyBySlug[slug]) {
    const name = (rawName || companySlug || 'Other').trim();
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
    if (!companyBySlug[slug]) {
      const adhoc = {
        slug,
        name,
        aliases: [],
        type: 'Other',
        domain: '—',
        techStack: [],
        locations: [],
        campusMonths: [],
        difficulty: 'Medium',
        summary: 'Community-added company.',
      };
      companies.push(adhoc);
      companyBySlug[slug] = adhoc;
    }
  }

  const exp = {
    id: nextCommunityId++,
    companySlug: slug,
    role: String(role).slice(0, 200),
    status: status === 'pending' ? 'pending' : 'selected',
    postedAt: new Date().toISOString().slice(0, 10),
    eligibility: eligibility || 'Not specified',
    funnel: funnel || { registered: null, shortlisted: null, selected: null },
    bond: bond || 'Not specified',
    rounds: rounds
      .filter((r) => r && r.detail)
      .map((r) => ({
        title: String(r.title || 'Round').slice(0, 120),
        detail: String(r.detail).slice(0, 2000),
        topics: Array.isArray(r.topics) ? r.topics.slice(0, 8) : [],
      })),
    tips: Array.isArray(tips) ? tips.filter(Boolean).map((t) => String(t).slice(0, 300)) : [],
    source: 'community',
    submittedBy: req.user.email,
  };

  communityExperiences.push(exp);
  res.status(201).json({ ...exp, company: companyName(exp.companySlug) });
});

// ── GET /api/placements/questions ──────────────────────────────────────────────
// Question bank, filterable by ?company, ?topic, ?round, ?difficulty, ?q
router.get('/questions', verifyToken, (req, res) => {
  const { company, topic, round, difficulty, q } = req.query;
  let data = questions.map((item) => ({ ...item, company: companyName(item.companySlug) }));

  if (company) data = data.filter((item) => item.companySlug === company);
  if (topic) data = data.filter((item) => item.topic === topic);
  if (round) data = data.filter((item) => item.round === round);
  if (difficulty) data = data.filter((item) => item.difficulty === difficulty);
  if (q) {
    const needle = q.toLowerCase();
    data = data.filter((item) => item.text.toLowerCase().includes(needle));
  }

  // Facets so the UI can build filter chips.
  const facets = {
    topics: [...new Set(questions.map((x) => x.topic))].sort(),
    rounds: [...new Set(questions.map((x) => x.round))].sort(),
    difficulties: ['Easy', 'Medium', 'Hard'],
  };

  res.json({ questions: data, facets });
});

// ── GET /api/placements/topics ─────────────────────────────────────────────────
// Company-wise topic focus + the global topic leaderboard (the "DSA by company" view).
router.get('/topics', verifyToken, (req, res) => {
  const byCompany = companies
    .map((c) => {
      const exps = allExperiences().filter((e) => e.companySlug === c.slug);
      const qs = questions.filter((q) => q.companySlug === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        topTopics: topicFrequency(exps).slice(0, 6),
        sampleQuestions: qs.slice(0, 4).map((q) => ({ text: q.text, topic: q.topic, difficulty: q.difficulty })),
      };
    })
    .filter((c) => c.topTopics.length);

  res.json({ byCompany, global: topicFrequency(allExperiences()) });
});

// ── GET /api/placements/prep/:slug ─────────────────────────────────────────────
// Auto-generated prep roadmap for a target company.
router.get('/prep/:slug', verifyToken, (req, res) => {
  const company = companyBySlug[req.params.slug];
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const exps = allExperiences().filter((e) => e.companySlug === company.slug);
  const focus = topicFrequency(exps);
  const tips = [...new Set(exps.flatMap((e) => e.tips || []))];
  const qs = questions.filter((q) => q.companySlug === company.slug);

  // Build an ordered checklist: top topics first, each with its sample questions.
  const checklist = focus.map((f) => ({
    topic: f.topic,
    weight: f.count,
    practice: qs.filter((q) => q.topic === f.topic).map((q) => q.text),
  }));

  res.json({
    company: { slug: company.slug, name: company.name, summary: company.summary, techStack: company.techStack },
    rounds: exps[0] ? exps[0].rounds.map((r) => r.title) : [],
    checklist,
    tips,
  });
});

// ── GET /api/placements/hr-questions ───────────────────────────────────────────
router.get('/hr-questions', verifyToken, (req, res) => {
  res.json(hrQuestions);
});

// ── GET /api/placements/calendar ───────────────────────────────────────────────
// Companies grouped by the months they visit campus.
router.get('/calendar', verifyToken, (req, res) => {
  const order = ['August', 'September', 'October', 'November', 'December', 'January'];
  const byMonth = {};
  companies.forEach((c) => {
    (c.campusMonths || []).forEach((m) => {
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push({ slug: c.slug, name: c.name, type: c.type, difficulty: c.difficulty });
    });
  });
  const calendar = order
    .filter((m) => byMonth[m])
    .map((month) => ({ month, companies: byMonth[month] }));
  res.json(calendar);
});

// ── GET /api/placements/insights ───────────────────────────────────────────────
// Aggregate analytics across the whole dataset.
router.get('/insights', verifyToken, (req, res) => {
  const exps = allExperiences();
  const withFunnel = exps.filter((e) => conversionRate(e.funnel) != null);

  const easiest = companies
    .map((c) => {
      const rates = exps
        .filter((e) => e.companySlug === c.slug)
        .map((e) => conversionRate(e.funnel))
        .filter((r) => r != null);
      const avg = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
      return { name: c.name, slug: c.slug, conversion: avg == null ? null : +avg.toFixed(1) };
    })
    .filter((c) => c.conversion != null)
    .sort((a, b) => b.conversion - a.conversion);

  const byType = {};
  companies.forEach((c) => {
    byType[c.type] = (byType[c.type] || 0) + 1;
  });

  res.json({
    totals: {
      companies: companies.length,
      experiences: exps.length,
      communityExperiences: communityExperiences.length,
      questions: questions.length,
    },
    topTopics: topicFrequency(exps).slice(0, 10),
    topicLeaderboard: topicFrequency(exps),
    conversionLeaderboard: easiest,
    hardest: easiest.slice().reverse().slice(0, 5),
    avgConversion: withFunnel.length
      ? +(
          withFunnel.map((e) => conversionRate(e.funnel)).reduce((a, b) => a + b, 0) / withFunnel.length
        ).toFixed(1)
      : null,
    companiesByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    companiesWithBond: companies
      .map((c) => {
        const e = exps.find((x) => x.companySlug === c.slug && x.bond && !/none|not specified/i.test(x.bond));
        return e ? { name: c.name, bond: e.bond } : null;
      })
      .filter(Boolean),
  });
});

module.exports = router;
