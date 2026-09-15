export default {
  code: "en",
  name: "English",
  synonyms: {
    DRAINAGE: [
      "drain", "drainage", "clog", "blockage", "clogged", "sewer", "stagnation", "stagnant", "sink block"
    ],
    CONSTRUCTION: [
      "construction", "wall crack", "floor", "cement", "plaster", "roof", "building", "structural"
    ],
    PLUMBING: [
      "plumber", "pluming", "plumer", "plumbr", "tap", "leak", "pipe", "water",
      "sink", "toilet", "flush", "faucet", "washbasin", "dripping",
      "water tank", "sump", "shower", "geyser pipe"
    ],
    ELECTRICAL: [
      "electrician", "electrican", "electrical", "fan", "spark", "light", "switch",
      "wire", "wiring", "shock", "fuse", "power", "short circuit", "mcb",
      "plug", "socket", "regulator", "bulb", "tube light", "main board", "current", "charging point"
    ],
    CARPENTRY: [
      "carpenter", "carpentar", "wood", "door", "hinge", "table", "furniture",
      "lock", "cabinet", "shelf", "window frame", "woodwork", "almirah"
    ],
    PAINTING: [
      "painter", "paint", "painting", "wall", "moisture", "dampness", "whitewash",
      "waterproof", "emulsion", "primer", "color", "colour"
    ],
    CLEANING: [
      "cleaner", "clean", "cleaning", "dust", "sweep", "mop", "sanitize",
      "sanitisation", "deep clean", "wash", "scrub", "garbage"
    ],
    CAREGIVING: [
      "caregiver", "nurse", "care", "elderly", "patient", "senior", "assisted",
      "attendant", "old age", "geriatric", "post surgery"
    ],
    GARDENING: [
      "gardener", "garden", "plant", "lawn", "tree", "trim", "mow", "prune",
      "grass", "weed", "branch"
    ],
    DRIVING: [
      "driver", "drive", "car", "cab", "trip", "outstation", "commute", "chauffeur"
    ],
    TECHNICIAN: [
      "ac", "air conditioner", "fridge", "refrigerator", "washing machine",
      "pc", "computer", "laptop", "tv", "appliance", "technician"
    ]
  },
  tasks: {
    TAP_REPAIR: ["tap", "faucet", "drip", "tap leak", "washer", "kitchen tap", "bathroom tap"],
    PIPE_LEAK: ["pipe", "joint", "burst pipe", "pipe leak", "water line"],
    WATER_TANK: ["tank", "water tank", "sump", "motor", "pump"],
    TOILET_REPAIR: ["toilet", "flush", "commode", "flush tank"],
    DRAINAGE_CLEANING: ["drain", "drainage", "clog", "blockage", "clogged", "sewer"],
    FAN_REPAIR: ["fan", "ceiling fan", "regulator", "fan motor", "fan speed"],
    SWITCH_REPAIR: ["switch", "plug", "socket", "switchboard", "button"],
    WIRING: ["wire", "wiring", "short circuit", "spark", "fuse", "mcb", "shock"],
    LIGHT_REPAIR: ["light", "bulb", "tube light", "holder", "led"],
    DOOR_REPAIR: ["door", "hinge", "door lock", "latch", "door stuck"],
    FURNITURE_REPAIR: ["furniture", "chair", "table", "bed", "woodwork"],
    AC_SERVICE: ["ac", "air conditioner", "ac gas", "ac filter", "cooling"],
    WALL_CRACK: ["wall crack", "plaster", "crack"],
    ROOF_LEAK: ["roof leak", "ceiling leak"],
    FLOOR_LEVELING: ["floor level", "uneven floor", "cement work"],
    FITTING_REPAIR: ["door fit", "window fit"]
  },
  urgency: {
    HIGH: ["urgent", "immediately", "now", "emergency", "asap", "today", "straightaway", "quick", "fast"],
    STANDARD: ["tomorrow", "weekend", "later", "standard", "normal", "this week"]
  },
  time: {
    TODAY: ["today", "now", "this morning", "this evening", "tonight", "asap"],
    TOMORROW: ["tomorrow", "next day"],
    WEEKEND: ["weekend", "saturday", "sunday"]
  },
  places: {
    KITCHEN: ["kitchen", "cookhouse"],
    BATHROOM: ["bathroom", "restroom", "toilet", "washroom"],
    BEDROOM: ["bedroom", "room", "bed room"],
    HALL: ["hall", "living room", "balcony", "terrace", "roof"]
  }
};
