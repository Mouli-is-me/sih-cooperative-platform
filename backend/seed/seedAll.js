import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { isSupabaseConfigured, supabase } from "../config/supabase.js";
import { SEED_WORKERS } from "./seedWorkers.js";

dotenv.config();

export const seedDatabase = async () => {
  console.log("==================================================");
  console.log("CO-OP OS IDEMPOTENT PRODUCTION DATABASE SEEDING");
  console.log("==================================================");

  if (!isSupabaseConfigured()) {
    console.warn("[Seeding Notice] Supabase environment variables not configured. Skipping remote database seed.");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);

  // 1. Seed Core Test Users for Each Role
  const seedUsers = [
    {
      id: "usr-admin-01",
      full_name: "Meenakshi Sundaram",
      email: "admin@coopos.org",
      phone: "9876543210",
      password_hash: defaultPasswordHash,
      role: "platform_admin",
      profile_info: { designation: "Platform Operations Lead" },
      status: "ACTIVE",
    },
    {
      id: "usr-coopadmin-01",
      full_name: "Selvam R.",
      email: "coopadmin@maduraicoop.org",
      phone: "9876543211",
      password_hash: defaultPasswordHash,
      role: "cooperative_admin",
      profile_info: { cooperativeName: "Madurai District Labour Co-op Federation" },
      status: "ACTIVE",
    },
    {
      id: "usr-worker-01",
      full_name: "Kumar M.",
      email: "kumar@worker.coopos.org",
      phone: "9876543212",
      password_hash: defaultPasswordHash,
      role: "worker",
      profile_info: { trade: "Plumbing", experienceYears: 6 },
      status: "ACTIVE",
    },
    {
      id: "usr-customer-01",
      full_name: "Anand Sundaram",
      email: "anand@household.org",
      phone: "9876543213",
      password_hash: defaultPasswordHash,
      role: "customer",
      profile_info: { city: "Madurai", area: "K.K. Nagar" },
      status: "ACTIVE",
    },
  ];

  console.log("[Supabase Seeding] Seeding standard RBAC users...");
  for (const u of seedUsers) {
    const { error } = await supabase.from("users").upsert([u], { onConflict: "id" });
    if (error) console.warn(`[Seed Warning] User ${u.email}:`, error.message);
    else console.log(`[Seed Success] Upserted user: ${u.email} (${u.role})`);
  }

  // 2. Seed Cooperatives
  const seedCooperatives = [
    {
      id: "coop-mdu-01",
      name: "Madurai District Labour Co-op Federation",
      registration_number: "MDU-LAB-8941",
      description: "District-wide federation aggregating certified skilled trade workers across plumbing, electrical, and carpentry.",
      location: "Madurai Central, Tamil Nadu",
      contact_info: { phone: "0452-2541098", email: "contact@maduraicoop.org" },
      status: "VERIFIED",
    },
    {
      id: "coop-mdu-02",
      name: "Madurai Central Worker Co-op Society",
      registration_number: "MDU-LAB-7102",
      description: "Cooperative society for heavy maintenance and emergency utility response.",
      location: "Madurai South, Tamil Nadu",
      status: "VERIFIED",
    },
  ];

  console.log("[Supabase Seeding] Seeding cooperatives...");
  for (const c of seedCooperatives) {
    const { error } = await supabase.from("cooperatives").upsert([c], { onConflict: "id" });
    if (error) console.warn(`[Seed Warning] Cooperative ${c.name}:`, error.message);
    else console.log(`[Seed Success] Upserted cooperative: ${c.name}`);
  }

  // 3. Seed Workers
  console.log("[Supabase Seeding] Seeding workers...");
  for (const w of SEED_WORKERS) {
    const payload = {
      id: w.coopId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      user_id: w.name === "Kumar M." ? "usr-worker-01" : null,
      name: w.name,
      title: w.title,
      category: w.category,
      badge: w.badge,
      cooperative: w.cooperative,
      coop_id: w.coopId,
      avatar: w.avatar,
      rating: w.rating,
      jobs_completed: w.jobsCompleted,
      on_time_rate: w.onTimeRate,
      reliability_score: w.reliabilityScore,
      distance_km: 1.7,
      workload_capacity: w.workloadCapacity,
      workload_status: w.workloadStatus,
      availability: w.availability,
      is_available: w.isAvailable,
      status: w.status,
      skill_fit_percent: w.skillFitPercent,
      verified_skill_level: w.verifiedSkillLevel,
      experience_years: w.experienceYears,
      jobs_completed_7days: w.jobsCompleted7Days,
      jobs_completed_30days: w.jobsCompleted30Days,
      earnings_7days: w.earnings7Days,
      earnings_30days: w.earnings30Days,
      cohort_opportunity_share: w.cohortOpportunityShare,
      opportunity_equity_score: w.opportunityEquityScore,
      skills: w.skills,
      verifications: w.verifications,
      bio: w.bio,
    };

    const { error } = await supabase.from("workers").upsert([payload], { onConflict: "id" });
    if (error) console.warn(`[Seed Warning] Worker ${w.name}:`, error.message);
    else console.log(`[Seed Success] Upserted worker: ${w.name}`);
  }

  // 4. Seed Work Opportunities / Jobs
  const seedJobs = [
    {
      id: "job-seed-01",
      cooperative_id: "coop-mdu-01",
      created_by: "usr-coopadmin-01",
      title: "Commercial Plumbing Pipeline Maintenance",
      description: "Full overhaul of commercial water supply manifold and pressure check in Anna Nagar complex.",
      category: "plumbing",
      required_skills: ["Leak diagnosis", "Pressure testing", "Pipe fitting"],
      location: "Anna Nagar, Madurai",
      wage: 2500.00,
      status: "OPEN",
    },
    {
      id: "job-seed-02",
      cooperative_id: "coop-mdu-01",
      created_by: "usr-coopadmin-01",
      title: "Residential Electrical Distribution Box Upgrade",
      description: "3-Phase DB box installation and MCB replacement for residential apartment block.",
      category: "electrical",
      required_skills: ["DB Box Wiring", "MCB Installation", "Safety Inspection"],
      location: "K.K. Nagar, Madurai",
      wage: 1800.00,
      status: "OPEN",
    },
  ];

  console.log("[Supabase Seeding] Seeding open jobs...");
  for (const j of seedJobs) {
    const { error } = await supabase.from("jobs").upsert([j], { onConflict: "id" });
    if (error) console.warn(`[Seed Warning] Job ${j.title}:`, error.message);
    else console.log(`[Seed Success] Upserted job: ${j.title}`);
  }

  console.log("==================================================");
  console.log("DATABASE SEEDING COMPLETE SUCCESSFULLY");
  console.log("==================================================");
};

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
