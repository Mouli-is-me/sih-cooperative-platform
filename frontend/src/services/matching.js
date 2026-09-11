// Upgraded Authoritative FairMatch™ Engine for Frontend (CO-OP OS)
// 6-Factor Weighted Scoring Engine & Cohort-based Opportunity Equity 2.0
// Fully aligned with Backend Engine

import { WORKERS } from "./mockData.js";

export const WEIGHTS = {
  skill: 0.4,
  availability: 0.15,
  reliability: 0.15,
  distance: 0.1,
  workload: 0.05,
  opportunityEquity: 0.15,
};

/**
 * Opportunity Equity 2.0 (Cohort-Based)
 */
export const calculateOpportunityEquity = (worker, cohortWorkers = WORKERS) => {
  const recentJobs = worker.jobsCompleted7Days ?? 3;
  const recentEarnings = worker.earnings7Days ?? recentJobs * 700;
  const daysSinceLastJob = worker.daysSinceLastJob ?? 2;

  const cohort =
    cohortWorkers.length > 0
      ? cohortWorkers.filter((w) => w.category === worker.category)
      : [worker];

  const cohortSize = Math.max(1, cohort.length);
  const expectedOpportunityShare = 1 / cohortSize;

  const totalCohortJobs =
    cohort.reduce((sum, w) => sum + (w.jobsCompleted7Days ?? 3), 0) || 1;
  const opportunityShare = recentJobs / totalCohortJobs;

  let ratioPenalty = 0;
  if (opportunityShare > expectedOpportunityShare) {
    ratioPenalty = Math.min(
      65,
      Math.round(
        ((opportunityShare - expectedOpportunityShare) /
          expectedOpportunityShare) *
          35,
      ),
    );
  }

  const highWorkloadPenalty = (worker.workloadCapacity ?? 30) > 75 ? 15 : 0;
  const score = Math.max(
    10,
    Math.min(100, Math.round(100 - ratioPenalty - highWorkloadPenalty)),
  );

  return {
    score,
    recentJobs,
    recentEarnings,
    daysSinceLastJob,
    opportunityShareVal: opportunityShare,
    expectedOpportunityShareVal: expectedOpportunityShare,
    opportunitySharePct: `${(opportunityShare * 100).toFixed(0)}%`,
    expectedOpportunitySharePct: `${(expectedOpportunityShare * 100).toFixed(0)}%`,
    explanation:
      score > 75
        ? `Worker has received ${recentJobs} jobs recently (${(opportunityShare * 100).toFixed(0)}% of cohort). High Equity Index (${score}/100) priority allocation.`
        : `Worker has received ${recentJobs} jobs recently (${(opportunityShare * 100).toFixed(0)}% of cohort). Deprioritized to spread work across cohort.`,
  };
};

export const calculateSkillScore = (worker, intent = {}) => {
  const targetCategory = (
    intent.categoryKey ||
    intent.serviceCategory ||
    ""
  ).toLowerCase();
  const workerCategory = (worker.category || "").toLowerCase();
  if (targetCategory && workerCategory && targetCategory !== workerCategory)
    return 30;
  return Math.max(0, Math.min(100, worker.skillFitPercent || 92));
};

export const calculateAvailabilityScore = (worker, intent = {}) => {
  if (worker.status === "UNAVAILABLE") return 0;
  if (worker.status === "BUSY" || worker.isAvailable === false) {
    return intent.urgency === "High" ? 20 : 50;
  }
  return 100;
};

export const calculateReliabilityScore = (worker) => {
  return Math.max(
    0,
    Math.min(100, worker.reliabilityScore || worker.onTimeRate || 95),
  );
};

export const calculateDistanceScore = (worker) => {
  const dist = worker.distanceKm ?? 2.0;
  return Math.max(0, Math.min(100, Math.round(100 - dist * 12)));
};

export const calculateWorkloadScore = (worker) => {
  const capacity = worker.workloadCapacity ?? 30;
  return Math.max(0, Math.min(100, 100 - capacity));
};

export const calculateFairMatchScore = (
  worker,
  intent = {},
  pool = WORKERS,
) => {
  const skillScore = calculateSkillScore(worker, intent);
  const availabilityScore = calculateAvailabilityScore(worker, intent);
  const reliabilityScore = calculateReliabilityScore(worker);
  const distanceScore = calculateDistanceScore(worker);
  const workloadScore = calculateWorkloadScore(worker);

  const equityData = calculateOpportunityEquity(worker, pool);
  const opportunityEquityScore = equityData.score;

  const finalScore = Math.round(
    skillScore * WEIGHTS.skill +
      availabilityScore * WEIGHTS.availability +
      reliabilityScore * WEIGHTS.reliability +
      distanceScore * WEIGHTS.distance +
      workloadScore * WEIGHTS.workload +
      opportunityEquityScore * WEIGHTS.opportunityEquity,
  );

  return {
    fairMatchScore: finalScore,
    breakdown: {
      skillFit: skillScore,
      availabilityScore,
      reliabilityScore,
      distanceScore,
      workloadScore,
      opportunityEquity: opportunityEquityScore,
    },
    equityData,
  };
};

export const getFairMatches = (intent = {}, pool = WORKERS) => {
  if (!pool || pool.length === 0) return [];

  const targetCat = (
    intent.categoryKey ||
    intent.serviceCategory ||
    ""
  ).toLowerCase();
  let eligible = pool.filter((w) => w.status !== "UNAVAILABLE");
  if (targetCat) {
    const catMatches = eligible.filter(
      (w) => (w.category || "").toLowerCase() === targetCat,
    );
    if (catMatches.length > 0) eligible = catMatches;
  }
  if (eligible.length === 0) eligible = pool;

  const scored = eligible.map((worker) => {
    const { fairMatchScore, breakdown, equityData } = calculateFairMatchScore(
      worker,
      intent,
      pool,
    );
    return {
      ...worker,
      fairMatchScore,
      breakdown,
      equityData,
    };
  });

  scored.sort(
    (a, b) =>
      b.fairMatchScore - a.fairMatchScore || a.distanceKm - b.distanceKm,
  );

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

export const getTraditionalMatches = (intent = {}, pool = WORKERS) => {
  const targetCat = (
    intent.categoryKey ||
    intent.serviceCategory ||
    ""
  ).toLowerCase();
  let eligible = pool.filter(
    (w) => !targetCat || (w.category || "").toLowerCase() === targetCat,
  );
  if (eligible.length === 0) eligible = pool;

  const scored = eligible.map((w) => {
    const tradScore = Math.round(
      (w.rating || 4.0) * 18 + Math.max(0, 10 - (w.distanceKm || 2)),
    );
    return {
      ...w,
      traditionalScore: tradScore,
    };
  });

  scored.sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm);
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

export const explainMatch = (worker, intent = {}) => {
  const reasons = [];
  const b = worker.breakdown || {};

  if ((b.skillFit || 90) >= 90) {
    reasons.push(
      `Strong task fit for ${intent.serviceCategory || worker.category} (${b.skillFit || 96}% compatibility)`,
    );
  }

  if (worker.isAvailable && worker.status !== "BUSY") {
    reasons.push(
      `Available now for ${intent.urgency ? intent.urgency.toLowerCase() : "standard"} dispatch`,
    );
  } else {
    reasons.push(`Currently completing active assignment`);
  }

  if ((worker.distanceKm || 2) <= 2.5) {
    reasons.push(`Proximity match (${worker.distanceKm} km from location)`);
  }

  if ((worker.reliabilityScore || 90) >= 90) {
    reasons.push(
      `High reliability history (${worker.reliabilityScore}% on-time completion)`,
    );
  }

  if ((worker.jobsCompleted7Days || 2) <= 3) {
    reasons.push(
      `Lower recent opportunity share (${worker.jobsCompleted7Days} jobs in last 7 days) — priority equity allocation`,
    );
  }

  return reasons;
};

export const whyNotHighestRated = (topFairMatchWorker, pool = WORKERS) => {
  if (!topFairMatchWorker) return null;

  const categoryWorkers = pool.filter(
    (w) => w.category === topFairMatchWorker.category,
  );
  const highestRatedWorker = [...categoryWorkers].sort(
    (a, b) => b.rating - a.rating,
  )[0];

  if (!highestRatedWorker || highestRatedWorker.id === topFairMatchWorker.id) {
    return null;
  }

  const selectedWorker = topFairMatchWorker;
  const highestRatedJobs7d = highestRatedWorker.jobsCompleted7Days ?? 9;
  const selectedJobs7d = selectedWorker.jobsCompleted7Days ?? 2;

  return {
    highestRatedName: highestRatedWorker.name,
    highestRatedScore: `${highestRatedWorker.rating}★`,
    selectedName: selectedWorker.name,
    selectedScore: topFairMatchWorker.fairMatchScore,
    reasons: [
      `${highestRatedWorker.name} has received ${highestRatedJobs7d} jobs in the last 7 days (${highestRatedWorker.cohortOpportunityShare || "42%"} of cohort volume).`,
      `${highestRatedWorker.name}'s active workload capacity is ${highestRatedWorker.workloadCapacity}% (${highestRatedWorker.workloadStatus ? highestRatedWorker.workloadStatus.toLowerCase() : "high"}), risking over-exertion.`,
      `FairMatch selected ${selectedWorker.name} because he provides a ${selectedWorker.skillFitPercent || 96}% skill fit while restoring fair opportunity distribution across the cooperative roster.`,
    ],
  };
};
