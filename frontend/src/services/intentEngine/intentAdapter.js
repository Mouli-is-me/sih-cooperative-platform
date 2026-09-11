// Intent Engine Adapter Architecture for CO-OP OS
// Primary: LocalIntentEngine (Zero Network Latency / Offline-First)
// Optional: LLMIntentEngine (Future External AI Provider Plugin)

import { LocalIntentEngine } from "./localIntentEngine.js";
import { mergeIntentContext } from "./contextEngine.js";

class IntentEngineAdapter {
  constructor() {
    this.primaryEngine = new LocalIntentEngine();
    this.externalEngine = null; // Can be assigned via setExternalEngine()
  }

  setExternalEngine(engineInstance) {
    this.externalEngine = engineInstance;
  }

  async parseIntent(rawText, previousContext = null) {
    let result = null;

    if (this.externalEngine && typeof this.externalEngine.parse === "function") {
      try {
        result = await this.externalEngine.parse(rawText);
      } catch (err) {
        // Fallback to local engine on error/timeout
        result = this.primaryEngine.parse(rawText);
      }
    } else {
      result = this.primaryEngine.parse(rawText);
    }

    if (previousContext) {
      result = mergeIntentContext(previousContext, result);
    }

    return result;
  }
}

export const intentAdapter = new IntentEngineAdapter();
