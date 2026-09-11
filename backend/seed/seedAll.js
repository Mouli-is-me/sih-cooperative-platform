import mongoose from "mongoose";
import dotenv from "dotenv";
import Worker from "../models/Worker.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { SEED_WORKERS } from "./seedWorkers.js";
import { isSupabaseConfigured, supabase } from "../config/supabase.js";

dotenv.config();

export const seedDatabase = async () => {
  console.log("==================================================");
  console.log("CO-OP OS IDEMPOTENT DATABASE SEEDING PROCESS");
  console.log("==================================================");

  // 1. Seed Supabase PostgreSQL if configured
  if (isSupabaseConfigured()) {
    console.log("[Supabase Seeding] Seeding workers to Supabase PostgreSQL...");
    for (const w of SEED_WORKERS) {
      const payload = {
        id: w.coopId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
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
        bio: w.bio
      };

      const { error } = await supabase.from("workers").upsert([payload], { onConflict: "id" });
      if (error) {
        console.warn(`[Supabase Seed Warning] Worker ${w.name}:`, error.message);
      } else {
        console.log(`[Supabase Seed] Upserted worker: ${w.name}`);
      }
    }
  }

  // 2. Seed MongoDB if URI is configured or local connection passes
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/coop_os";
    console.log(`[MongoDB Seeding] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });

    for (const w of SEED_WORKERS) {
      await Worker.findOneAndUpdate({ coopId: w.coopId }, w, { upsert: true, new: true });
      console.log(`[MongoDB Seed] Upserted worker: ${w.name}`);
    }

    console.log("[MongoDB Seed] Seeding finished successfully.");
  } catch (mongoErr) {
    console.warn(`[MongoDB Seed Info] MongoDB unavailable (${mongoErr.message}). Skipping local MongoDB seeding.`);
  }

  console.log("==================================================");
  console.log("DATABASE SEEDING COMPLETE");
  console.log("==================================================");
};

// Execute if called directly from CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
