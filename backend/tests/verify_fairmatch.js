import {
  rankWorkersFairMatch,
  scoreWorkerFairMatch,
  calculateOpportunityEquity,
  whyNotHighestRated,
} from "../services/fairMatchEngine.js";
import { transitionRequest, STAGES } from "../services/lifecycle.js";
import { parseServiceIntent } from "../../frontend/src/services/intentParser.js";

console.log("==================================================");
console.log("CO-OP OS EXECUTABLE VERIFICATION SUITE");
console.log("==================================================\n");

let passedCount = 0;
let totalCount = 0;

const assert = (condition, title, details = "") => {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] Test ${totalCount}: ${title}`);
  } else {
    console.error(`[FAIL] Test ${totalCount}: ${title}`);
    if (details) console.error(`       Details: ${details}`);
  }
};

// Mock Test Workers Dataset
const TEST_WORKERS = [
  {
    id: "w-high-rating",
    name: "Ravi (High Rating, Over-allocated)",
    category: "plumbing",
    rating: 4.9,
    jobsCompleted7Days: 10,
    workloadCapacity: 90,
    status: "BUSY",
    isAvailable: false,
    distanceKm: 1.0,
    reliabilityScore: 98,
    skillFitPercent: 98,
  },
  {
    id: "w-balanced-equity",
    name: "Kumar (Balanced Equity, Available)",
    category: "plumbing",
    rating: 4.7,
    jobsCompleted7Days: 1,
    workloadCapacity: 25,
    status: "AVAILABLE",
    isAvailable: true,
    distanceKm: 1.5,
    reliabilityScore: 94,
    skillFitPercent: 96,
  },
  {
    id: "w-incompatible-skill",
    name: "Murugan (Carpenter)",
    category: "carpentry",
    rating: 4.8,
    jobsCompleted7Days: 2,
    workloadCapacity: 30,
    status: "AVAILABLE",
    isAvailable: true,
    distanceKm: 1.2,
    reliabilityScore: 95,
    skillFitPercent: 95,
  },
  {
    id: "w-unavailable",
    name: "Deva (Unavailable)",
    category: "plumbing",
    rating: 5.0,
    jobsCompleted7Days: 0,
    workloadCapacity: 0,
    status: "UNAVAILABLE",
    isAvailable: false,
    distanceKm: 0.5,
    reliabilityScore: 100,
    skillFitPercent: 100,
  },
];

// Test 1: Highest-rated worker is not always selected
const plumbingIntent = {
  serviceCategory: "Plumbing",
  categoryKey: "plumbing",
  urgency: "Standard",
};
const fairRankings = rankWorkersFairMatch(plumbingIntent, TEST_WORKERS);
const winner = fairRankings[0];
assert(
  winner.worker.id === "w-balanced-equity",
  "Highest-rated worker is not always selected (FairMatch balances work)",
  `Winner was ${winner.worker.name} (Score: ${winner.finalScore}), not 4.9★ Ravi.`,
);

// Test 2: Unavailable worker cannot win
const unavailInRank = fairRankings.find((r) => r.worker.id === "w-unavailable");
assert(
  !unavailInRank || unavailInRank.availabilityScore === 0,
  "Unavailable worker cannot win (Status UNAVAILABLE scored 0 availability)",
  `Deva availability score: ${unavailInRank ? unavailInRank.availabilityScore : "Filtered out"}`,
);

// Test 3: Incompatible skill strongly reduces score
const carpenterScore = scoreWorkerFairMatch(
  TEST_WORKERS[2],
  plumbingIntent,
  TEST_WORKERS,
);
assert(
  carpenterScore.skillScore === 30,
  "Incompatible skill category strongly reduces skillScore",
  `Carpenter skill score for plumbing request: ${carpenterScore.skillScore}`,
);

// Test 4: High workload affects score
const highWorkloadWorker = TEST_WORKERS[0]; // 90% capacity occupied
const lowWorkloadWorker = TEST_WORKERS[1]; // 25% capacity occupied
const highWorkloadScore = scoreWorkerFairMatch(
  highWorkloadWorker,
  plumbingIntent,
  TEST_WORKERS,
);
const lowWorkloadScore = scoreWorkerFairMatch(
  lowWorkloadWorker,
  plumbingIntent,
  TEST_WORKERS,
);
assert(
  lowWorkloadScore.workloadScore > highWorkloadScore.workloadScore,
  "High workload capacity occupation reduces workloadScore",
  `Low workload worker: ${lowWorkloadScore.workloadScore}, High workload worker: ${highWorkloadScore.workloadScore}`,
);

// Test 5: Opportunity Equity affects ranking
const equityHighRavi = calculateOpportunityEquity(
  TEST_WORKERS[0],
  TEST_WORKERS,
);
const equityKumar = calculateOpportunityEquity(TEST_WORKERS[1], TEST_WORKERS);
assert(
  equityKumar.score > equityHighRavi.score,
  "Opportunity Equity Index penalizes workers with disproportionate recent jobs",
  `Kumar (1 job): ${equityKumar.score}/100 vs Ravi (10 jobs): ${equityHighRavi.score}/100`,
);

// Test 6: Invalid lifecycle transitions fail
const req = { id: "req-1", status: STAGES.CREATED };
const invalidTransition = transitionRequest(req, STAGES.COMPLETED);
assert(
  invalidTransition.success === false,
  "Invalid lifecycle transition (CREATED -> COMPLETED) is rejected",
  `Error: ${invalidTransition.error}`,
);
const validTransition = transitionRequest(req, STAGES.MATCHED);
assert(
  validTransition.success === true && req.status === STAGES.MATCHED,
  "Valid lifecycle transition (CREATED -> MATCHED) succeeds",
);

// Test 7: Completed job updates status & stage sequence
const acceptTransition = transitionRequest(req, STAGES.WORKER_ACCEPTED);
const enrouteTransition = transitionRequest(req, STAGES.EN_ROUTE);
const startTransition = transitionRequest(req, STAGES.JOB_STARTED);
const completeTransition = transitionRequest(req, STAGES.COMPLETED);
assert(
  completeTransition.success === true && req.status === STAGES.COMPLETED,
  "Full lifecycle progression CREATED -> MATCHED -> WORKER_ACCEPTED -> EN_ROUTE -> JOB_STARTED -> COMPLETED succeeds",
);

// Test 8: Tamil intent is recognized
const tamilQuery = "என் சமையலறை குழாய் கசிகிறது";
const parsedTamil = parseServiceIntent(tamilQuery);
assert(
  parsedTamil.categoryKey === "plumbing" &&
    parsedTamil.serviceCategory === "PLUMBING",
  "Tamil intent parsing correctly extracts Plumbing category",
  `Parsed Tamil Intent: Category=${parsedTamil.serviceCategory}, Task=${parsedTamil.taskDetail}`,
);

// Test 9: Low-confidence intent asks for clarification
const vagueQuery = "hello looking for general help maybe";
const parsedVague = parseServiceIntent(vagueQuery);
assert(
  parsedVague.confidence < 0.8,
  "Low confidence intent triggers lower confidence score",
  `Confidence score for vague text: ${parsedVague.confidenceScore}%`,
);

console.log("\n==================================================");
console.log(`RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
console.log("==================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
