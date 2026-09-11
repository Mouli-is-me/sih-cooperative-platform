import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { api } from "../services/api.js";

const endpointRows = [
  ["GET", "/api/health", "Service health"],
  ["GET", "/api/workers", "Worker directory"],
  ["POST", "/api/service-requests/matches", "FairMatch scoring"],
  ["POST", "/api/service-requests", "Create request"],
  ["PATCH", "/api/service-requests/:id/status", "Lifecycle transition"],
  ["GET", "/api/cooperative/analytics", "Cooperative analytics"],
];

const initialState = {
  health: null,
  apiIndex: null,
  workers: [],
  analytics: null,
  checkedAt: null,
  loading: true,
  error: "",
};

export default function BackendDashboardPage() {
  const [state, setState] = useState(initialState);

  const loadOverview = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const overview = await api.getBackendOverview();
      setState({
        ...overview,
        checkedAt: new Date(),
        loading: false,
        error: "",
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.message || "Unable to reach the backend",
        checkedAt: new Date(),
      }));
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const analytics = state.analytics || {};
  const availableWorkers =
    analytics.availableWorkers ??
    state.workers.filter((worker) => worker.isAvailable).length;
  const busyWorkers =
    analytics.busyWorkers ??
    Math.max(0, state.workers.length - availableWorkers);
  const apiOnline = Boolean(state.health?.status === "OK");
  const dataSource =
    analytics.dataSource ||
    (state.workers.length ? "LIVE_DATABASE" : "DEMO_SIMULATION");

  return (
    <div className="backend-dashboard-page">
      <div className="backend-dashboard-container">
        <header className="backend-hero">
          <div>
            <div className="backend-eyebrow">
              <Server size={15} /> BACKEND OPERATIONS
            </div>
            <h1>CO-OP OS Control Center</h1>
            <p>
              Monitor the API, workforce availability, FairMatch activity, and
              cooperative health from one place.
            </p>
          </div>
          <button
            className="backend-refresh-btn"
            onClick={loadOverview}
            disabled={state.loading}
          >
            <RefreshCw
              size={16}
              className={state.loading ? "backend-spin" : ""}
            />
            {state.loading ? "Checking..." : "Refresh status"}
          </button>
        </header>

        {state.error && (
          <div className="backend-alert">
            <XCircle size={17} /> {state.error}
          </div>
        )}

        <section className="backend-status-strip">
          <div className="backend-status-main">
            {apiOnline ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            <div>
              <strong>
                {apiOnline ? "API operational" : "API unavailable"}
              </strong>
              <span>
                {state.health?.service || "Waiting for backend health response"}
              </span>
            </div>
          </div>
          <div className="backend-status-meta">
            <span>
              <Database size={14} />{" "}
              {dataSource === "LIVE_DATABASE"
                ? "Live database"
                : "Fallback data"}
            </span>
            <span>
              <Clock3 size={14} />{" "}
              {state.checkedAt
                ? `Checked ${state.checkedAt.toLocaleTimeString()}`
                : "Not checked"}
            </span>
          </div>
        </section>

        <section className="backend-kpi-grid">
          <article className="backend-kpi-card">
            <span>Active workers</span>
            <strong>{analytics.activeWorkers ?? state.workers.length}</strong>
            <Users size={20} />
          </article>
          <article className="backend-kpi-card">
            <span>Available now</span>
            <strong>{availableWorkers}</strong>
            <CheckCircle2 size={20} />
          </article>
          <article className="backend-kpi-card">
            <span>Open requests</span>
            <strong>{analytics.openRequests ?? "-"}</strong>
            <Activity size={20} />
          </article>
          <article className="backend-kpi-card">
            <span>Opportunity equity</span>
            <strong>
              {analytics.opportunityBalanceIndex ?? "-"}
              <small>/100</small>
            </strong>
            <ShieldCheck size={20} />
          </article>
        </section>

        <div className="backend-content-grid">
          <section className="backend-panel">
            <div className="backend-panel-heading">
              <div>
                <span className="backend-panel-kicker">WORKFORCE</span>
                <h2>Availability snapshot</h2>
              </div>
              <Users size={20} />
            </div>
            <div className="backend-bar-list">
              <div>
                <span>Available</span>
                <strong>{availableWorkers}</strong>
                <i>
                  <b
                    style={{
                      width: `${Math.min(100, (availableWorkers / Math.max(1, analytics.activeWorkers || state.workers.length)) * 100)}%`,
                    }}
                  />
                </i>
              </div>
              <div>
                <span>Busy</span>
                <strong>{busyWorkers}</strong>
                <i>
                  <b
                    className="bar-orange"
                    style={{
                      width: `${Math.min(100, (busyWorkers / Math.max(1, analytics.activeWorkers || state.workers.length)) * 100)}%`,
                    }}
                  />
                </i>
              </div>
            </div>
            <div className="backend-worker-list">
              {state.workers.slice(0, 4).map((worker) => (
                <div key={worker.id}>
                  <span
                    className={
                      worker.isAvailable
                        ? "status-dot"
                        : "status-dot status-busy"
                    }
                  />{" "}
                  <strong>{worker.name}</strong>
                  <span>
                    {worker.category} ·{" "}
                    {worker.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
              ))}
              {!state.workers.length && (
                <p className="backend-muted">
                  Worker directory is using fallback data.
                </p>
              )}
            </div>
          </section>

          <section className="backend-panel">
            <div className="backend-panel-heading">
              <div>
                <span className="backend-panel-kicker">SERVICE FLOW</span>
                <h2>Request activity</h2>
              </div>
              <Activity size={20} />
            </div>
            <div className="backend-flow-stat">
              <strong>{analytics.matchedRequests ?? "-"}</strong>
              <span>requests matched by FairMatch</span>
            </div>
            <div className="backend-flow-stat">
              <strong>{analytics.completedJobs ?? "-"}</strong>
              <span>jobs completed</span>
            </div>
            <div className="backend-flow-stat">
              <strong>
                {analytics.averageResponseTimeMin ?? "-"}
                <small> min</small>
              </strong>
              <span>average response time</span>
            </div>
          </section>
        </div>

        <section className="backend-panel backend-endpoints-panel">
          <div className="backend-panel-heading">
            <div>
              <span className="backend-panel-kicker">API SURFACE</span>
              <h2>Available endpoints</h2>
            </div>
            <Server size={20} />
          </div>
          <div className="backend-endpoint-list">
            {endpointRows.map(([method, path, label]) => (
              <div key={path}>
                <span className={`method-tag method-${method.toLowerCase()}`}>
                  {method}
                </span>
                <code>{path}</code>
                <span>{label}</span>
                <CheckCircle2 size={16} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
