// Layer 4: Entity Extractor (Object, Problem, Place, Time, Urgency)

import enLocale from "./locales/en.js";
import taLocale from "./locales/ta.js";
import hiLocale from "./locales/hi.js";

const LOCALES = { en: enLocale, ta: taLocale, hi: hiLocale };

export const extractEntities = (rawText = "", normalizedText = "") => {
  const text = `${rawText} ${normalizedText}`.toLowerCase();

  let object = null;
  let problem = null;
  let place = null;
  let time = null;
  let urgency = "STANDARD";

  // Object extraction
  if (text.includes("tap") || text.includes("குழாய்") || text.includes("नल")) object = "tap";
  else if (text.includes("pipe") || text.includes("பைப்") || text.includes("पाइप")) object = "pipe";
  else if (text.includes("fan") || text.includes("மின்விசிறி") || text.includes("पंखा")) object = "fan";
  else if (text.includes("switch") || text.includes("ஸ்விட்ச்") || text.includes("स्विच")) object = "switchboard";
  else if (text.includes("door") || text.includes("கதவு") || text.includes("दरवाजा")) object = "door";
  else if (text.includes("wall") || text.includes("சுவர்") || text.includes("दीवार")) object = "wall";
  else if (text.includes("ac") || text.includes("ஏசி") || text.includes("एसी")) object = "ac";

  // Problem extraction
  if (text.includes("leak") || text.includes("கசிகிறது") || text.includes("रिसाव") || text.includes("aaguthu")) problem = "leak";
  else if (text.includes("spark") || text.includes("short circuit") || text.includes("ஸ்பார்க்")) problem = "sparking / short circuit";
  else if (text.includes("not working") || text.includes("suthala") || text.includes("work aagala") || text.includes("nahi chal raha")) problem = "not working";
  else if (text.includes("stuck") || text.includes("broken") || text.includes("கீல்")) problem = "stuck / broken";

  // Place extraction
  if (text.includes("kitchen") || text.includes("சமையலறை") || text.includes("கிச்சன்") || text.includes("रसोई")) place = "kitchen";
  else if (text.includes("bathroom") || text.includes("குளியலறை") || text.includes("பாத்ரூம்") || text.includes("बाथरूम")) place = "bathroom";
  else if (text.includes("bedroom") || text.includes("அறை") || text.includes("कमरा")) place = "bedroom";
  else if (text.includes("hall") || text.includes("ஹால்") || text.includes("हॉल")) place = "hall";

  // Time extraction
  if (text.includes("today") || text.includes("inniku") || text.includes("innike") || text.includes("aaj") || text.includes("இன்றே") || text.includes("आज") || text.includes("now") || text.includes("kalaiyila") || text.includes("subah se")) {
    time = "TODAY";
  } else if (text.includes("tomorrow") || text.includes("naalai") || text.includes("kal") || text.includes("நாளை")) {
    time = "TOMORROW";
  } else if (text.includes("weekend")) {
    time = "WEEKEND";
  }

  // Urgency extraction
  if (
    text.includes("urgent") ||
    text.includes("immediately") ||
    text.includes("emergency") ||
    text.includes("asap") ||
    text.includes("today") ||
    text.includes("innike") ||
    text.includes("aaj hi") ||
    text.includes("உடனடியாக") ||
    text.includes("तुरंत")
  ) {
    urgency = "HIGH";
  }

  return {
    object,
    problem,
    place,
    time,
    urgency
  };
};
