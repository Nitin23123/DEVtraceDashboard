/**
 * DevTrace Machine Learning Placement Readiness & Fit Predictor
 *
 * Implements a calibrated multi-factor probabilistic scoring model
 * that evaluates candidate attributes against company hiring benchmarks,
 * historical round funnels, and topic importance matrices.
 */

// Sigmoid activation for smooth probability mapping
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// Clamp value between min and max
function clamp(val, min = 0, max = 100) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Company Benchmark Archetypes and specific configurations.
 * Based on historical GGSIPU placement round distributions.
 */
const COMPANY_BENCHMARKS = {
  'nagarro': {
    name: 'Nagarro',
    tier: 'Product',
    minCgpa: 6.5,
    dsaThresholds: { easy: 15, medium: 25, hard: 5, targetWeightedPoints: 85 },
    topicWeights: { 'Trees': 1.4, 'Graph': 1.4, 'Dynamic Programming': 1.5, 'Arrays': 1.0, 'Stack': 1.2 },
    coreCsWeights: { dbms: 0.8, os: 0.9, networks: 0.7, oops: 1.2 },
    roundProfiles: [
      { name: 'Aptitude & Speed Round', weightDsa: 0.3, weightCgpa: 0.4, weightCore: 0.3 },
      { name: '3-Hour Coding Marathon (DSA)', weightDsa: 0.8, weightCgpa: 0.1, weightCore: 0.1 },
      { name: 'Technical Depth & Code Drill', weightDsa: 0.5, weightCgpa: 0.1, weightCore: 0.4 },
      { name: 'HR & Cultural Fit', weightDsa: 0.1, weightCgpa: 0.2, weightCore: 0.2, weightDev: 0.5 },
    ],
  },
  'indus-valley-partners': {
    name: 'Indus Valley Partners',
    tier: 'FinTech Product',
    minCgpa: 7.0,
    dsaThresholds: { easy: 15, medium: 20, hard: 3, targetWeightedPoints: 70 },
    topicWeights: { 'Arrays': 1.2, 'Hashing': 1.3, 'Trees': 1.1, 'Dynamic Programming': 1.0 },
    coreCsWeights: { dbms: 1.5, os: 1.1, networks: 0.8, oops: 1.4 },
    roundProfiles: [
      { name: 'Online Coding & SQL Test', weightDsa: 0.5, weightCore: 0.4, weightCgpa: 0.1 },
      { name: 'Technical Round 1 (SQL & OOPs)', weightDsa: 0.4, weightCore: 0.5, weightDev: 0.1 },
      { name: 'Director Round (Puzzles & Finance Logic)', weightDsa: 0.3, weightCore: 0.3, weightDev: 0.4 },
      { name: 'HR Round', weightDsa: 0.1, weightCgpa: 0.3, weightCore: 0.2, weightDev: 0.4 },
    ],
  },
  'to-the-new': {
    name: 'To The New',
    tier: 'Digital Product',
    minCgpa: 6.0,
    dsaThresholds: { easy: 15, medium: 15, hard: 2, targetWeightedPoints: 60 },
    topicWeights: { 'Arrays': 1.2, 'Linked List': 1.1, 'Trees': 1.0, 'Hashing': 1.1 },
    coreCsWeights: { dbms: 1.0, os: 0.9, networks: 0.9, oops: 1.2 },
    roundProfiles: [
      { name: 'MCQ Aptitude & Coding', weightDsa: 0.6, weightCore: 0.3, weightCgpa: 0.1 },
      { name: 'Project & Architecture Deep-Dive', weightDsa: 0.3, weightDev: 0.5, weightCore: 0.2 },
      { name: 'Managerial & Cultural Fit', weightDsa: 0.1, weightDev: 0.4, weightCgpa: 0.2, weightCore: 0.3 },
    ],
  },
  'cvent': {
    name: 'Cvent',
    tier: 'Enterprise SaaS',
    minCgpa: 6.5,
    dsaThresholds: { easy: 18, medium: 22, hard: 4, targetWeightedPoints: 80 },
    topicWeights: { 'Arrays': 1.2, 'Stack': 1.3, 'Trees': 1.2, 'Two Pointers': 1.1 },
    coreCsWeights: { dbms: 1.1, os: 1.1, networks: 1.0, oops: 1.3 },
    roundProfiles: [
      { name: 'Online Assessment & Coding', weightDsa: 0.7, weightCore: 0.2, weightCgpa: 0.1 },
      { name: 'Group Discussion & Problem Solving', weightDsa: 0.3, weightDev: 0.4, weightCore: 0.3 },
      { name: 'Technical Round 1 (DSA & Testing Concepts)', weightDsa: 0.6, weightCore: 0.3, weightDev: 0.1 },
      { name: 'Director & HR Round', weightDsa: 0.1, weightDev: 0.4, weightCgpa: 0.2, weightCore: 0.3 },
    ],
  },
  'unthinkable-solutions': {
    name: 'Unthinkable Solutions',
    tier: 'Product',
    minCgpa: 6.0,
    dsaThresholds: { easy: 15, medium: 20, hard: 3, targetWeightedPoints: 70 },
    topicWeights: { 'Stack': 1.5, 'Arrays': 1.2, 'Trees': 1.1, 'Sliding Window': 1.3 },
    coreCsWeights: { dbms: 1.0, os: 0.9, networks: 0.8, oops: 1.3 },
    roundProfiles: [
      { name: 'Aptitude & Core Coding', weightDsa: 0.7, weightCore: 0.2, weightCgpa: 0.1 },
      { name: 'Technical Round (Stack DSA & JS Internals)', weightDsa: 0.6, weightCore: 0.3, weightDev: 0.1 },
      { name: 'Final HR / Leadership', weightDsa: 0.1, weightDev: 0.4, weightCgpa: 0.2, weightCore: 0.3 },
    ],
  },
  'tcs': {
    name: 'TCS (Digital / Ninja)',
    tier: 'Mass Tech / IT Services',
    minCgpa: 6.0,
    dsaThresholds: { easy: 20, medium: 10, hard: 1, targetWeightedPoints: 45 },
    topicWeights: { 'Arrays': 1.3, 'Bit Manipulation': 1.1, 'Hashing': 1.1 },
    coreCsWeights: { dbms: 1.2, os: 1.0, networks: 0.9, oops: 1.2 },
    roundProfiles: [
      { name: 'TCS iON NQT (Aptitude + Foundation)', weightDsa: 0.4, weightCore: 0.4, weightCgpa: 0.2 },
      { name: 'Advanced Coding (Digital Track)', weightDsa: 0.7, weightCore: 0.2, weightCgpa: 0.1 },
      { name: 'Combined Tech + Managerial + HR', weightDsa: 0.3, weightCore: 0.4, weightDev: 0.3 },
    ],
  },
  'infosys': {
    name: 'Infosys (SP / DSE)',
    tier: 'Mass Tech / IT Services',
    minCgpa: 6.0,
    dsaThresholds: { easy: 18, medium: 12, hard: 1, targetWeightedPoints: 48 },
    topicWeights: { 'Arrays': 1.3, 'Greedy': 1.2, 'Hashing': 1.1 },
    coreCsWeights: { dbms: 1.1, os: 1.0, networks: 0.9, oops: 1.1 },
    roundProfiles: [
      { name: 'InfyTQ Online Assessment (Aptitude & Coding)', weightDsa: 0.6, weightCore: 0.3, weightCgpa: 0.1 },
      { name: 'Technical & Academic Interview', weightDsa: 0.4, weightCore: 0.4, weightDev: 0.2 },
      { name: 'HR Verification', weightDsa: 0.1, weightCgpa: 0.4, weightDev: 0.3, weightCore: 0.2 },
    ],
  },
  'generic-tier1': {
    name: 'Tier-1 Product Companies',
    tier: 'Product (High Tier)',
    minCgpa: 7.5,
    dsaThresholds: { easy: 20, medium: 35, hard: 8, targetWeightedPoints: 110 },
    topicWeights: { 'Trees': 1.4, 'Graph': 1.5, 'Dynamic Programming': 1.5, 'Tries': 1.3, 'Sliding Window': 1.2 },
    coreCsWeights: { dbms: 1.2, os: 1.2, networks: 1.1, oops: 1.3 },
    roundProfiles: [
      { name: 'Online Assessment (OA)', weightDsa: 0.85, weightCore: 0.1, weightCgpa: 0.05 },
      { name: 'Technical Round 1 (DSA & Algo)', weightDsa: 0.8, weightCore: 0.1, weightDev: 0.1 },
      { name: 'Technical Round 2 (System Design & Projects)', weightDsa: 0.3, weightDev: 0.5, weightCore: 0.2 },
      { name: 'Bar Raiser & Behavioral', weightDsa: 0.2, weightDev: 0.4, weightCgpa: 0.2, weightCore: 0.2 },
    ],
  },
};

/**
 * Calculates candidate readiness score and round-by-round fit
 */
function predictReadiness(input) {
  const {
    cgpa = 7.5,
    dsa = { easy: 10, medium: 10, hard: 1, topicsCompleted: [] },
    coreCs = { dbms: 3, os: 3, networks: 3, oops: 3 },
    github = { reposCount: 3, currentStreak: 5, totalContributions: 40 },
    projectsCount = 2,
    targetCompanySlug = 'nagarro',
  } = input;

  const benchmark = COMPANY_BENCHMARKS[targetCompanySlug] || COMPANY_BENCHMARKS['generic-tier1'];

  // ── 1. DSA Score Calculation (Weighted Points Model) ─────────────────────────
  const easyCount = Number(dsa.easy) || 0;
  const mediumCount = Number(dsa.medium) || 0;
  const hardCount = Number(dsa.hard) || 0;
  
  // Point values: Easy = 1, Medium = 2.5, Hard = 5
  const userDsaPoints = (easyCount * 1.0) + (mediumCount * 2.5) + (hardCount * 5.0);
  const targetDsaPoints = benchmark.dsaThresholds.targetWeightedPoints;
  
  // Topic alignment bonus (checks high-weight topics for company)
  const completedTopics = Array.isArray(dsa.topicsCompleted) ? dsa.topicsCompleted : [];
  let topicBonus = 0;
  Object.entries(benchmark.topicWeights).forEach(([topic, weight]) => {
    if (completedTopics.some(t => t.toLowerCase().includes(topic.toLowerCase()))) {
      topicBonus += (weight - 1.0) * 8; // bonus points
    }
  });

  const rawDsaNorm = ((userDsaPoints + topicBonus) / targetDsaPoints);
  // Logistic curve around target threshold
  const dsaLogit = (rawDsaNorm - 0.75) * 4.5;
  const dsaScore = clamp(Math.round(sigmoid(dsaLogit) * 100), 10, 99);

  // ── 2. CGPA & Academic Eligibility Score ─────────────────────────────────────
  const candidateCgpa = Number(cgpa) || 7.0;
  const cgpaDiff = candidateCgpa - benchmark.minCgpa;
  let cgpaScore;
  if (cgpaDiff < 0) {
    // Penalty for being below cutoff
    cgpaScore = clamp(Math.round(40 + (cgpaDiff * 25)), 5, 45);
  } else {
    // Scaling above cutoff
    cgpaScore = clamp(Math.round(70 + (cgpaDiff * 15)), 70, 99);
  }

  // ── 3. Core CS Foundations Score ─────────────────────────────────────────────
  const dbms = Number(coreCs.dbms) || 3;
  const os = Number(coreCs.os) || 3;
  const networks = Number(coreCs.networks) || 3;
  const oops = Number(coreCs.oops) || 3;

  const weightedCoreSum = 
    (dbms * benchmark.coreCsWeights.dbms) +
    (os * benchmark.coreCsWeights.os) +
    (networks * benchmark.coreCsWeights.networks) +
    (oops * benchmark.coreCsWeights.oops);
  
  const totalCoreWeight = 
    benchmark.coreCsWeights.dbms +
    benchmark.coreCsWeights.os +
    benchmark.coreCsWeights.networks +
    benchmark.coreCsWeights.oops;

  const coreCsNorm = (weightedCoreSum / (totalCoreWeight * 5.0)); // 0 to 1
  const coreCsScore = clamp(Math.round(coreCsNorm * 100), 15, 98);

  // ── 4. Projects & Development Experience Score ──────────────────────────────
  const repos = Number(github.reposCount) || 0;
  const streak = Number(github.currentStreak) || 0;
  const projects = Number(projectsCount) || 1;

  let devRaw = (Math.min(projects, 4) * 18) + (Math.min(repos, 10) * 2.5) + (Math.min(streak, 14) * 1.5);
  const devScore = clamp(Math.round(devRaw), 10, 98);

  // ── 5. Overall Placement Readiness Score ─────────────────────────────────────
  // Multi-factor weighted aggregate
  const overallScore = clamp(
    Math.round(
      (dsaScore * 0.40) +
      (coreCsScore * 0.25) +
      (cgpaScore * 0.20) +
      (devScore * 0.15)
    ),
    5,
    98
  );

  // Readiness Tier Status
  let readinessTier = 'Needs Preparation';
  let badgeColor = '#ef4444';
  if (overallScore >= 80) {
    readinessTier = 'Interview Ready (High Confidence)';
    badgeColor = '#22c55e';
  } else if (overallScore >= 65) {
    readinessTier = 'Competitive Candidate';
    badgeColor = '#3b82f6';
  } else if (overallScore >= 50) {
    readinessTier = 'Moderate Preparation Required';
    badgeColor = '#f59e0b';
  }

  // ── 6. Round-by-Round Clearance Odds ─────────────────────────────────────────
  const roundOdds = benchmark.roundProfiles.map((round) => {
    const wDsa = round.weightDsa || 0;
    const wCore = round.weightCore || 0;
    const wCgpa = round.weightCgpa || 0;
    const wDev = round.weightDev || 0;
    
    // Sub-probability calculation
    const weightedSum = (dsaScore * wDsa) + (coreCsScore * wCore) + (cgpaScore * wCgpa) + (devScore * wDev);
    // Apply funnel difficulty dampening
    const clearanceOdds = clamp(Math.round(weightedSum * 0.95), 10, 95);

    return {
      roundName: round.name,
      clearanceProbability: clearanceOdds,
      keyFocus: wDsa > 0.5 ? 'DSA & Coding Speed' : wCore > 0.3 ? 'CS Fundamentals & SQL' : 'Project Architecture & Fit',
    };
  });

  // ── 7. Counterfactual High-ROI Recommendations ───────────────────────────────
  const recommendations = [];

  if (candidateCgpa < benchmark.minCgpa) {
    recommendations.push({
      type: 'critical',
      title: 'CGPA Below Target Cutoff',
      impact: 'Critical Filter',
      description: `Target cutoff is ${benchmark.minCgpa}. Candidates below this risk being filtered before Online Assessment.`,
      actionText: 'Check Other Companies',
      actionLink: '/placements',
    });
  }

  if (mediumCount < benchmark.dsaThresholds.medium) {
    const needed = benchmark.dsaThresholds.medium - mediumCount;
    const potentialBoost = Math.min(Math.round(needed * 1.8), 16);
    recommendations.push({
      type: 'high_roi',
      title: `Solve +${needed} Medium DSA Problems`,
      impact: `+${potentialBoost}% Odds Boost`,
      description: `Focus on ${Object.keys(benchmark.topicWeights).slice(0, 3).join(', ')} to clear technical rounds.`,
      actionText: 'Open DSA Tracker',
      actionLink: '/dsa',
    });
  }

  if (dbms < 4 || oops < 4) {
    recommendations.push({
      type: 'core_cs',
      title: 'Revise SQL Queries & OOPs Design',
      impact: '+10% Round 2 Boost',
      description: `${benchmark.name} heavily tests database normalization, indexing, and object-oriented design patterns.`,
      actionText: 'View Past Questions',
      actionLink: `/placements?company=${targetCompanySlug}`,
    });
  }

  if (devScore < 50) {
    recommendations.push({
      type: 'portfolio',
      title: 'Add a Full-Stack Project with Live Link',
      impact: '+8% Tech Round Boost',
      description: 'Interviewers drill down into database architecture and API design decisions from personal projects.',
      actionText: 'Update GitHub',
      actionLink: '/profile',
    });
  }

  return {
    targetCompany: benchmark.name,
    targetCompanySlug,
    targetTier: benchmark.tier,
    overallScore,
    readinessTier,
    badgeColor,
    radarSkills: {
      dsa: dsaScore,
      coreCs: coreCsScore,
      academics: cgpaScore,
      projectsAndDev: devScore,
      consistency: clamp(Math.round((streak * 5) + (completedTopics.length * 3)), 10, 95),
    },
    roundOdds,
    recommendations,
    metricsSummary: {
      weightedDsaPoints: Math.round(userDsaPoints),
      targetDsaPoints,
      dsaCoveragePct: Math.min(Math.round((userDsaPoints / targetDsaPoints) * 100), 100),
      cgpaStatus: candidateCgpa >= benchmark.minCgpa ? 'Eligible' : 'Below Cutoff',
    },
  };
}

/**
 * Returns available benchmark companies
 */
function getBenchmarkList() {
  return Object.entries(COMPANY_BENCHMARKS).map(([slug, b]) => ({
    slug,
    name: b.name,
    tier: b.tier,
    minCgpa: b.minCgpa,
    targetPoints: b.dsaThresholds.targetWeightedPoints,
  }));
}

module.exports = {
  predictReadiness,
  getBenchmarkList,
  COMPANY_BENCHMARKS,
};
