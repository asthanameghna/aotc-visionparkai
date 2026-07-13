"use client";
import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Download,
  AlertCircle,
  Calendar,
} from "lucide-react";

function EmptyChartBox({
  title,
  subtitle,
  height = 220,
}: {
  title: string;
  subtitle: string;
  height?: number;
}) {
  return (
    <div className="glass p-5" style={{ minHeight: height + 80 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div className="badge badge-amber">No Data</div>
      </div>
      <div
        className="rounded-xl flex flex-col items-center justify-center gap-3"
        style={{
          height,
          background: 'rgba(0,212,255,0.02)',
          border: '1px dashed rgba(0,212,255,0.1)',
        }}
      >
        {/* Skeleton bars / lines */}
        <div className="flex items-end gap-2" style={{ opacity: 0.3 }}>
          {[60, 35, 80, 45, 90, 55, 70, 40, 85, 50, 75, 30].map((h, i) => (
            <div
              key={i}
              className="skeleton rounded-t"
              style={{ width: 20, height: h * 0.7, background: 'rgba(0,212,255,0.15)' }}
            />
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Awaiting Backend Data
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Charts populate once PostgreSQL logs occupancy events
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapSkeleton() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Peak Hours Heatmap</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Average occupancy % by day & hour
          </div>
        </div>
        <div className="badge badge-amber">No Data</div>
      </div>

      {/* Heatmap grid skeleton */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 36 }}>
          {hours.map((h) => (
            <div key={h} style={{ width: 22, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
              {h % 6 === 0 ? `${h}h` : ""}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex items-center gap-2 mb-1.5">
            <div style={{ width: 28, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
              {day}
            </div>
            {hours.map((h) => (
              <div
                key={h}
                className="rounded"
                style={{
                  width: 22,
                  height: 22,
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.06)',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="skeleton absolute inset-0" style={{ opacity: 0.4 }} />
              </div>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, paddingLeft: 36, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Low</span>
          {[0.08, 0.15, 0.25, 0.4, 0.6, 0.8, 1].map((o, i) => (
            <div
              key={i}
              style={{ width: 22, height: 14, background: `rgba(0,212,255,${o})`, borderRadius: 3 }}
            />
          ))}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>High</span>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl p-3 text-center"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}
      >
        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
          Historical data will populate this grid once the backend logs state changes to PostgreSQL
        </div>
      </div>
    </div>
  );
}

function RevenueEstimator() {
  const [rate, setRate] = useState("5");
  const [hours, setHours] = useState("8");
  const estimated = (parseFloat(rate) || 0) * (parseFloat(hours) || 0);

  return (
    <div className="glass p-5">
      <div className="flex items-center gap-2 mb-5">
        <DollarSign size={16} style={{ color: '#f59e0b' }} />
        <div style={{ fontWeight: 700, fontSize: 15 }}>Revenue Estimator</div>
        <div className="badge badge-amber" style={{ marginLeft: 'auto' }}>Manual Input</div>
      </div>

      <div className="space-y-4">
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>
            RATE PER HOUR (₹ or $)
          </label>
          <input
            className="input-dark"
            type="number"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>
            AVG OCCUPIED HOURS / SLOT / DAY
          </label>
          <input
            className="input-dark"
            type="number"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>

        <div className="divider" />

        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            EST. DAILY REVENUE (per slot)
          </div>
          <div className="gradient-text-green" style={{ fontSize: 32, fontWeight: 900 }}>
            {isNaN(estimated) ? "—" : `${estimated.toFixed(2)}`}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            × total slots = lot revenue (slots count from backend)
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}
        >
          <div style={{ fontSize: 11, color: '#f59e0b' }}>
            <strong>Note:</strong> Avg occupied hours will be calculated automatically
            from PostgreSQL logs once the backend is running.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-2">Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Peak hours, occupancy trends, per-slot breakdown & revenue insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range toggle */}
          <div
            className="glass rounded-xl flex p-1 gap-1"
          >
            {(["24h", "7d", "30d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: timeRange === t ? 'rgba(0,212,255,0.15)' : 'transparent',
                  color: timeRange === t ? 'var(--accent-blue)' : 'var(--text-muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <button className="btn-ghost flex items-center gap-2" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Backend warning */}
      <div
        className="glass rounded-2xl p-4 flex items-center gap-4"
        style={{ borderColor: 'rgba(245,158,11,0.2)' }}
      >
        <div
          className="rounded-xl flex items-center justify-center shrink-0"
          style={{ width: 40, height: 40, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <AlertCircle size={20} style={{ color: '#f59e0b' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b', marginBottom: 2 }}>
            Analytics data unavailable — backend not connected
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Charts will populate automatically once the FastAPI backend logs occupancy events to PostgreSQL.
            The <strong style={{ color: 'var(--text-secondary)' }}>Revenue Estimator</strong> below works with manual input right now.
          </div>
        </div>
        <div className="badge badge-amber shrink-0">
          <Calendar size={10} />
          {timeRange}
        </div>
      </div>

      {/* Top stat skeletons */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avg Occupancy", icon: TrendingUp, color: "#00d4ff" },
          { label: "Peak Hour", icon: Clock, color: "#7c3aed" },
          { label: "Busiest Slot", icon: BarChart3, color: "#ff3b5c" },
          { label: "Total Events", icon: BarChart3, color: "#00ff88" },
        ].map(({ label, icon: Icon, color }) => (
          <div key={label} className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className="rounded-xl flex items-center justify-center"
                style={{ width: 36, height: 36, background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                {label.toUpperCase()}
              </span>
            </div>
            <div className="skeleton rounded-lg" style={{ height: 32, width: '60%', marginBottom: 8 }} />
            <div className="skeleton rounded-lg" style={{ height: 12, width: '80%' }} />
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-5">
        <EmptyChartBox
          title="Occupancy Over Time"
          subtitle={`Last ${timeRange} — area chart`}
          height={220}
        />
        <EmptyChartBox
          title="Per-Slot Breakdown"
          subtitle="How often each slot is occupied"
          height={220}
        />
      </div>

      {/* Heatmap */}
      <HeatmapSkeleton />

      {/* Revenue */}
      <div className="grid grid-cols-2 gap-5">
        <RevenueEstimator />
        <EmptyChartBox
          title="Occupancy Distribution"
          subtitle="Morning / Afternoon / Evening / Night"
          height={200}
        />
      </div>
    </div>
  );
}
