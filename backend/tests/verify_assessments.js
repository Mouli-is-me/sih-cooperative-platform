import { getAssessmentForCategory, CATEGORY_WEIGHTS, PASS_THRESHOLD, ASSESSMENTS } from "../config/assessmentConfig.js";

console.log("==================================================");
console.log("CO-OP OS PRACTICAL SKILL ASSESSMENT TEST SUITE");
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

// Test 1: Category weights sum to exactly 1.0 (100%)
const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
assert(
  Math.abs(totalWeight - 1.0) < 0.0001,
  "Category weights sum to 100%",
  `Calculated weight sum: ${totalWeight}`
);

// Test 2: All 9 Trade Categories exist and have complete question sets
const requiredTrades = [
  "plumbing", "electrical", "carpentry", "painting", "cleaning",
  "caregiving", "driving", "gardening", "technician"
];

requiredTrades.forEach((trade) => {
  const config = getAssessmentForCategory(trade);
  const valid = config && config.questions && config.questions.length >= 6;
  assert(
    valid,
    `Trade Assessment Config for '${trade}' is valid`,
    `Found ${config?.questions?.length || 0} questions for ${trade}`
  );
});

// Test 3: Weighted score calculation test for 100% correct answers
const calculateWeightedScore = (scores) => {
  return Math.round(
    scores.knowledge * CATEGORY_WEIGHTS.knowledge +
    scores.tools * CATEGORY_WEIGHTS.tools +
    scores.procedure * CATEGORY_WEIGHTS.procedure +
    scores.diagnosis * CATEGORY_WEIGHTS.diagnosis +
    scores.safety * CATEGORY_WEIGHTS.safety +
    scores.practical * CATEGORY_WEIGHTS.practical
  );
};

const perfectScores = { knowledge: 100, tools: 100, procedure: 100, diagnosis: 100, safety: 100, practical: 100 };
const perfectWeighted = calculateWeightedScore(perfectScores);
assert(
  perfectWeighted === 100,
  "Perfect scores produce 100% weighted score",
  `Got ${perfectWeighted}`
);

// Test 4: Weighted score calculation test for mixed sub-scores
// Knowledge(100*0.2) + Tools(100*0.15) + Procedure(100*0.2) + Diagnosis(100*0.2) + Safety(0*0.15) + Practical(0*0.1) = 20+15+20+20 = 75
const mixedScores = { knowledge: 100, tools: 100, procedure: 100, diagnosis: 100, safety: 0, practical: 0 };
const mixedWeighted = calculateWeightedScore(mixedScores);
assert(
  mixedWeighted === 75,
  "Mixed scores correctly apply category weights",
  `Expected 75, Got ${mixedWeighted}`
);

// Test 5: Pass threshold & skill level determination
const getSkillLevelAndStatus = (score) => {
  if (score < PASS_THRESHOLD) {
    return { status: "FAILED", skillLevel: "Not Qualified" };
  }
  let skillLevel = "Basic";
  if (score >= 90) skillLevel = "Advanced";
  else if (score >= 80) skillLevel = "Intermediate";
  return { status: "SUPERVISOR_REVIEW", skillLevel };
};

const failTest = getSkillLevelAndStatus(65);
assert(
  failTest.status === "FAILED" && failTest.skillLevel === "Not Qualified",
  "Scores below 70% fail the assessment",
  `Score 65 produced status: ${failTest.status}, level: ${failTest.skillLevel}`
);

const basicTest = getSkillLevelAndStatus(75);
assert(
  basicTest.status === "SUPERVISOR_REVIEW" && basicTest.skillLevel === "Basic",
  "Score 75% achieves Basic skill level and pending review",
  `Score 75 produced status: ${basicTest.status}, level: ${basicTest.skillLevel}`
);

const interTest = getSkillLevelAndStatus(85);
assert(
  interTest.status === "SUPERVISOR_REVIEW" && interTest.skillLevel === "Intermediate",
  "Score 85% achieves Intermediate skill level",
  `Score 85 produced status: ${interTest.status}, level: ${interTest.skillLevel}`
);

const advTest = getSkillLevelAndStatus(95);
assert(
  advTest.status === "SUPERVISOR_REVIEW" && advTest.skillLevel === "Advanced",
  "Score 95% achieves Advanced skill level",
  `Score 95 produced status: ${advTest.status}, level: ${advTest.skillLevel}`
);

// Test 6: Fallback category mapping for generic/unknown trades
const fallbackConfig = getAssessmentForCategory("roofing_specialist");
assert(
  fallbackConfig && fallbackConfig.questions && fallbackConfig.questions.length === 6 && fallbackConfig.category === "roofing_specialist",
  "Unknown trade dynamically generates valid 6-question trade assessment",
  `Generated category: ${fallbackConfig?.category}, Questions: ${fallbackConfig?.questions?.length}`
);

console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log("==================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  process.exit(0);
}
