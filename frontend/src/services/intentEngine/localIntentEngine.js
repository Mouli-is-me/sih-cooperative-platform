// Primary Local Intent Engine 2.0 (Deterministic / Fuzzy Multi-Layer Pipeline)

import { TAXONOMY, getLocalizedCategoryName, getLocalizedTaskName } from "./taxonomy.js";
import { detectLanguageAndScript } from "./detector.js";
import { normalizeCasualSpeech } from "./normalizer.js";
import { extractEntities } from "./entityExtractor.js";
import enLocale from "./locales/en.js";
import taLocale from "./locales/ta.js";
import hiLocale from "./locales/hi.js";

const LOCALES = { en: enLocale, ta: taLocale, hi: hiLocale };

export class LocalIntentEngine {
  parse(rawText = "", context = null) {
    const text = (rawText || "").trim();

    // Layer 1: Language & Script Detection
    const langDetection = detectLanguageAndScript(text);

    // Layer 2 & 3: Normalization & Transliteration Cleanup
    const normalization = normalizeCasualSpeech(text);

    // Layer 4, 7, 8, 9: Entity Extraction
    const entities = extractEntities(text, normalization.normalizedText);

    // Layer 5: Service Classification
    const serviceResult = this.classifyServiceCategory(text, normalization.normalizedText, langDetection.primaryLang);

    // Layer 6: Task Classification
    const taskResult = this.classifyTask(serviceResult.categoryKey, text, normalization.normalizedText, entities);

    // Layer 10: Confidence Estimation
    let confidence = 0.50;
    if (serviceResult.categoryKey !== "UNKNOWN") confidence += 0.25;
    if (taskResult.taskId) confidence += 0.15;
    if (entities.place) confidence += 0.05;
    if (entities.time) confidence += 0.04;
    confidence = Math.min(0.98, Math.max(0.30, Number(confidence.toFixed(2))));

    // Layer 11: Missing Fields Detection
    const missingFields = [];
    if (serviceResult.categoryKey === "UNKNOWN") missingFields.push("serviceCategory");
    if (!taskResult.taskId) missingFields.push("task");
    if (!entities.place) missingFields.push("location");
    if (!entities.time) missingFields.push("preferredTime");

    const categoryKey = serviceResult.categoryKey !== "UNKNOWN" ? serviceResult.categoryKey : "plumbing";
    const serviceCategory = categoryKey.toUpperCase();
    const task = taskResult.taskId || "TAP_REPAIR";

    // Explanatory summary
    const localizedCat = getLocalizedCategoryName(categoryKey, langDetection.primaryLang);
    const localizedTask = getLocalizedTaskName(categoryKey, task, langDetection.primaryLang);

    const explanation = confidence >= 0.75
      ? `Understood request as ${serviceCategory} (${task}) for ${entities.place || 'location'} (${entities.time || 'Today'}).`
      : `Broad intent detected for ${serviceCategory}. Please clarify specific task details.`;

    return {
      language: langDetection.primaryLang,
      script: langDetection.script,
      detectedLabel: langDetection.detectedLabel,
      isCodeMixed: langDetection.isCodeMixed,
      originalText: text,
      normalizedText: normalization.normalizedText,
      serviceCategory,
      categoryKey,
      task,
      taskDetail: localizedTask,
      urgency: entities.urgency,
      urgencyBadge: entities.urgency === "HIGH" ? "High Urgency (Today)" : "Standard",
      preferredTime: entities.time || "TODAY",
      estimatedDuration: taskResult.estimatedDuration || "30–60 min",
      location: entities.place ? `${entities.place.toUpperCase()} (Madurai)` : "Madurai Sector 4",
      confidence,
      missingFields,
      entities,
      explanation
    };
  }

  classifyServiceCategory(rawText, normalizedText, langCode) {
    const combined = `${rawText} ${normalizedText}`.toLowerCase();

    const locale = LOCALES[langCode] || LOCALES.en;

    // Direct match against locale synonyms
    for (const [catKey, synonymList] of Object.entries(locale.synonyms)) {
      for (const syn of synonymList) {
        if (combined.includes(syn.toLowerCase())) {
          return { categoryKey: catKey.toLowerCase(), confidence: 0.90 };
        }
      }
    }

    // Cross-locale fallback search
    for (const [locKey, locObj] of Object.entries(LOCALES)) {
      for (const [catKey, synonymList] of Object.entries(locObj.synonyms)) {
        for (const syn of synonymList) {
          if (combined.includes(syn.toLowerCase())) {
            return { categoryKey: catKey.toLowerCase(), confidence: 0.85 };
          }
        }
      }
    }

    return { categoryKey: "UNKNOWN", confidence: 0.30 };
  }

  classifyTask(categoryKey, rawText, normalizedText, entities) {
    const combined = `${rawText} ${normalizedText}`.toLowerCase();
    const catUpper = (categoryKey || "").toUpperCase();
    const cat = TAXONOMY[catUpper];

    if (!cat) {
      return { taskId: "TAP_REPAIR", estimatedDuration: "30–60 min" };
    }

    // Match task based on extracted object & problem
    if (entities.object === "tap" || combined.includes("tap") || combined.includes("குழாய்") || combined.includes("नल")) {
      return { taskId: "TAP_REPAIR", estimatedDuration: TAXONOMY.PLUMBING.tasks.TAP_REPAIR.estimatedDuration };
    }
    if (entities.object === "pipe" || combined.includes("pipe") || combined.includes("பைப்") || combined.includes("पाइप")) {
      return { taskId: "PIPE_LEAK", estimatedDuration: TAXONOMY.PLUMBING.tasks.PIPE_LEAK.estimatedDuration };
    }
    if (entities.object === "fan" || combined.includes("fan") || combined.includes("மின்விசிறி") || combined.includes("पंखा")) {
      return { taskId: "FAN_REPAIR", estimatedDuration: TAXONOMY.ELECTRICAL.tasks.FAN_REPAIR.estimatedDuration };
    }
    if (entities.object === "door" || combined.includes("door") || combined.includes("கதவு") || combined.includes("दरवाजा")) {
      return { taskId: "DOOR_REPAIR", estimatedDuration: TAXONOMY.CARPENTRY.tasks.DOOR_REPAIR.estimatedDuration };
    }

    // Default to first task in category taxonomy
    const firstTaskKey = Object.keys(cat.tasks)[0];
    const taskObj = cat.tasks[firstTaskKey];
    return {
      taskId: firstTaskKey,
      estimatedDuration: taskObj ? taskObj.estimatedDuration : "45 min"
    };
  }
}
