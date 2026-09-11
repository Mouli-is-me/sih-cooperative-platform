// Authoritative Trade-Specific Assessment Configurations & Scoring Rules for CO-OP OS
// Question Types: KNOWLEDGE, TOOLS, PROCEDURE, DIAGNOSIS, SAFETY, PRACTICAL

export const CATEGORY_WEIGHTS = {
  knowledge: 0.20,
  tools: 0.15,
  procedure: 0.20,
  diagnosis: 0.20,
  safety: 0.15,
  practical: 0.10
};

export const PASS_THRESHOLD = 70;

export const ASSESSMENTS = {
  plumbing: {
    category: "plumbing",
    title: "Plumbing & Sanitary Systems Certification",
    version: "2.0",
    questions: [
      {
        id: "p1",
        type: "KNOWLEDGE",
        title: "KNOWLEDGE ASSESSMENT",
        text: "What is the standard minimum slope ratio for domestic horizontal drain lines to ensure proper gravity flow?",
        options: [
          "1/16 inch per foot",
          "1/4 inch per foot (approx 2%)",
          "1 inch per foot",
          "No slope required if pipe diameter is > 3 inches"
        ],
        correctIndex: 1,
        weight: 20
      },
      {
        id: "p2",
        type: "TOOLS",
        title: "TOOL IDENTIFICATION",
        text: "Which specialized plumbing tool is used to tighten basin nuts in tight spaces behind sink bowls?",
        options: [
          "Pipe Wrench",
          "Basin Wrench (Sink Wrench)",
          "Adjustable Spanner",
          "Plumber Tape"
        ],
        correctIndex: 1,
        weight: 15
      },
      {
        id: "p3",
        type: "PROCEDURE",
        title: "PROCEDURE ORDERING",
        text: "Select the correct sequence for replacing a leaking kitchen tap cartridge:",
        options: [
          "1. Shut main water valve -> 2. Remove tap handle -> 3. Unscrew cartridge retaining nut -> 4. Replace cartridge & seal -> 5. Reassemble & test",
          "1. Unscrew cartridge -> 2. Shut main valve -> 3. Replace seals -> 4. Test water pressure",
          "1. Turn on water -> 2. Apply Teflon tape -> 3. Tighten handle -> 4. Shut valve",
          "1. Apply silicone sealant -> 2. Replace cartridge -> 3. Turn on water"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: "p4",
        type: "DIAGNOSIS",
        title: "FAULT DIAGNOSIS",
        text: "A customer reports loud banging noises ('water hammer') in pipes when taps are shut off quickly. What is the root cause?",
        options: [
          "Leaking washer in faucet",
          "Sudden shockwave caused by fast-closing valve in system without air chambers / arrestors",
          "Low water supply pressure from municipal tank",
          "Air trapped in drain trap"
        ],
        correctIndex: 1,
        weight: 20
      },
      {
        id: "p5",
        type: "SAFETY",
        title: "SAFETY ASSESSMENT",
        text: "What precaution must be taken before working on CPVC water pipes using solvent cement?",
        options: [
          "Use in a well-ventilated area and avoid open flames or sparks",
          "Apply cement on wet pipes for better adhesion",
          "Heat pipes with blowtorch first",
          "No safety precautions required"
        ],
        correctIndex: 0,
        weight: 15
      },
      {
        id: "p6",
        type: "PRACTICAL",
        title: "PRACTICAL SCENARIO",
        text: "You arrive at a home with an active ceiling leak coming from the upstairs bathroom pipe joint. What is your immediate field action?",
        options: [
          "Immediately locate and isolate the bathroom sub-stop valve or main water meter valve, then drain lines before inspecting joint seal",
          "Start replacing drywall underneath first",
          "Apply putty directly while water is leaking under pressure",
          "Wait 2 hours for leak to stop naturally"
        ],
        correctIndex: 0,
        weight: 10
      }
    ]
  },
  electrical: {
    category: "electrical",
    title: "Electrical & Wireman Systems Certification",
    version: "2.0",
    questions: [
      {
        id: "e1",
        type: "SAFETY",
        title: "SAFETY ASSESSMENT",
        text: "What is the mandatory first safety rule before touching internal switchboard wiring or replacing MCBs?",
        options: [
          "Wear rubber gloves and start unscrewing live wire",
          "Isolate main supply breaker (LOTO / Lockout-Tagout) and verify zero voltage using a calibrated multimeter / voltage tester",
          "Spray water on board to clean dust",
          "Use uninsulated screwdriver carefully"
        ],
        correctIndex: 1,
        weight: 15
      },
      {
        id: "e2",
        type: "KNOWLEDGE",
        title: "KNOWLEDGE ASSESSMENT",
        text: "What standard wire gauge color convention is mandated for Protective Earth (Grounding) in Indian electrical installations?",
        options: [
          "Red or Brown",
          "Black or Blue",
          "Green or Green with Yellow Stripe",
          "Yellow only"
        ],
        correctIndex: 2,
        weight: 20
      },
      {
        id: "e3",
        type: "TOOLS",
        title: "TOOL IDENTIFICATION",
        text: "Which instrument is specifically designed to measure insulation resistance of electrical cables and motor windings?",
        options: [
          "Wattmeter",
          "Megohmmeter (Megger)",
          "Voltage Tester Pen",
          "Wire Stripper"
        ],
        correctIndex: 1,
        weight: 15
      },
      {
        id: "e4",
        type: "PROCEDURE",
        title: "PROCEDURE ORDERING",
        text: "What is the proper procedure for installing a ceiling fan regulator switch?",
        options: [
          "1. Turn off main MCB -> 2. Connect regulator in series with fan live wire -> 3. Insulate joints with wire nuts / heat shrink -> 4. Mount in board & restore power",
          "1. Connect regulator in parallel across Live and Neutral -> 2. Turn on MCB",
          "1. Connect regulator to Ground wire -> 2. Turn on switch",
          "1. Join Live and Neutral directly -> 2. Screw regulator"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: "e5",
        type: "DIAGNOSIS",
        title: "FAULT DIAGNOSIS",
        text: "An RCCB (Residual Current Circuit Breaker) trips continuously as soon as any heavy appliance is turned on. What does this indicate?",
        options: [
          "Voltage supply is too high",
          "Current leakage to earth / neutral-earth fault in appliance circuit",
          "Light bulb filament burnt",
          "Regulator knob is loose"
        ],
        correctIndex: 1,
        weight: 20
      },
      {
        id: "e6",
        type: "PRACTICAL",
        title: "PRACTICAL SCENARIO",
        text: "A customer smells burning plastic near their main distribution board during peak AC load. What is your immediate diagnostic step?",
        options: [
          "Turn off main breaker, check for loose terminal screws causing high contact resistance and heat buildup",
          "Increase MCB rating from 16A to 63A",
          "Pour cold water on switchboard",
          "Tell customer it is normal during summer"
        ],
        correctIndex: 0,
        weight: 10
      }
    ]
  },
  carpentry: {
    category: "carpentry",
    title: "Carpentry & Joinery Certification",
    version: "2.0",
    questions: [
      {
        id: "c1",
        type: "KNOWLEDGE",
        title: "KNOWLEDGE ASSESSMENT",
        text: "Which wood joint offers high resistance to being pulled apart in tension due to interlocking pins and tails?",
        options: [
          "Butt Joint",
          "Dovetail Joint",
          "Lap Joint",
          "Mitre Joint"
        ],
        correctIndex: 1,
        weight: 20
      },
      {
        id: "c2",
        type: "TOOLS",
        title: "TOOL IDENTIFICATION",
        text: "Which measuring tool is essential for checking 90-degree squareness of wooden frames and cut edges?",
        options: [
          "Try Square / Combination Square",
          "Chisel",
          "Block Plane",
          "Spirit Level"
        ],
        correctIndex: 0,
        weight: 15
      },
      {
        id: "c3",
        type: "PROCEDURE",
        title: "PROCEDURE ORDERING",
        text: "What is the correct order of steps for hanging a new solid flush door frame?",
        options: [
          "1. Plumb & level frame with shims -> 2. Fasten frame anchors -> 3. Chisel hinge recesses -> 4. Hang door leaf & check latch alignment",
          "1. Hang door -> 2. Paint frame -> 3. Fasten anchors",
          "1. Cut door leaf -> 2. Screw hinges to plaster -> 3. Level later",
          "1. Glue frame -> 2. Lock door immediately"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: "c4",
        type: "DIAGNOSIS",
        title: "FAULT DIAGNOSIS",
        text: "A wooden door drags against the floor tile at the outer bottom corner. What is the cause?",
        options: [
          "Top hinge is loose or pulling away from the frame jam",
          "Door handle is too heavy",
          "Bottom hinge screws are too tight",
          "Paint layer is too thick on top edge"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: "c5",
        type: "SAFETY",
        title: "SAFETY ASSESSMENT",
        text: "When operating a portable circular saw, what key safety equipment and practice are required?",
        options: [
          "Safety goggles, dust mask, secure workpiece with clamps, and ensure blade guard operates freely",
          "Hold wood by hand close to blade without guard",
          "Wear loose long sleeves and gloves near spinning blade",
          "No eye protection required"
        ],
        correctIndex: 0,
        weight: 15
      },
      {
        id: "c6",
        type: "PRACTICAL",
        title: "PRACTICAL SCENARIO",
        text: "A wooden cabinet door hinge hole in MDF wood is stripped and screws spin freely. How do you repair it durably?",
        options: [
          "Drill out stripped hole, insert glued hardwood dowel plug, let dry, trim flush, and pre-drill new pilot hole for screw",
          "Use oversized tape around screw",
          "Hammer a bigger nail through hinge",
          "Melt plastic into hole"
        ],
        correctIndex: 0,
        weight: 10
      }
    ]
  }
};

// Generic fallback template for remaining trades (Painting, Cleaning, Caregiving, Driving, Gardening, Technician)
export const getAssessmentForCategory = (category = "") => {
  const normalized = category.toLowerCase();
  if (ASSESSMENTS[normalized]) {
    return ASSESSMENTS[normalized];
  }

  // Generate trade-specific baseline structure dynamically for other valid categories
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    category: normalized,
    title: `${capitalized} Trade Competency Assessment`,
    version: "2.0",
    questions: [
      {
        id: `${normalized}-q1`,
        type: "KNOWLEDGE",
        title: "KNOWLEDGE ASSESSMENT",
        text: `What primary industry standard protocol applies to professional ${capitalized} execution?`,
        options: [
          `Adherence to verified trade safety guidelines and quality standards`,
          "Skipping pre-work inspection",
          "Using uncalibrated tools",
          "Ignoring customer specifications"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: `${normalized}-q2`,
        type: "TOOLS",
        title: "TOOL IDENTIFICATION",
        text: `Which essential equipment is required for safe ${capitalized} service delivery?`,
        options: [
          "Standard certified trade toolkit and personal protective gear",
          "Uninsulated temporary tools",
          "Damaged cables",
          "No equipment required"
        ],
        correctIndex: 0,
        weight: 15
      },
      {
        id: `${normalized}-q3`,
        type: "PROCEDURE",
        title: "PROCEDURE ORDERING",
        text: `What is the correct sequence of work for a standard ${capitalized} task?`,
        options: [
          "1. Inspect site -> 2. Prepare tools & safety area -> 3. Execute task -> 4. Inspect quality & clean area",
          "1. Execute task -> 2. Inspect site later",
          "1. Clean area -> 2. Start without prep",
          "1. Hand invoice -> 2. Start work"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: `${normalized}-q4`,
        type: "DIAGNOSIS",
        title: "FAULT DIAGNOSIS",
        text: `How should an unexpected technical obstacle during ${capitalized} work be handled?`,
        options: [
          "Diagnose root cause, inform customer of necessary adjustments, and execute correct fix",
          "Cover up the defect with paint or tape",
          "Leave site without notice",
          "Force assembly illegally"
        ],
        correctIndex: 0,
        weight: 20
      },
      {
        id: `${normalized}-q5`,
        type: "SAFETY",
        title: "SAFETY ASSESSMENT",
        text: `What personal protective equipment (PPE) is mandatory for ${capitalized} tasks?`,
        options: [
          "Appropriate protective gloves, eye protection, and safety footwear",
          "Bare hands and open sandals",
          "Loose clothing around machinery",
          "No PPE necessary"
        ],
        correctIndex: 0,
        weight: 15
      },
      {
        id: `${normalized}-q6`,
        type: "PRACTICAL",
        title: "PRACTICAL SCENARIO",
        text: `What is the professional protocol when completing a ${capitalized} assignment?`,
        options: [
          "Perform full operational test with customer, verify satisfaction, and update Skill Passport log",
          "Leave tools behind",
          "Demand cash before showing work",
          "Skip operational testing"
        ],
        correctIndex: 0,
        weight: 10
      }
    ]
  };
};
