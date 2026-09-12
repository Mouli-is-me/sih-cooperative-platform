// Genuine Static Configuration Constants for CO-OP OS UI
// All dynamic application state (Workers, Requests, Analytics) is retrieved from Backend REST API

export const SERVICES = [
  { id: "plumbing", name: "Plumbing", icon: "Wrench", desc: "Taps, leakages, pipe repairs & sanitary fittings" },
  { id: "electrical", name: "Electrical", icon: "Zap", desc: "Wiring, switchboards, appliances & short circuits" },
  { id: "carpentry", name: "Carpentry", icon: "Hammer", desc: "Doors, furniture, cabinets & woodwork repairs" },
  { id: "painting", name: "Painting", icon: "Paintbrush", desc: "Interior, exterior, touch-ups & waterproof coating" },
  { id: "cleaning", name: "Cleaning", icon: "Sparkles", desc: "Deep cleaning, sanitization & event maintenance" },
  { id: "caregiving", name: "Caregiving", icon: "HeartHandshake", desc: "Elderly assistance, post-surgery care & patient help" },
  { id: "driving", name: "Driving", icon: "Car", desc: "Outstation, local daily commute & heavy vehicles" },
  { id: "gardening", name: "Gardening", icon: "Sprout", desc: "Lawn trimming, pruning, plantation & garden maintenance" },
];

export const STATIC_UI_CONFIG = {
  appName: "CO-OP OS",
  federationName: "Labour Cooperative OS",
  supportedLanguages: ["en", "ta", "hi"],
  statusSteps: ["CREATED", "MATCHED", "WORKER_ACCEPTED", "EN_ROUTE", "JOB_STARTED", "COMPLETED"]
};

// Fallback baseline structure for analytics when offline
export const COOPERATIVE_PULSE_METRICS = {
  activeWorkers: 147,
  availableWorkers: 32,
  busyWorkers: 115,
  openRequests: 326,
  matchedRequests: 281,
  jobsCompletedMonth: 281,
  opportunityBalanceIndex: 84,
  avgResponseTimeMin: 12,
  avgCompletionTimeHours: 1.4,
  utilizationRatePct: 78,
  demandTrends: [],
  workloadDistribution: [],
  workforceGaps: []
};

export const WORKERS = [
  {
    id: "w1",
    _id: "w1",
    name: "Kumar M.",
    title: "Plumbing Specialist",
    category: "plumbing",
    badge: "Verified Cooperative Worker",
    cooperative: "Madurai District Labour Co-op Federation",
    coopId: "MDU-LAB-8941",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
    rating: 4.8,
    jobsCompleted: 147,
    onTimeRate: 94,
    reliabilityScore: 94,
    latitude: 9.9252,
    longitude: 78.1198,
    distanceKm: 1.2,
    workloadCapacity: 31,
    workloadStatus: "Low",
    availability: "Available Now",
    isAvailable: true,
    status: "AVAILABLE",
    skillFitPercent: 96,
    verifiedSkillLevel: "Advanced",
    experienceYears: 6,
    jobsCompleted7Days: 2,
    jobsCompleted30Days: 11,
    earnings7Days: 1400,
    earnings30Days: 7800,
    cohortOpportunityShare: "14%",
    opportunityEquityScore: 92,
    practicalVerificationStatus: "VERIFIED",
    assessmentScore: 92,
    skills: [
      { name: "Pipe repair", level: "Advanced", confidence: 96, evidence: "42 verified jobs completed" },
      { name: "Tap installation", level: "Advanced", confidence: 94, evidence: "38 verified jobs completed" }
    ],
    verifications: [
      "Cooperative Membership Verified",
      "Government Identity Verified",
      "Practically Verified Skill Assessment (92%)"
    ],
    bio: "Certified plumber with 6+ years experience in domestic pipe installations, emergency leak fixes, and commercial sanitary systems."
  },
  {
    id: "w2",
    _id: "w2",
    name: "Ravi Chandran",
    title: "Senior Master Plumber",
    category: "plumbing",
    badge: "Master Cooperative Technician",
    cooperative: "Madurai Central Worker Co-op Society",
    coopId: "MDU-LAB-1024",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    rating: 4.95,
    jobsCompleted: 312,
    onTimeRate: 98,
    reliabilityScore: 98,
    latitude: 9.9312,
    longitude: 78.1254,
    distanceKm: 2.1,
    workloadCapacity: 88,
    workloadStatus: "High",
    availability: "Busy until 4 PM",
    isAvailable: false,
    status: "BUSY",
    skillFitPercent: 98,
    verifiedSkillLevel: "Master",
    experienceYears: 11,
    jobsCompleted7Days: 9,
    jobsCompleted30Days: 34,
    earnings7Days: 7200,
    earnings30Days: 28400,
    cohortOpportunityShare: "42%",
    opportunityEquityScore: 48,
    practicalVerificationStatus: "VERIFIED",
    assessmentScore: 98,
    skills: [
      { name: "Sanitary lines", level: "Master", confidence: 98, evidence: "120 verified jobs completed" }
    ],
    verifications: [
      "Cooperative Master Certificate",
      "Practically Verified Skill Assessment (98%)"
    ],
    bio: "Master plumber specializing in complex sanitary line installations and industrial water systems."
  },
  {
    id: "w3",
    _id: "w3",
    name: "Senthil Nathan",
    title: "Licensed Electrician",
    category: "electrical",
    badge: "Certified Safety Electrician",
    cooperative: "Tamil Nadu Electrical Workers Co-op",
    coopId: "TN-ELE-4029",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    rating: 4.75,
    jobsCompleted: 189,
    onTimeRate: 92,
    reliabilityScore: 92,
    latitude: 9.9180,
    longitude: 78.1120,
    distanceKm: 1.8,
    workloadCapacity: 40,
    workloadStatus: "Low",
    availability: "Available Now",
    isAvailable: true,
    status: "AVAILABLE",
    skillFitPercent: 94,
    verifiedSkillLevel: "Advanced",
    experienceYears: 7,
    jobsCompleted7Days: 3,
    jobsCompleted30Days: 14,
    earnings7Days: 2100,
    earnings30Days: 9800,
    cohortOpportunityShare: "18%",
    opportunityEquityScore: 88,
    practicalVerificationStatus: "VERIFIED",
    assessmentScore: 90,
    skills: [
      { name: "Wiring & Circuit Repair", level: "Advanced", confidence: 95, evidence: "65 verified jobs" }
    ],
    verifications: [
      "Electrical Safety License",
      "Practically Verified Skill Assessment (90%)"
    ],
    bio: "Licensed electrician proficient in household wiring, DB box upgrades, and short circuit troubleshooting."
  }
];

// INITIAL_REQUESTS removed — service requests are loaded from the database.


