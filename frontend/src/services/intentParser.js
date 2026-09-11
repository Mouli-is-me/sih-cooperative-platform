// Universal Service Intent Parser 2.0 (Delegates to Universal Intent Engine)

import { intentAdapter } from "./intentEngine/intentAdapter.js";

export const parseServiceIntent = (rawText, previousContext = null) => {
  // Sync wrapper around intentAdapter
  return intentAdapter.primaryEngine.parse(rawText, previousContext);
};

export const parseServiceIntentAsync = async (rawText, previousContext = null) => {
  return await intentAdapter.parseIntent(rawText, previousContext);
};
