// Layer 11 & Context Accumulation Engine for Multi-turn Conversations

export const mergeIntentContext = (previousIntent = null, newExtractedIntent = {}) => {
  if (!previousIntent) return newExtractedIntent;

  const merged = { ...previousIntent };

  // Merge serviceCategory if missing or UNKNOWN in previous
  if (!merged.serviceCategory || merged.serviceCategory === "UNKNOWN") {
    merged.serviceCategory = newExtractedIntent.serviceCategory;
    merged.categoryKey = newExtractedIntent.categoryKey;
    merged.task = newExtractedIntent.task;
  }

  // Merge task if missing in previous
  if ((!merged.task || merged.task === "TAP_REPAIR") && newExtractedIntent.task) {
    merged.task = newExtractedIntent.task;
    merged.taskDetail = newExtractedIntent.taskDetail;
  }

  // Merge location if new intent provides specific place or previous was generic default
  if (newExtractedIntent.entities && newExtractedIntent.entities.place) {
    merged.location = `${newExtractedIntent.entities.place.toUpperCase()} (Madurai)`;
    if (merged.entities) merged.entities.place = newExtractedIntent.entities.place;
  } else if (!merged.location || merged.location === "Madurai Sector 4") {
    if (newExtractedIntent.location) merged.location = newExtractedIntent.location;
  }

  // Merge preferredTime if missing or provided
  if (newExtractedIntent.entities && newExtractedIntent.entities.time) {
    merged.preferredTime = newExtractedIntent.entities.time;
  }

  // Merge urgency if upgraded
  if (newExtractedIntent.urgency === "HIGH") {
    merged.urgency = "HIGH";
  }

  // Re-calculate missing fields & confidence
  const missing = [];
  if (!merged.serviceCategory || merged.serviceCategory === "UNKNOWN") missing.push("serviceCategory");
  if (!merged.task) missing.push("task");
  if (!merged.entities || !merged.entities.place) missing.push("location");
  if (!merged.entities || !merged.entities.time) missing.push("preferredTime");

  merged.missingFields = missing;

  if (merged.serviceCategory && merged.task && merged.entities && merged.entities.place) {
    merged.confidence = Math.min(0.98, Math.max(merged.confidence || 0.70, 0.94));
  }

  merged.rawText = `${previousIntent.originalText || previousIntent.rawText || ""} | ${newExtractedIntent.originalText || newExtractedIntent.rawText || ""}`.trim();

  return merged;
};
