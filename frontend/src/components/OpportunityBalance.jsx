import React from "react";
import { Scale, Info, CheckCircle2, TrendingDown } from "lucide-react";

export default function OpportunityBalance({ matches = [] }) {
  return (
    <div className="opportunity-balance-card">
      <div className="op-balance-header">
        <div className="op-title-row">
          <Scale size={18} className="op-icon" />
          <span className="op-title">COOPERATIVE OPPORTUNITY BALANCE</span>
        </div>
        <p className="op-desc">
          FairMatch considers workers' current workload so opportunities are not repeatedly concentrated among the same few technicians.
        </p>
      </div>

      {/* Visual Workload Distribution List */}
      <div className="workload-rows-list">
        {matches.map((worker) => {
          let statusColor = "#16A34A"; // Low workload green
          let fillWidth = `${worker.workloadCapacity}%`;

          if (worker.workloadCapacity > 75) {
            statusColor = "#F97316"; // High workload saffron
          } else if (worker.workloadCapacity > 40) {
            statusColor = "#4F46E5"; // Medium indigo
          }

          return (
            <div key={worker.id} className="workload-item-row">
              <div className="worker-meta">
                <span className="worker-name">{worker.name}</span>
                <span className="worker-role">{worker.title}</span>
              </div>

              <div className="workload-meter-container">
                <div className="workload-bar-track">
                  <div 
                    className="workload-bar-fill"
                    style={{ width: fillWidth, backgroundColor: statusColor }}
                  />
                </div>
                <span className="workload-val">{worker.workloadCapacity}% capacity</span>
              </div>

              <div className="workload-badge-col">
                <span 
                  className="status-chip"
                  style={{ color: statusColor, borderColor: statusColor + "40", backgroundColor: statusColor + "10" }}
                >
                  {worker.workloadStatus} Workload
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="op-impact-box">
        <CheckCircle2 size={16} className="impact-check" />
        <span>
          <strong>Why this matters:</strong> Kumar is recommended as the primary candidate because he has low current workload (31%) and excellent skill fit (96%), whereas Ravi (89% busy) is preserved from overload.
        </span>
      </div>
    </div>
  );
}
