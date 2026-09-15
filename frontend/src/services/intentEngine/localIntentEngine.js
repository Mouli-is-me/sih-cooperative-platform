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
    let confidence = serviceResult.confidence;
    if (taskResult.taskId) confidence += 0.05;
    if (entities.place) confidence += 0.05;
    if (entities.time) confidence += 0.04;
    confidence = Math.min(0.98, Math.max(0.10, Number(confidence.toFixed(2))));

    // Layer 11: Missing Fields Detection
    const missingFields = [];
    if (serviceResult.categoryKey === "UNKNOWN") missingFields.push("serviceCategory");
    if (!taskResult.taskId) missingFields.push("task");
    if (!entities.place) missingFields.push("location");
    if (!entities.time) missingFields.push("preferredTime");

    const categoryKey = serviceResult.categoryKey !== "UNKNOWN" ? serviceResult.categoryKey : "UNKNOWN";
    const serviceCategory = categoryKey.toUpperCase();
    const task = taskResult.taskId || (categoryKey !== "UNKNOWN" ? Object.keys(TAXONOMY[serviceCategory]?.tasks || {})[0] || "GENERAL" : null);

    // Explanatory summary
    let explanation;
    if (confidence < 0.50 || categoryKey === "UNKNOWN") {
      explanation = "Could you please tell us whether this is related to Drainage, Plumbing, Electrical, or Construction?";
    } else if (confidence >= 0.75) {
      explanation = `Understood request as ${serviceCategory} (${task}) for ${entities.place || 'location'} (${entities.time || 'Today'}).`;
    } else {
      explanation = `Broad intent detected for ${serviceCategory}. Please clarify specific task details.`;
    }

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
      taskDetail: task ? getLocalizedTaskName(categoryKey, task, langDetection.primaryLang) : null,
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
    let combined = `${rawText} ${normalizedText}`.toLowerCase();
    
    // Spelling variations & Normalizations
    const spellingMap = {
      "aaguthu": ["aguthu", "aagudhu", "agudhu"],
      "irukku": ["iruku", "irukudhu"],
      "pannanum": ["pananum"],
      "pogala": ["pogalae", "pogave illa"],
      "aagala": ["agala"],
      "check": ["chek"],
      "repair": ["repaire"],
      "leak": ["leakage", "leeking"],
      "block": ["blockage", "clog"],
      "water": ["watter", "thanni"],
      "current": ["electricity", "power"],
      "crack": [" ಬಿರುಕು", "விரிசல்"],
    };

    for (const [correct, variants] of Object.entries(spellingMap)) {
      for (const variant of variants) {
        combined = combined.replaceAll(variant, correct);
      }
    }

    const scores = { drainage: 0, plumbing: 0, electrical: 0, construction: 0, carpentry: 0, painting: 0, cleaning: 0, caregiving: 0, gardening: 0, driving: 0, technician: 0 };

    // Contextual multi-symptom rules
    if (combined.includes("water") && combined.includes("nikkuthu")) scores.drainage += 2;
    if (combined.includes("water") && combined.includes("pogala")) scores.drainage += 2;
    if (combined.includes("smell") && combined.includes("drainage")) scores.drainage += 2;
    if (combined.includes("waste") && combined.includes("stuck")) scores.drainage += 2;
    if (combined.includes("sink") && combined.includes("block")) scores.drainage += 2;
    if (combined.includes("drainage")) scores.drainage += 1.5;
    
    if (combined.includes("tap") && combined.includes("leak")) scores.plumbing += 2;
    if (combined.includes("tap") && combined.includes("water")) scores.plumbing += 1.5;
    if (combined.includes("water") && combined.includes("waste")) scores.plumbing += 1.5;
    if (combined.includes("pipe") && combined.includes("damage")) scores.plumbing += 1.5;
    if (combined.includes("water") && combined.includes("leak")) scores.plumbing += 1.5;

    if (combined.includes("current") && combined.includes("problem")) scores.electrical += 2;
    if (combined.includes("light") && combined.includes("eriyala")) scores.electrical += 2;
    if (combined.includes("light") && combined.includes("work aagala")) scores.electrical += 2;
    if (combined.includes("fan") && combined.includes("slow")) scores.electrical += 2;
    if (combined.includes("switch") && combined.includes("varala")) scores.electrical += 2;
    if (combined.includes("charge") && combined.includes("aagala")) scores.electrical += 2;
    if (combined.includes("current") && combined.includes("illa")) scores.electrical += 2;

    if (combined.includes("wall") && combined.includes("crack")) scores.construction += 2;
    if (combined.includes("floor") && combined.includes("level")) scores.construction += 2;
    if (combined.includes("roof") && combined.includes("leak")) scores.construction += 2;
    if (combined.includes("cement") && combined.includes("work")) scores.construction += 2;
    if (combined.includes("door") && combined.includes("fit")) scores.construction += 2;
    
    // Priority resolution (e.g. roof leak = construction, bathroom pipe leak = plumbing)
    if (combined.includes("roof") && combined.includes("leak")) {
        scores.construction += 3;
        scores.plumbing = 0; // override
    }
    if (combined.includes("bathroom") && combined.includes("pipe") && combined.includes("leak")) {
        scores.plumbing += 3;
        scores.construction = 0; // override
    }
    if (combined.includes("kitchen") && combined.includes("sink") && combined.includes("water")) {
        scores.drainage += 3;
    }

    // Direct match against locale synonyms
    for (const [locKey, locObj] of Object.entries(LOCALES)) {
      for (const [catKey, synonymList] of Object.entries(locObj.synonyms)) {
        for (const syn of synonymList) {
          if (combined.includes(syn.toLowerCase())) {
            scores[catKey.toLowerCase()] = (scores[catKey.toLowerCase()] || 0) + 1;
          }
        }
      }
    }

    let topCategory = "UNKNOWN";
    let maxScore = 0;
    
    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topCategory = cat;
      }
    }

    if (maxScore === 0) {
      return { categoryKey: "UNKNOWN", confidence: 0.30 };
    }

    // Convert score to confidence roughly
    let conf = Math.min(0.95, 0.5 + (maxScore * 0.15));
    return { categoryKey: topCategory, confidence: conf };
  }

  classifyTask(categoryKey, rawText, normalizedText, entities) {
    let combined = `${rawText} ${normalizedText}`.toLowerCase();
    const spellingMap = {
      "aaguthu": ["aguthu", "aagudhu", "agudhu"],
      "irukku": ["iruku", "irukudhu"],
      "pogala": ["pogalae", "pogave illa"],
      "aagala": ["agala"],
      "leak": ["leakage", "leeking"],
      "block": ["blockage", "clog"],
    };
    for (const [correct, variants] of Object.entries(spellingMap)) {
      for (const variant of variants) {
        combined = combined.replaceAll(variant, correct);
      }
    }

    const catUpper = (categoryKey || "").toUpperCase();
    const cat = TAXONOMY[catUpper];

    if (!cat) {
      return { taskId: null, estimatedDuration: "30-60 min" };
    }

    let detectedTask = null;
    
    // Look through tasks defined in the selected category
    for (const [taskId, taskInfo] of Object.entries(cat.tasks)) {
      // Find keywords for this task in locales (en specifically)
      const taskKeywords = LOCALES.en.tasks?.[taskId] || [];
      for (const kw of taskKeywords) {
        if (combined.includes(kw.toLowerCase())) {
          detectedTask = taskId;
          break;
        }
      }
      if (detectedTask) break;
    }
    
    // Fallbacks based on explicit object checks if above missed
    if (!detectedTask) {
        if (entities.object === "tap" || combined.includes("tap") || combined.includes("குழாய்") || combined.includes("नल")) {
            if (catUpper === 'PLUMBING') detectedTask = "TAP_REPAIR";
        } else if (entities.object === "pipe" || combined.includes("pipe") || combined.includes("பைப்") || combined.includes("पाइप")) {
            if (catUpper === 'PLUMBING') detectedTask = "PIPE_LEAK";
        } else if (entities.object === "fan" || combined.includes("fan") || combined.includes("மின்விசிறி") || combined.includes("पंखा")) {
            if (catUpper === 'ELECTRICAL') detectedTask = "FAN_REPAIR";
        } else if (entities.object === "door" || combined.includes("door") || combined.includes("கதவு") || combined.includes("दरवाजा")) {
            if (catUpper === 'CARPENTRY') detectedTask = "DOOR_REPAIR";
        }
    }

    if (detectedTask) {
        return { taskId: detectedTask, estimatedDuration: cat.tasks[detectedTask]?.estimatedDuration || "45 min" };
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
