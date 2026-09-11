// Dual Mode API Service Layer for CO-OP OS
// Live Mode: Connects to Node.js / Express REST API (http://localhost:5000/api)
// Demo Mode: Gracefully falls back to local deterministic mock state if offline.

import { WORKERS, COOPERATIVE_PULSE_METRICS } from "./mockData.js";
import { getFairMatches } from "./matching.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export let isLiveBackendAvailable = false;

// Helper to check backend health
export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      isLiveBackendAvailable = true;
      return true;
    }
  } catch (err) {
    isLiveBackendAvailable = false;
  }
  return false;
};

// Centralized API Methods
export const api = {
  async registerWorker(workerData) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/workers/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workerData),
      },
      2500,
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.error || `Worker registration failed (${res.status})`,
      );
    }
    const data = await res.json();
    return { ...data, id: data.id || data._id };
  },

  async getBackendOverview() {
    const [rootRes, healthRes, workersRes, analyticsRes] = await Promise.all([
      fetchWithTimeout(`${API_ORIGIN}/`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/health`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/workers`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/cooperative/analytics`, {}, 1800),
    ]);

    if (!healthRes.ok)
      throw new Error(`Backend health returned ${healthRes.status}`);
    const [apiIndex, health, workers, analytics] = await Promise.all([
      rootRes.json(),
      healthRes.json(),
      workersRes.ok ? workersRes.json() : [],
      analyticsRes.ok ? analyticsRes.json() : COOPERATIVE_PULSE_METRICS,
    ]);
    isLiveBackendAvailable = health.status === "OK";
    return { apiIndex, health, workers, analytics };
  },

  // Workers
  async getWorkers() {
    try {
      const res = await fetch(`${API_BASE_URL}/workers`);
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return Array.isArray(data)
          ? data.map((entry) => {
              const worker = entry.worker || entry;
              return {
                ...worker,
                fairMatchScore:
                  entry.fairMatchScore ??
                  entry.finalScore ??
                  worker.fairMatchScore,
                breakdown: entry.breakdown || {
                  skillFit: entry.skillScore,
                  availabilityScore: entry.availabilityScore,
                  reliabilityScore: entry.reliabilityScore,
                  distanceScore: entry.distanceScore,
                  workloadScore: entry.workloadScore,
                  opportunityEquity: entry.opportunityEquityScore,
                },
                equityData: entry.equityData || worker.equityData,
                fairMatchReasons: entry.reasons || worker.fairMatchReasons,
                rank: entry.rank,
              };
            })
          : data;
      }
    } catch (err) {
      isLiveBackendAvailable = false;
    }
    return WORKERS;
  },

  // Worker Status Update (Hardware / Companion API)
  async updateWorkerStatus(workerId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/${workerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
          error.error || `Worker status update failed (${res.status})`,
        );
      }
      const data = await res.json();
      isLiveBackendAvailable = true;
      return { ...data, id: data.id || data._id };
    } catch (err) {
      if (err.name !== "TypeError" && err.name !== "AbortError") throw err;
      isLiveBackendAvailable = false;
    }
    const match = WORKERS.find((w) => w.id === workerId) || WORKERS[0];
    match.status = status;
    match.isAvailable = status === "AVAILABLE";
    return match;
  },

  // Service Matches via Backend FairMatch Engine
  async getFairMatches(intent) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/service-requests/matches`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        },
        1800,
      );
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return Array.isArray(data)
          ? data.map((entry) => {
              const worker = entry.worker || entry;
              return {
                ...worker,
                fairMatchScore:
                  entry.fairMatchScore ??
                  entry.finalScore ??
                  worker.fairMatchScore,
                breakdown: entry.breakdown || {
                  skillFit: entry.skillScore,
                  availabilityScore: entry.availabilityScore,
                  reliabilityScore: entry.reliabilityScore,
                  distanceScore: entry.distanceScore,
                  workloadScore: entry.workloadScore,
                  opportunityEquity: entry.opportunityEquityScore,
                },
                equityData: entry.equityData || worker.equityData,
                fairMatchReasons: entry.reasons || worker.fairMatchReasons,
                rank: entry.rank,
              };
            })
          : data;
      }
    } catch (err) {
      isLiveBackendAvailable = false;
    }
    return getFairMatches(intent, WORKERS);
  },

  // Create Service Request
  async createServiceRequest(requestData) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/service-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        },
        1800,
      );
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return { ...data, id: data.id || data._id };
      }
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || `Service request failed (${res.status})`);
    } catch (err) {
      if (err.name !== "TypeError" && err.name !== "AbortError") throw err;
      isLiveBackendAvailable = false;
    }
    return {
      id: `req-${Date.now()}`,
      ...requestData,
      status: "CREATED",
      createdAt: new Date(),
    };
  },

  // Transition Request Status
  async updateRequestStatus(id, targetStatus, currentStatus, extra = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, currentStatus, ...extra }),
      });
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return data;
      }
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.error || `Request status update failed (${res.status})`,
      );
    } catch (err) {
      isLiveBackendAvailable = false;
    }
    return { id, status: targetStatus, updatedAt: new Date() };
  },

  // Cooperative Analytics Endpoint
  async getCooperativePulse() {
    try {
      const res = await fetch(`${API_BASE_URL}/cooperative/analytics`);
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return data;
      }
    } catch (err) {
      isLiveBackendAvailable = false;
    }
    return COOPERATIVE_PULSE_METRICS;
  },

  // Trade Assessment API Methods
  async getAssessmentConfig(category) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/config/${category}`);
      if (res.ok) return await res.json();
    } catch (err) {}
    return null;
  },

  async submitAssessment(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Assessment submission failed");
    } catch (err) {
      throw err;
    }
  },

  async getPendingAssessments() {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/pending`);
      if (res.ok) return await res.json();
    } catch (err) {}
    return [];
  },

  async verifyAssessment(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {}
    return { success: false };
  }
};

