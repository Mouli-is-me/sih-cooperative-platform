import { parseServiceIntent } from "../../frontend/src/services/intentParser.js";
import { mergeIntentContext } from "../../frontend/src/services/intentEngine/contextEngine.js";

console.log("==================================================");
console.log("UNIVERSAL CASUAL SPEECH INTENT ENGINE 2.0 VERIFICATION");
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

// Test 1: English Casual Speech
const t1 = parseServiceIntent("Bro my kitchen tap has been leaking since morning, can someone come today?");
assert(
  t1.serviceCategory === "PLUMBING" && t1.task === "TAP_REPAIR" && t1.preferredTime === "TODAY",
  "English Casual Speech: Kitchen tap leak today -> PLUMBING / TAP_REPAIR / TODAY",
  `Got: Category=${t1.serviceCategory}, Task=${t1.task}, Time=${t1.preferredTime}`
);

// Test 2: Tamil Native Script
const t2 = parseServiceIntent("அண்ணா, காலையில இருந்து கிச்சன் டேப் கசிகிறது, இன்னைக்கு யாராவது வர முடியுமா?");
assert(
  t2.serviceCategory === "PLUMBING" && t2.language === "ta",
  "Tamil Native Script: 'கிச்சன் டேப் கசிகிறது' -> PLUMBING (Language ta)",
  `Got: Category=${t2.serviceCategory}, Language=${t2.language}`
);

// Test 3: Hindi Devanagari Script
const t3 = parseServiceIntent("भाई सुबह से किचन का नल लीक हो रहा है, आज कोई आ सकता है क्या?");
assert(
  t3.serviceCategory === "PLUMBING" && t3.language === "hi",
  "Hindi Devanagari Script: 'किचन का नल लीक हो रहा है' -> PLUMBING (Language hi)",
  `Got: Category=${t3.serviceCategory}, Language=${t3.language}`
);

// Test 4: Tanglish (Tamil + English in Latin Script)
const t4 = parseServiceIntent("Anna kitchen tap morning la irundhu leak aaguthu, innike plumber venum.");
assert(
  t4.serviceCategory === "PLUMBING" && t4.task === "TAP_REPAIR" && t4.urgency === "HIGH",
  "Tanglish: 'kitchen tap leak aaguthu, innike plumber venum' -> PLUMBING / HIGH Urgency",
  `Got: Category=${t4.serviceCategory}, Urgency=${t4.urgency}`
);

// Test 5: Hinglish (Hindi + English in Latin Script)
const t5 = parseServiceIntent("Bhai kitchen ka tap leak ho raha hai, aaj plumber chahiye.");
assert(
  t5.serviceCategory === "PLUMBING" && t5.language === "hi" && t5.isCodeMixed,
  "Hinglish: 'kitchen ka tap leak ho raha hai' -> PLUMBING / Hinglish Code-Mixed",
  `Got: Category=${t5.serviceCategory}, Language=${t5.language}, CodeMixed=${t5.isCodeMixed}`
);

// Test 6: Code-Switching (Electrical Fan)
const t6 = parseServiceIntent("Fan work aagala, electrician yaarachum irukangala?");
assert(
  t6.serviceCategory === "ELECTRICAL" && t6.task === "FAN_REPAIR",
  "Code-Switching: 'Fan work aagala' -> ELECTRICAL / FAN_REPAIR",
  `Got: Category=${t6.serviceCategory}, Task=${t6.task}`
);

// Test 7: Transliterated Speech ("veetla current problem")
const t7 = parseServiceIntent("veetla current problem bro");
assert(
  t7.serviceCategory === "ELECTRICAL",
  "Transliterated: 'veetla current problem' -> ELECTRICAL",
  `Got: Category=${t7.serviceCategory}`
);

// Test 8: Spelling & STT Errors ("plumer venum", "tap leeking")
const t8 = parseServiceIntent("plumer venum tap leeking");
assert(
  t8.serviceCategory === "PLUMBING" && t8.task === "TAP_REPAIR",
  "Spelling / STT Errors: 'plumer venum tap leeking' -> PLUMBING / TAP_REPAIR",
  `Got: Category=${t8.serviceCategory}, Task=${t8.task}`
);

// Test 9: Low Confidence & Ambiguous Input
const t9 = parseServiceIntent("I need someone to fix something at home");
assert(
  t9.confidence < 0.75 && t9.missingFields.length > 0,
  "Ambiguous Input: 'fix something at home' produces low confidence & missingFields",
  `Got Confidence=${t9.confidence}, MissingFields=${t9.missingFields.join(", ")}`
);

// Test 10: Missing Information Identification
const t10 = parseServiceIntent("My tap is leaking");
assert(
  t10.missingFields.includes("location"),
  "Missing Information: 'My tap is leaking' flags missing location",
  `Missing fields: ${t10.missingFields.join(", ")}`
);

// Test 11: Multi-Turn Context Accumulation
const turn1 = parseServiceIntent("My tap is leaking");
const turn2 = parseServiceIntent("Kitchen one");
const merged = mergeIntentContext(turn1, turn2);
assert(
  merged.serviceCategory === "PLUMBING" && merged.location.includes("KITCHEN") && merged.confidence >= turn1.confidence,
  "Multi-turn Context Accumulation merges Turn 1 & Turn 2 into refined canonical intent",
  `Turn 1 Conf=${turn1.confidence} -> Merged Conf=${merged.confidence}, Location=${merged.location}`
);

// Test 12: FairMatch Payload Compatibility
const payload = {
  categoryKey: t1.categoryKey,
  serviceCategory: t1.serviceCategory,
  task: t1.task,
  urgency: t1.urgency,
  location: t1.location
};
assert(
  payload.categoryKey === "plumbing" && payload.serviceCategory === "PLUMBING",
  "FairMatch Payload Compatibility: Canonical taxonomy fields ready for FairMatch engine",
  `Payload: ${JSON.stringify(payload)}`
);

console.log("\n==================================================");
console.log(`RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
console.log("==================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
