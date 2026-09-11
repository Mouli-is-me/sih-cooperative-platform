import Worker from "../models/Worker.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Job from "../models/Job.js";
import {
  getCooperativeAnalyticsFromSupabase,
  isSupabaseConfigured
} from "../config/supabase.js";

// Baseline simulation metrics fallback
const BASELINE_METRICS = {
  activeWorkers: 147,
  availableWorkers: 98,
  busyWorkers: 49,
  openRequests: 326,
  matchedRequests: 45,
  completedJobs: 281,
  averageResponseTimeMin: 12,
  averageCompletionTimeHours: 1.4,
  utilizationRatePct: 67,
  opportunityBalanceIndex: 84,
  serviceDemand: [
    { category: "Electrical", growth: "+34%", level: "High", color: "#1D6B45" },
    { category: "Plumbing", growth: "+21%", level: "High", color: "#2E8B57" },
    { category: "Cleaning", growth: "+18%", level: "Medium", color: "#4A7C59" },
    {
      category: "Carpentry",
      growth: "+12%",
      level: "Medium",
      color: "#6A8D73",
    },
    {
      category: "Caregiving",
      growth: "+9%",
      level: "Stable",
      color: "#8B9E90",
    },
  ],
  workforceGaps: [
    {
      region: "Madurai North Zone",
      category: "Electrical",
      recommendedRecruits: 7,
      urgency: "Critical Gap",
      reason:
        "Rising residential demand exceeding active licensed wiremen by 28%",
    },
    {
      region: "Madurai West Zone",
      category: "Plumbing",
      recommendedRecruits: 4,
      urgency: "Moderate Gap",
      reason: "High peak emergency calls during morning window (8 AM – 11 AM)",
    },
    {
      region: "Anna Nagar Sector 3",
      category: "Caregiving",
      recommendedRecruits: 3,
      urgency: "Noticeable Gap",
      reason: "Increased post-op geriatric home assistance requests",
    },
  ],
  opportunityDistribution: [
    {
      cohort: "Plumbing Cohort",
      top10PctShare: "24%",
      status: "Balanced Equity",
      workersCount: 42,
    },
    {
      cohort: "Electrical Cohort",
      top10PctShare: "28%",
      status: "Optimal Distribution",
      workersCount: 38,
    },
    {
      cohort: "Carpentry Cohort",
      top10PctShare: "22%",
      status: "Balanced Equity",
      workersCount: 26,
    },
    {
      cohort: "Cleaning Cohort",
      top10PctShare: "29%",
      status: "Optimal Distribution",
      workersCount: 41,
    },
  ],
  traditionalVsFairMatchStats: {
    traditionalTopShare: "64% of jobs received by top 10% workers",
    fairMatchTopShare: "26% of jobs received by top 10% workers (Balanced)",
    giniIndexBefore: "0.58 (High Concentration)",
    giniIndexAfter: "0.22 (Optimal Equity Distribution)",
  },
};

export const getCooperativeAnalytics = async (req, res) => {
  if (isSupabaseConfigured()) {
    const sbAnalytics = await getCooperativeAnalyticsFromSupabase();
    if (sbAnalytics) {
      return res.status(200).json({
        ...BASELINE_METRICS,
        ...sbAnalytics,
        dataSource: "SUPABASE_POSTGRESQL"
      });
    }
  }

  try {
    let workerCount = 0;
    let availableCount = 0;
    let busyCount = 0;
    let requestCount = 0;
    let matchedCount = 0;
    let completedCount = 0;

    try {
      workerCount = await Worker.countDocuments();
      availableCount = await Worker.countDocuments({ isAvailable: true });
      busyCount = await Worker.countDocuments({ status: "BUSY" });
      requestCount = await ServiceRequest.countDocuments();
      matchedCount = await ServiceRequest.countDocuments({ status: "MATCHED" });
      completedCount =
        (await ServiceRequest.countDocuments({ status: "COMPLETED" })) +
        (await Job.countDocuments({ status: "COMPLETED" }));
    } catch (err) {
      // DB not ready or running offline mode
    }

    // Merge dynamic DB counts with baseline structure if DB has data
    const activeWorkers =
      workerCount > 0 ? workerCount : BASELINE_METRICS.activeWorkers;
    const availableWorkers =
      availableCount > 0 ? availableCount : BASELINE_METRICS.availableWorkers;
    const busyWorkers =
      busyCount > 0 ? busyCount : BASELINE_METRICS.busyWorkers;
    const openRequests =
      requestCount > 0 ? requestCount : BASELINE_METRICS.openRequests;
    const matchedRequests =
      matchedCount > 0 ? matchedCount : BASELINE_METRICS.matchedRequests;
    const completedJobs =
      completedCount > 0 ? completedCount : BASELINE_METRICS.completedJobs;

    const utilizationRate = Math.round(
      (busyWorkers / Math.max(1, activeWorkers)) * 100,
    );

    return res.status(200).json({
      ...BASELINE_METRICS,
      activeWorkers,
      availableWorkers,
      busyWorkers,
      openRequests,
      matchedRequests,
      completedJobs,
      utilizationRatePct:
        utilizationRate || BASELINE_METRICS.utilizationRatePct,
      dataSource: workerCount > 0 ? "LIVE_DATABASE" : "DEMO_SIMULATION",
    });
  } catch (err) {
    return res.status(200).json({
      ...BASELINE_METRICS,
      dataSource: "DEMO_SIMULATION",
    });
  }
};

