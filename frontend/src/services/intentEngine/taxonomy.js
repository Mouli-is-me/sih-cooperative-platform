// Language-Agnostic Canonical Service Taxonomy for CO-OP OS

export const TAXONOMY = {
  PLUMBING: {
    id: "PLUMBING",
    categoryKey: "plumbing",
    displayNames: {
      en: "Plumbing",
      ta: "குழாய் வேலை (Plumbing)",
      hi: "प्लंबिंग (Plumbing)"
    },
    tasks: {
      TAP_REPAIR: {
        id: "TAP_REPAIR",
        displayNames: { en: "Tap Leak & Repair", ta: "குழாய் கசிவு & பழுது", hi: "नल की मरम्मत" },
        estimatedDuration: "30–60 min"
      },
      PIPE_LEAK: {
        id: "PIPE_LEAK",
        displayNames: { en: "Pipe Joint & Leak Repair", ta: "பைப் இனைப்பு கசிவு", hi: "पाइप रिसाव मरम्मत" },
        estimatedDuration: "45–90 min"
      },
      DRAINAGE: {
        id: "DRAINAGE",
        displayNames: { en: "Drainage Blockage Clearing", ta: "சாக்கடை அடைப்பு நீக்கம்", hi: "नाली की सफाई" },
        estimatedDuration: "60 min"
      },
      WATER_TANK: {
        id: "WATER_TANK",
        displayNames: { en: "Water Tank & Pump Service", ta: "தண்ணீர் தொட்டி & பம்ப் சேவை", hi: "वाटर टैंक और पंप मरम्मत" },
        estimatedDuration: "1–2 hours"
      },
      TOILET_REPAIR: {
        id: "TOILET_REPAIR",
        displayNames: { en: "Toilet & Flush Repair", ta: "கழிப்பறை & பிளஷ் பழுது", hi: "टॉयलेट और फ्लश मरम्मत" },
        estimatedDuration: "45–60 min"
      }
    }
  },

  ELECTRICAL: {
    id: "ELECTRICAL",
    categoryKey: "electrical",
    displayNames: {
      en: "Electrical",
      ta: "மின்சார வேலை (Electrical)",
      hi: "इलेक्ट्रिकल (Electrical)"
    },
    tasks: {
      FAN_REPAIR: {
        id: "FAN_REPAIR",
        displayNames: { en: "Ceiling Fan & Regulator Fix", ta: "மின்விசிறி & ரெகுலேட்டர் பழுது", hi: "पंखा और रेगुलेटर मरम्मत" },
        estimatedDuration: "45–60 min"
      },
      SWITCH_REPAIR: {
        id: "SWITCH_REPAIR",
        displayNames: { en: "Switchboard & Plug Replacement", ta: "ஸ்விட்ச்போர்டு & பிளக் பழுது", hi: "स्विचबोर्ड मरम्मत" },
        estimatedDuration: "30–45 min"
      },
      WIRING: {
        id: "WIRING",
        displayNames: { en: "Wiring & Short Circuit Troubleshooting", ta: "ஒயரிங் & ஷார்ட் சர்க்யூட் சரிசெய்தல்", hi: "वायरिंग और शॉर्ट सर्किट मरम्मत" },
        estimatedDuration: "60–120 min"
      },
      LIGHT_REPAIR: {
        id: "LIGHT_REPAIR",
        displayNames: { en: "Lighting & Tube Fitting", ta: "லைட்டிங் & டியூப் ஃபிட்டிங்", hi: "लाइटिंग और ट्यूब मरम्मत" },
        estimatedDuration: "30 min"
      },
      APPLIANCE_INSTALLATION: {
        id: "APPLIANCE_INSTALLATION",
        displayNames: { en: "Electrical Appliance Setup", ta: "மின் சாதனங்கள் பொருத்துதல்", hi: "उपकरण स्थापना" },
        estimatedDuration: "45–90 min"
      }
    }
  },

  CARPENTRY: {
    id: "CARPENTRY",
    categoryKey: "carpentry",
    displayNames: {
      en: "Carpentry",
      ta: "தச்சர் வேலை (Carpentry)",
      hi: "बढ़ईगीरी (Carpentry)"
    },
    tasks: {
      DOOR_REPAIR: {
        id: "DOOR_REPAIR",
        displayNames: { en: "Door Hinge & Frame Alignment", ta: "கதவு கீல் & பூட்டு பழுது", hi: "दरवाजे की मरम्मत" },
        estimatedDuration: "60 min"
      },
      FURNITURE_REPAIR: {
        id: "FURNITURE_REPAIR",
        displayNames: { en: "Furniture & Table Restoration", ta: "மர சாமான்கள் பழுது", hi: "फर्नीचर मरम्मत" },
        estimatedDuration: "1–2 hours"
      },
      LOCK_REPAIR: {
        id: "LOCK_REPAIR",
        displayNames: { en: "Door Lock & Handle Fitting", ta: "கதவு பூட்டு பொருத்துதல்", hi: "ताला मरम्मत" },
        estimatedDuration: "45 min"
      }
    }
  },

  PAINTING: {
    id: "PAINTING",
    categoryKey: "painting",
    displayNames: {
      en: "Painting",
      ta: "பெயிண்டிங் (Painting)",
      hi: "पेंटिंग (Painting)"
    },
    tasks: {
      HOUSE_PAINTING: {
        id: "HOUSE_PAINTING",
        displayNames: { en: "Full House Painting", ta: "முழு வீட்டின் பெயிண்டிங்", hi: "पूरे घर की पेंटिंग" },
        estimatedDuration: "Full Day"
      },
      ROOM_PAINTING: {
        id: "ROOM_PAINTING",
        displayNames: { en: "Single Room / Touch-up Painting", ta: "அறை வண்ணப்பூச்சு", hi: "कमरे की पेंटिंग" },
        estimatedDuration: "3–6 hours"
      },
      WALL_REPAIR: {
        id: "WALL_REPAIR",
        displayNames: { en: "Wall Dampness & Crack Treatment", ta: "சுவர் ஈரப்பதம் & விரிசல் சரிசெய்தல்", hi: "दीवार दरार मरम्मत" },
        estimatedDuration: "2–4 hours"
      }
    }
  },

  CLEANING: {
    id: "CLEANING",
    categoryKey: "cleaning",
    displayNames: {
      en: "Cleaning",
      ta: "சுத்தம் செய்தல் (Cleaning)",
      hi: "सफाई (Cleaning)"
    },
    tasks: {
      HOUSE_CLEANING: {
        id: "HOUSE_CLEANING",
        displayNames: { en: "General House Cleaning", ta: "வீடு சுத்தம் செய்தல்", hi: "सामान्य घर की सफाई" },
        estimatedDuration: "2–3 hours"
      },
      DEEP_CLEANING: {
        id: "DEEP_CLEANING",
        displayNames: { en: "Deep Sanitization & Kitchen Cleaning", ta: "ஆழமான சுத்தம் & சமையலறை சுத்தம்", hi: "डीप क्लीनिंग" },
        estimatedDuration: "3–5 hours"
      },
      OFFICE_CLEANING: {
        id: "OFFICE_CLEANING",
        displayNames: { en: "Office / Commercial Sanitation", ta: "அலுவலகம் சுத்தம் செய்தல்", hi: "कार्यालय सफाई" },
        estimatedDuration: "Half Day"
      }
    }
  },

  CAREGIVING: {
    id: "CAREGIVING",
    categoryKey: "caregiving",
    displayNames: {
      en: "Caregiving",
      ta: "முதியோர் பராமரிப்பு (Caregiving)",
      hi: "देखभाल (Caregiving)"
    },
    tasks: {
      ELDERLY_ASSISTANCE: {
        id: "ELDERLY_ASSISTANCE",
        displayNames: { en: "Elderly Care & Mobility Support", ta: "முதியோர் உதவி & இயக்கம்", hi: "बुजुर्गों की सहायता" },
        estimatedDuration: "Half Day / Full Day"
      },
      PATIENT_ASSISTANCE: {
        id: "PATIENT_ASSISTANCE",
        displayNames: { en: "Post-Surgery Patient Assistance", ta: "நோயாளி பராமரிப்பு", hi: "मरीजों की देखभाल" },
        estimatedDuration: "Full Day"
      },
      HOME_CARE: {
        id: "HOME_CARE",
        displayNames: { en: "General Assisted Living Care", ta: "பொது வீட்டுப் பராமரிப்பு", hi: "गृह देखभाल" },
        estimatedDuration: "4–8 hours"
      }
    }
  },

  GARDENING: {
    id: "GARDENING",
    categoryKey: "gardening",
    displayNames: {
      en: "Gardening",
      ta: "தோட்டப்பராமரிப்பு (Gardening)",
      hi: "बागवानी (Gardening)"
    },
    tasks: {
      GARDEN_MAINTENANCE: {
        id: "GARDEN_MAINTENANCE",
        displayNames: { en: "Lawn Trimming & Plant Care", ta: "புல்வெளி மற்றும் செடிகள் பராமரிப்பு", hi: "बगीचे की सफाई" },
        estimatedDuration: "1–2 hours"
      },
      TREE_TRIMMING: {
        id: "TREE_TRIMMING",
        displayNames: { en: "Tree Branch Pruning & Cutting", ta: "மரக்கிளை வெட்டுதல்", hi: "पेड़ की कटाई" },
        estimatedDuration: "2–3 hours"
      }
    }
  },

  DRIVING: {
    id: "DRIVING",
    categoryKey: "driving",
    displayNames: {
      en: "Driving",
      ta: "ஓட்டுநர் சேவை (Driving)",
      hi: "ड्राइविंग (Driving)"
    },
    tasks: {
      LOCAL_DRIVER: {
        id: "LOCAL_DRIVER",
        displayNames: { en: "On-demand City Driver", ta: "நகர ஓட்டுநர்", hi: "स्थानीय चालक" },
        estimatedDuration: "2–4 hours"
      },
      DELIVERY_DRIVER: {
        id: "DELIVERY_DRIVER",
        displayNames: { en: "Outstation / Trip Driving", ta: "வெளியூர் ஓட்டுநர்", hi: "आउटस्टेशन ड्राइवर" },
        estimatedDuration: "Full Day"
      }
    }
  },

  TECHNICIAN: {
    id: "TECHNICIAN",
    categoryKey: "technician",
    displayNames: {
      en: "Appliance Technician",
      ta: "சாதன தொழில்நுட்ப வல்லுநர்",
      hi: "तकनीशियन (Technician)"
    },
    tasks: {
      AC_SERVICE: {
        id: "AC_SERVICE",
        displayNames: { en: "AC Repair & Filter Gas Cleaning", ta: "ஏசி பழுது & காஸ் கிளீனிங்", hi: "एसी सर्विस और रिपेयर" },
        estimatedDuration: "60–90 min"
      },
      APPLIANCE_REPAIR: {
        id: "APPLIANCE_REPAIR",
        displayNames: { en: "Washing Machine / Fridge Repair", ta: "வாஷிங் மெஷின் / பிரிட்ஜ் பழுது", hi: "वाशिंग मशीन / फ्रिज मरम्मत" },
        estimatedDuration: "60–90 min"
      },
      COMPUTER_REPAIR: {
        id: "COMPUTER_REPAIR",
        displayNames: { en: "PC & Network Troubleshooting", ta: "கணினி & நெட்வொர்க் பழுது", hi: "कंप्यूटर मरम्मत" },
        estimatedDuration: "45–60 min"
      }
    }
  }
};

export const getLocalizedCategoryName = (categoryKey, lang = "en") => {
  const catKeyUpper = (categoryKey || "").toUpperCase();
  const cat = TAXONOMY[catKeyUpper];
  if (cat && cat.displayNames) {
    return cat.displayNames[lang] || cat.displayNames.en;
  }
  return categoryKey;
};

export const getLocalizedTaskName = (categoryKey, taskId, lang = "en") => {
  const catKeyUpper = (categoryKey || "").toUpperCase();
  const cat = TAXONOMY[catKeyUpper];
  if (cat && cat.tasks && cat.tasks[taskId]) {
    return cat.tasks[taskId].displayNames[lang] || cat.tasks[taskId].displayNames.en;
  }
  return taskId ? taskId.replace(/_/g, " ") : "General Repair";
};
