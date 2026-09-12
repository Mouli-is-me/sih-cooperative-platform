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

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("coop_os_token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 3000) => {
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
  // Authentication API
  async login(credentials) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Login failed");
    return data;
  },

  async register(userData) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Registration failed");
    return data;
  },

  async getMe(token) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  },

  // Workers Registration & Fetch
  async registerWorker(workerData) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...workerData, fullName: workerData.name, role: "worker" }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || `Worker registration failed (${res.status})`);
    }
    const data = await res.json();
    return { ...data.data.user, id: data.data.user.id };
  },

  async getBackendOverview() {
    const [rootRes, healthRes, workersRes, analyticsRes] = await Promise.all([
      fetchWithTimeout(`${API_ORIGIN}/`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/health`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/workers`, {}, 1800),
      fetchWithTimeout(`${API_BASE_URL}/cooperative/analytics`, {}, 1800),
    ]);

    if (!healthRes.ok) throw new Error(`Backend health returned ${healthRes.status}`);
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
                fairMatchScore: entry.fairMatchScore ?? entry.finalScore ?? worker.fairMatchScore,
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
      const res = await fetch(`${API_BASE_URL}/workers/${workerId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || `Worker status update failed (${res.status})`);
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

  // Jobs & Work Opportunities
  async getJobs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/jobs?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, data: [] };
  },

  async createJob(jobData) {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to create job");
    return data;
  },

  async applyForJob(jobId) {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to submit job application");
    return data;
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, data: [] };
  },

  // Payments & Attendance
  async getPayments(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/payments?${query}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, data: [] };
  },

  async getAttendance(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/attendance?${query}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, data: [] };
  },

  async checkIn(jobId) {
    const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId }),
    });
    return await res.json();
  },

  async checkOut(attendanceId) {
    const res = await fetch(`${API_BASE_URL}/attendance/${attendanceId}/check-out`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return await res.json();
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
                fairMatchScore: entry.fairMatchScore ?? entry.finalScore ?? worker.fairMatchScore,
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
      throw new Error(error.error?.message || `Service request failed (${res.status})`);
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: targetStatus, currentStatus, ...extra }),
      });
      if (res.ok) {
        const data = await res.json();
        isLiveBackendAvailable = true;
        return data;
      }
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || `Request status update failed (${res.status})`);
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
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Assessment submission failed");
    } catch (err) {
      throw err;
    }
  },

  async getPendingAssessments() {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/pending`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (err) {}
    return [];
  },

  async verifyAssessment(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/${id}/verify`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (err) {}
    return { success: false };
  },
};
