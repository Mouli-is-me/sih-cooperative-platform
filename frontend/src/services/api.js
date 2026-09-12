// Dual Mode API Service Layer for CO-OP OS
// Live Mode: Connects to Node.js / Express REST API (http://localhost:5000/api or Render backend)
// Demo Mode: Gracefully falls back to local deterministic mock state if offline.

import { WORKERS, COOPERATIVE_PULSE_METRICS } from "./mockData.js";
import { getFairMatches } from "./matching.js";

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, "")}/api`
  : typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("coop_os_token")
      : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

const safeJson = async (res) => {
  try {
    const text = await res.text();
    return text && text.trim() ? JSON.parse(text) : {};
  } catch (e) {
    return {};
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort("Request Timeout"),
    timeoutMs,
  );
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined") {
        const currentToken = localStorage.getItem("coop_os_token");
        if (currentToken !== "demo-mode-token") {
          window.dispatchEvent(new Event("auth-expired"));
        }
      }
    }
    return res;
  } catch (err) {
    if (err.name === "AbortError" || String(err).includes("aborted")) {
      throw new Error(
        "Server request timed out. Please wait a few seconds while the backend server wakes up.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export let isLiveBackendAvailable = false;

// Helper to check backend health
export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort("Health Check Timeout"),
      10000,
    );
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
  // Authentication API
  async login(credentials) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      },
      15000,
    );
    const data = await safeJson(res);
    if (res.status === 405) {
      throw new Error(
        "HTTP 405 Method Not Allowed: Check VITE_API_BASE_URL in Vercel environment variables to point to your Render backend.",
      );
    }
    if (!res.ok)
      throw new Error(data.error?.message || `Login failed (${res.status})`);
    return data;
  },

  async register(userData) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
      15000,
    );
    const data = await safeJson(res);
    if (res.status === 405) {
      throw new Error(
        "HTTP 405 Method Not Allowed: Check VITE_API_BASE_URL in Vercel environment variables to point to your Render backend.",
      );
    }
    if (!res.ok)
      throw new Error(
        data.error?.message || `Registration failed (${res.status})`,
      );
    return data;
  },

  async getMe(token) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/me`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
      10000,
    );
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await safeJson(res);
  },

  // Workers Registration & Fetch
  async registerWorker(workerData) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...workerData,
          fullName: workerData.name,
          role: "worker",
        }),
      },
      15000,
    );
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(
        data.error?.message || `Worker registration failed (${res.status})`,
      );
    }
    return { ...data.data.user, id: data.data.user.id };
  },

  async getBackendOverview() {
    try {
      const [rootRes, healthRes, workersRes, analyticsRes] = await Promise.all([
        fetchWithTimeout(`${API_ORIGIN}/`, {}, 10000),
        fetchWithTimeout(`${API_BASE_URL}/health`, {}, 10000),
        fetchWithTimeout(`${API_BASE_URL}/workers`, {}, 10000),
        fetchWithTimeout(`${API_BASE_URL}/cooperative/analytics`, {}, 10000),
      ]);

      if (!healthRes.ok)
        throw new Error(`Backend health returned ${healthRes.status}`);
      const [apiIndex, health, workers, analytics] = await Promise.all([
        safeJson(rootRes),
        safeJson(healthRes),
        workersRes.ok ? safeJson(workersRes) : [],
        analyticsRes.ok ? safeJson(analyticsRes) : COOPERATIVE_PULSE_METRICS,
      ]);
      isLiveBackendAvailable = health.status === "OK";
      return { apiIndex, health, workers, analytics };
    } catch (err) {
      isLiveBackendAvailable = false;
      return {
        apiIndex: { service: "CO-OP OS API", status: "OFFLINE" },
        health: { status: "OFFLINE" },
        workers: WORKERS,
        analytics: COOPERATIVE_PULSE_METRICS,
      };
    }
  },

  // Workers
  async getWorkers() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/workers`, {}, 12000);
      if (res.ok) {
        const data = await safeJson(res);
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

  // Worker Status Update
  async updateWorkerStatus(workerId, status) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/workers/${workerId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        },
        10000,
      );
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(
          data.error?.message || `Worker status update failed (${res.status})`,
        );
      }
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

  // Jobs & Work Opportunities
  async getJobs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/jobs?${query}`,
        {},
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (e) {}
    return { success: true, data: [] };
  },

  async createJob(jobData) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/jobs`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
      },
      12000,
    );
    const data = await safeJson(res);
    if (!res.ok)
      throw new Error(
        data.error?.message || `Failed to create job (${res.status})`,
      );
    return data;
  },

  async applyForJob(jobId) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/jobs/${jobId}/apply`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
      12000,
    );
    const data = await safeJson(res);
    if (!res.ok)
      throw new Error(
        data.error?.message ||
          `Failed to submit job application (${res.status})`,
      );
    return data;
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/notifications`,
        {
          headers: getAuthHeaders(),
        },
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (e) {}
    return { success: true, data: [] };
  },

  // Payments & Attendance
  async getPayments(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/payments?${query}`,
        {
          headers: getAuthHeaders(),
        },
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (e) {}
    return { success: true, data: [] };
  },

  async getAttendance(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/attendance?${query}`,
        {
          headers: getAuthHeaders(),
        },
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (e) {}
    return { success: true, data: [] };
  },

  async checkIn(jobId) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/attendance/check-in`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId }),
      },
      10000,
    );
    return await safeJson(res);
  },

  async checkOut(attendanceId) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/attendance/${attendanceId}/check-out`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
      10000,
    );
    return await safeJson(res);
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
        12000,
      );
      if (res.ok) {
        const data = await safeJson(res);
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
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData),
        },
        12000,
      );
      const data = await safeJson(res);
      if (!res.ok)
        throw new Error(
          data.error?.message || `Service request failed (${res.status})`,
        );
      isLiveBackendAvailable = true;
      return { ...data, id: data.id || data._id };
    } catch (err) {
      isLiveBackendAvailable = false;
      if (err.name === "TypeError")
        throw new Error("The service is unavailable. Please try again.");
      throw err;
    }
  },

  // Transition Request Status
  async updateRequestStatus(id, targetStatus, currentStatus, extra = {}) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/service-requests/${id}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: targetStatus,
            currentStatus,
            ...extra,
          }),
        },
        10000,
      );
      const data = await safeJson(res);
      if (res.ok) {
        isLiveBackendAvailable = true;
        return data;
      }
      throw new Error(
        data.error?.message || `Request status update failed (${res.status})`,
      );
    } catch (err) {
      isLiveBackendAvailable = false;
      if (err.name === "TypeError")
        throw new Error("The service is unavailable. Please try again.");
      throw err;
    }
  },

  // Cooperative Analytics Endpoint
  async getCooperativePulse() {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/cooperative/analytics`,
        {},
        12000,
      );
      if (res.ok) {
        const data = await safeJson(res);
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
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/assessments/config/${category}`,
        {},
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (err) {}
    return null;
  },

  async submitAssessment(payload) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/assessments/submit`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
        12000,
      );
      const data = await safeJson(res);
      if (res.ok) return data;
      throw new Error(data.error?.message || "Assessment submission failed");
    } catch (err) {
      throw err;
    }
  },

  async getPendingAssessments() {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/assessments/pending`,
        {
          headers: getAuthHeaders(),
        },
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (err) {}
    return [];
  },

  async verifyAssessment(id, payload = {}) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/assessments/${id}/verify`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
        10000,
      );
      if (res.ok) return await safeJson(res);
    } catch (err) {}
    return { success: false };
  },
};
