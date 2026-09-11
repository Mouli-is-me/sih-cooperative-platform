// Layer 2 & 3: Casual Speech Normalizer & Transliteration Resolver

export const normalizeCasualSpeech = (rawText = "") => {
  if (!rawText || typeof rawText !== "string") return { normalizedText: "", cleanTokens: [] };

  let text = rawText.toLowerCase().trim();

  // 1. Remove conversational fillers & honorifics
  const fillers = [
    /\b(bro|anna|bhai|yaar|please|plz|sir|boss|kindly|hello|hi|hey)\b/g,
    /\b(can someone|anyone there|is there|looking for|i need|mujhe|enakku)\b/g,
    /\b(can come|vara mudiyuma|aaj sakta hai|aaguthu|ho raha hai)\b/g
  ];

  fillers.forEach(regex => {
    text = text.replace(regex, " ");
  });

  // 2. STT & Spelling Error Normalization
  const spellingFixes = [
    { pattern: /\b(plumer|plumbr|pluming|plumbrr)\b/g, replacement: "plumber" },
    { pattern: /\b(electrican|electrcian|electrition)\b/g, replacement: "electrician" },
    { pattern: /\b(carpentar|carprnter)\b/g, replacement: "carpenter" },
    { pattern: /\b(leeking|leek|leakingg)\b/g, replacement: "leaking" },
    { pattern: /\b(kadhavu)\b/g, replacement: "door" },
    { pattern: /\b(thanni|paani)\b/g, replacement: "water" },
    { pattern: /\b(veetla|ghar pe)\b/g, replacement: "home" },
    { pattern: /\b(suthala|work aagala|nahi chal raha)\b/g, replacement: "not working" },
    { pattern: /\b(venum|chahiye)\b/g, replacement: "needed" }
  ];

  spellingFixes.forEach(fix => {
    text = text.replace(fix.pattern, fix.replacement);
  });

  // 3. Clean extra whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();
  const cleanTokens = cleanText.split(" ").filter(Boolean);

  return {
    normalizedText: cleanText,
    cleanTokens
  };
};
