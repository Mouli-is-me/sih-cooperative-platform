// Layer 1: Language & Script Detector for Universal Intent Engine 2.0

export const detectLanguageAndScript = (rawText = "") => {
  const text = (rawText || "").trim();
  if (!text) {
    return {
      language: "en",
      script: "latin",
      isCodeMixed: false,
      primaryLang: "en",
      detectedLabel: "English"
    };
  }

  const hasTamilScript = /[\u0B80-\u0BFF]/.test(text);
  const hasDevanagariScript = /[\u0900-\u097F]/.test(text);
  const hasLatinScript = /[a-zA-Z]/.test(text);

  let script = "latin";
  if (hasTamilScript && hasDevanagariScript) script = "multiscript";
  else if (hasTamilScript) script = "tamil";
  else if (hasDevanagariScript) script = "devanagari";

  const lower = text.toLowerCase();

  // Tamil / Tanglish keyword regexes (word boundary protected to prevent substring false positives)
  const tamilRegexes = [
    /\b(venum|aaguthu|suthala|irukangala|inniku|innike|kalaiyila|veetla|kadhavu|thanni|anna|yaarachum|varathuu|kudunga)\b/i,
    /[\u0B80-\u0BFF]/
  ];

  // Hindi / Hinglish keyword regexes
  const hindiRegexes = [
    /\b(chahiye|ho raha hai|nahi chal raha|bhai|aaj|subah se|ghar pe|paani|nal|yaar|karo|karna|chahiye|par|mein)\b/i,
    /[\u0900-\u097F]/
  ];

  const hasTamilMatch = tamilRegexes.some(r => r.test(lower));
  const hasHindiMatch = hindiRegexes.some(r => r.test(lower));

  let primaryLang = "en";
  let isCodeMixed = false;

  if (hasTamilScript || (hasTamilMatch && !hasHindiMatch)) {
    primaryLang = "ta";
    if (hasLatinScript && /[a-z]/i.test(lower)) isCodeMixed = true;
  } else if (hasDevanagariScript || hasHindiMatch) {
    primaryLang = "hi";
    if (hasLatinScript && /[a-z]/i.test(lower)) isCodeMixed = true;
  } else {
    primaryLang = "en";
  }

  let detectedLabel = "English";
  if (primaryLang === "ta") detectedLabel = isCodeMixed ? "Tamil + English (Tanglish)" : "Tamil";
  else if (primaryLang === "hi") detectedLabel = isCodeMixed ? "Hindi + English (Hinglish)" : "Hindi";

  return {
    language: primaryLang,
    script,
    isCodeMixed,
    primaryLang,
    detectedLabel
  };
};
