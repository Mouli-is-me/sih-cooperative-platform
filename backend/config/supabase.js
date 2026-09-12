import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = () => {
  return Boolean(supabase);
};

if (isSupabaseConfigured()) {
  console.log(
    "[CO-OP OS DB] Supabase PostgreSQL Client Initialized Successfully",
  );
} else {
  console.log(
    "[CO-OP OS DB Info] Supabase credentials not found in env. Running in dynamic fallback mode.",
  );
}

// ----------------------------------------------------
// SUPABASE WORKERS DATA SERVICE
// ----------------------------------------------------
export const getWorkersFromSupabase = async () => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("workers").select("*");
    if (error) {
      console.error("[Supabase Error] Fetching workers failed:", error.message);
      return null;
    }
    return data.map((w) => ({
      ...w,
      coopId: w.coop_id,
      jobsCompleted: w.jobs_completed,
      onTimeRate: w.on_time_rate,
      reliabilityScore: w.reliability_score,
      distanceKm: w.distance_km,
      workloadCapacity: w.workload_capacity,
      workloadStatus: w.workload_status,
      isAvailable: w.is_available,
      skillFitPercent: w.skill_fit_percent,
      verifiedSkillLevel: w.verified_skill_level,
      experienceYears: w.experience_years,
      opportunityEquityScore: w.opportunity_equity_score,
    }));
  } catch (err) {
    console.error("[Supabase Error] Worker query exception:", err.message);
    return null;
  }
};

export const getWorkerByIdFromSupabase = async (id) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return {
      ...data,
      coopId: data.coop_id,
      jobsCompleted: data.jobs_completed,
      onTimeRate: data.on_time_rate,
      reliabilityScore: data.reliability_score,
      distanceKm: data.distance_km,
      workloadCapacity: data.workload_capacity,
      workloadStatus: data.workload_status,
      isAvailable: data.is_available,
    };
  } catch (err) {
    return null;
  }
};

export const updateWorkerStatusInSupabase = async (
  id,
  status,
  isAvailable,
  availabilityText,
  userId,
  isAdmin = false,
) => {
  if (!supabase) return null;
  try {
    let query = supabase
      .from("workers")
      .update({
        status,
        is_available: isAvailable,
        availability: availabilityText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (!isAdmin) query = query.eq("user_id", userId);
    const { data, error } = await query.select().single();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
};

// ----------------------------------------------------
// SUPABASE SERVICE REQUESTS DATA SERVICE
// ----------------------------------------------------
export const createServiceRequestInSupabase = async (reqData) => {
  if (!supabase) return null;
  try {
    const payload = {
      id: reqData.id || `req-${Date.now()}`,
      customer_id: reqData.customerId,
      customer_type: reqData.customerType || "Household",
      service_category: reqData.serviceCategory,
      task_detail: reqData.taskDetail,
      urgency: reqData.urgency || "Standard",
      estimated_duration: reqData.estimatedDuration || "45 min",
      location: reqData.location,
      customer_name: reqData.customerName,
      status: reqData.status || "CREATED",
      raw_text: reqData.rawText,
      assigned_worker_id: reqData.assignedWorkerId || null,
      transition_timestamps: reqData.transitionTimestamps || {},
    };

    const { data, error } = await supabase
      .from("service_requests")
      .insert([payload])
      .select()
      .single();
    if (error) {
      console.error("[Supabase Error] Creating request failed:", error.message);
      return null;
    }
    return {
      ...data,
      customerType: data.customer_type,
      serviceCategory: data.service_category,
      taskDetail: data.task_detail,
      estimatedDuration: data.estimated_duration,
      customerName: data.customer_name,
      assignedWorkerId: data.assigned_worker_id,
      rawText: data.raw_text,
    };
  } catch (err) {
    return null;
  }
};

export const updateServiceRequestStatusInSupabase = async (
  id,
  status,
  userId,
  isAdmin = false,
) => {
  if (!supabase) return null;
  try {
    let query = supabase
      .from("service_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!isAdmin) query = query.eq("customer_id", userId);
    const { data, error } = await query.select().single();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
};

// ----------------------------------------------------
// SUPABASE COOPERATIVE ANALYTICS SERVICE
// ----------------------------------------------------
export const getCooperativeAnalyticsFromSupabase = async () => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("cooperative_analytics")
      .select("*")
      .eq("id", "current_analytics")
      .single();
    if (error || !data) return null;
    return {
      activeWorkers: data.active_workers,
      openRequests: data.open_requests,
      completedJobs: data.completed_jobs,
      jobsCompletedMonth: data.jobs_completed_month,
      opportunityBalanceIndex: data.opportunity_balance_index,
      demandTrends: data.demand_trends,
      workforceGaps: data.workforce_gaps,
      workloadDistribution: data.workload_distribution,
    };
  } catch (err) {
    return null;
  }
};
