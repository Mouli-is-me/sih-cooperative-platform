// Authoritative FairMatch™ Engine for Labour Cooperative OS (CO-OP OS)
// Multi-Factor Weighted Scoring & Cohort-based Opportunity Equity 2.0

export const DEFAULT_WEIGHTS = {
  skill: 0.35,
  availability: 0.15,
  reliability: 0.15,
  distance: 0.10,
  workload: 0.10,
  opportunityEquity: 0.15
};

/**
 * Opportunity Equity 2.0
 * Calculates fairness score relative to workers in the same skill cohort.
 */
export const calculateOpportunityEquity = (worker, cohortWorkers = []) => {
  const recentJobs = worker.jobsCompleted7Days ?? 3;
  const recentEarnings = worker.earnings7Days ?? (recentJobs * 700);
  const daysSinceLastJob = worker.daysSinceLastJob ?? 2;

  // Filter cohort workers for matching category if cohort is provided
  const cohort = cohortWorkers.length > 0 
    ? cohortWorkers.filter(w => w.category === worker.category)
    : [worker];

  const cohortSize = Math.max(1, cohort.length);
  const expectedOpportunityShare = 1 / cohortSize;

  const totalCohortJobs = cohort.reduce((sum, w) => sum + (w.jobsCompleted7Days ?? 3), 0) || 1;
  const opportunityShare = recentJobs / totalCohortJobs;

  // Penalty calculation for taking more than fair share of cohort work
  let ratioPenalty = 0;
  if (opportunityShare > expectedOpportunityShare) {
    ratioPenalty = Math.min(65, Math.round(((opportunityShare - expectedOpportunityShare) / expectedOpportunityShare) * 35));
  }

  // Workload penalty if capacity is heavily occupied (>75%)
  const highWorkloadPenalty = (worker.workloadCapacity ?? 30) > 75 ? 15 : 0;

  const score = Math.max(10, Math.min(100, Math.round(100 - ratioPenalty - highWorkloadPenalty)));

  return {
    score,
    recentJobs,
    recentEarnings,
    daysSinceLastJob,
    opportunityShareVal: opportunityShare,
    expectedOpportunityShareVal: expectedOpportunityShare,
    opportunitySharePct: `${(opportunityShare * 100).toFixed(0)}%`,
    expectedOpportunitySharePct: `${(expectedOpportunityShare * 100).toFixed(0)}%`,
    explanation: score > 75
      ? `Worker has received ${recentJobs} jobs recently (${(opportunityShare * 100).toFixed(0)}% of cohort). High Equity Index (${score}/100) indicates high priority for new work.`
      : `Worker has received ${recentJobs} jobs recently (${(opportunityShare * 100).toFixed(0)}% of cohort). Score (${score}/100) deprioritizes to distribute jobs fairly across cohort.`
  };
};

/**
 * Sub-score Calculators (All normalized 0-100)
 */
export const calculateSkillScore = (worker, intent = {}) => {
  const targetCategory = (intent.categoryKey || intent.serviceCategory || "").toLowerCase();
  const workerCategory = (worker.category || "").toLowerCase();

  if (targetCategory && workerCategory && targetCategory !== workerCategory) {
    return 30; // Category mismatch
  }

  // Skill fit inside category
  const baseFit = worker.skillFitPercent || 92;
  return Math.max(0, Math.min(100, baseFit));
};

export const calculateAvailabilityScore = (worker, intent = {}) => {
  if (worker.status === "UNAVAILABLE") return 0;
  if (worker.status === "BUSY" || worker.isAvailable === false) {
    return intent.urgency === "High" ? 20 : 50;
  }
  return 100;
};

export const calculateReliabilityScore = (worker) => {
  return Math.max(0, Math.min(100, worker.reliabilityScore || worker.onTimeRate || 95));
};

export const calculateDistanceScore = (worker) => {
  const dist = worker.distanceKm ?? 2.0;
  return Math.max(0, Math.min(100, Math.round(100 - dist * 12)));
};

export const calculateWorkloadScore = (worker) => {
  const capacity = worker.workloadCapacity ?? 30;
  return Math.max(0, Math.min(100, 100 - capacity));
};

/**
 * Single Authoritative FairMatch Engine Scoring
 */
export const scoreWorkerFairMatch = (worker, intent = {}, pool = [], weights = DEFAULT_WEIGHTS) => {
  // Filter cohort for equity calculation
  const cohort = pool.filter(w => w.category === worker.category);

  const skillScore = calculateSkillScore(worker, intent);
  const availabilityScore = calculateAvailabilityScore(worker, intent);
  const reliabilityScore = calculateReliabilityScore(worker);
  const distanceScore = calculateDistanceScore(worker);
  const workloadScore = calculateWorkloadScore(worker);

  const equityData = calculateOpportunityEquity(worker, cohort);
  const opportunityEquityScore = equityData.score;

  const finalScore = Math.round(
    skillScore * weights.skill +
      availabilityScore * weights.availability +
      reliabilityScore * weights.reliability +
      distanceScore * weights.distance +
      workloadScore * weights.workload +
      opportunityEquityScore * weights.opportunityEquity
  );

  // Reasons & Tradeoffs
  const reasons = [];
  const tradeoffs = [];

  if (skillScore >= 90) reasons.push(`High skill compatibility (${skillScore}%) for ${intent.serviceCategory || worker.category}`);
  if (availabilityScore === 100) reasons.push(`Available immediately for service dispatch`);
  if (distanceScore >= 80) reasons.push(`Close proximity (${worker.distanceKm || 1.5} km from location)`);
  if (reliabilityScore >= 90) reasons.push(`Proven reliability record (${reliabilityScore}% on-time rate)`);
  if (opportunityEquityScore >= 80) reasons.push(`Lower recent work share (${equityData.recentJobs} jobs in 7d) — FairMatch priority boost`);

  if (availabilityScore < 100) tradeoffs.push(`Currently busy or finishing active assignment`);
  if (distanceScore < 70) tradeoffs.push(`Further away (${worker.distanceKm} km)`);
  if (opportunityEquityScore < 60) tradeoffs.push(`High recent job volume (${equityData.recentJobs} jobs in 7d) — Deprioritized to spread work`);
  if (workloadScore < 50) tradeoffs.push(`Workload capacity at ${worker.workloadCapacity}%`);

  return {
    worker,
    finalScore,
    skillScore,
    availabilityScore,
    reliabilityScore,
    distanceScore,
    workloadScore,
    opportunityEquityScore,
    equityData,
    reasons,
    tradeoffs,
    explanation: reasons.join(". ") + "."
  };
};

/**
 * Rank Pool of Workers using FairMatch Engine
 */
export const rankWorkersFairMatch = (intent = {}, pool = [], weights = DEFAULT_WEIGHTS) => {
  if (!pool || pool.length === 0) return [];

  // Stage 1: Filter out completely unavailable workers if high urgency, or category mismatches
  const targetCat = (intent.categoryKey || intent.serviceCategory || "").toLowerCase();
  let eligible = pool.filter(w => w.status !== "UNAVAILABLE");
  
  if (targetCat) {
    const categoryMatches = eligible.filter(w => (w.category || "").toLowerCase() === targetCat);
    if (categoryMatches.length > 0) eligible = categoryMatches;
  }

  // Fallback to all workers if filtering produced empty list
  if (eligible.length === 0) eligible = pool;

  // Stage 2: Multi-factor Scoring
  const scored = eligible.map(w => scoreWorkerFairMatch(w, intent, pool, weights));

  // Sort descending by finalScore, then distance
  scored.sort((a, b) => b.finalScore - a.finalScore || a.worker.distanceKm - b.worker.distanceKm);

  // Assign ranks
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};

/**
 * Traditional Matcher (Pure Rating & Proximity)
 */
export const rankWorkersTraditionalMatch = (intent = {}, pool = []) => {
  const targetCat = (intent.categoryKey || intent.serviceCategory || "").toLowerCase();
  let eligible = pool.filter(w => !targetCat || (w.category || "").toLowerCase() === targetCat);
  if (eligible.length === 0) eligible = pool;

  const scored = eligible.map(w => {
    const ratingScore = Math.round((w.rating || 4.0) * 18); // max ~90
    const distanceScore = Math.max(0, Math.min(10, 10 - (w.distanceKm || 2)));
    const total = Math.round(ratingScore + distanceScore);
    return {
      worker: w,
      traditionalScore: total,
      rating: w.rating,
      distanceKm: w.distanceKm
    };
  });

  scored.sort((a, b) => b.worker.rating - a.worker.rating || a.worker.distanceKm - b.worker.distanceKm);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};

/**
 * Dynamic "Why Not Highest Rated Worker?" Explanation
 */
export const whyNotHighestRated = (topFairMatchScored, pool = []) => {
  if (!topFairMatchScored) return null;

  const categoryWorkers = pool.filter(w => w.category === topFairMatchScored.worker.category);
  const highestRatedWorker = [...categoryWorkers].sort((a, b) => b.rating - a.rating)[0];

  if (!highestRatedWorker || highestRatedWorker.id === topFairMatchScored.worker.id) {
    return null; // Top FairMatch is already the highest rated!
  }

  const selectedWorker = topFairMatchScored.worker;

  const highestRatedJobs7d = highestRatedWorker.jobsCompleted7Days ?? 8;
  const selectedJobs7d = selectedWorker.jobsCompleted7Days ?? 2;

  return {
    highestRatedName: highestRatedWorker.name,
    highestRatedRating: `${highestRatedWorker.rating}★`,
    highestRatedJobs7Days: highestRatedJobs7d,
    highestRatedWorkload: `${highestRatedWorker.workloadCapacity || 85}%`,
    selectedName: selectedWorker.name,
    selectedRating: `${selectedWorker.rating}★`,
    selectedJobs7Days: selectedJobs7d,
    selectedFairMatchScore: topFairMatchScored.finalScore,
    fairnessConsideration: `FairMatch selected ${selectedWorker.name} because ${highestRatedWorker.name} has already received ${highestRatedJobs7d} jobs this week (${highestRatedWorker.workloadCapacity || 85}% capacity occupied). Allocating to ${selectedWorker.name} (${selectedJobs7d} recent jobs) provides excellent service quality while maintaining equitable opportunity distribution across the cooperative.`,
    tradeoffs: topFairMatchScored.tradeoffs
  };
};
