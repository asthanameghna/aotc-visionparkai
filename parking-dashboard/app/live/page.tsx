"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Radio,
  AlertCircle,
  Settings2,
  Wifi,
  WifiOff,
  Car,
  Clock,
  Info,
} from "lucide-react";

export default function LivePage() {
  const [wsUrl] = useState("ws://localhost:8000/ws");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="p-8 space-y-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-2">Live Parking Map</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Real-time slot occupancy — powered by AI inference + WebSocket feed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="btn-ghost flex items-center gap-2"
          >
            <Info size={15} />
            How it works
          </button>
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div
          className="glass rounded-2xl p-5"
          style={{ borderColor: 'rgba(0,212,255,0.2)' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
            How the Live Map works
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { step: "1", title: "YOLO Inference", body: "Backend reads RTSP stream 30×/sec, detects vehicles" },
              { step: "2", title: "5-Point Check", body: "Geometry engine checks 3-of-5 bounding box points against slot polygons" },
              { step: "3", title: "3s Debounce", body: "Temporal smoothing ignores drive-by flicker" },
              { step: "4", title: "WebSocket Push", body: "FastAPI pushes { A1: 'OCCUPIED', B2: 'EMPTY' } to this page" },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-xl p-4" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 10, color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                  STEP {step}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection status bar */}
      <div
        className="glass rounded-2xl p-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(245,158,11,0.2)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 44, height: 44, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <WifiOff size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>WebSocket Not Connected</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Endpoint: <code style={{ color: 'var(--accent-blue)', fontSize: 11 }}>{wsUrl}</code>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="rounded-xl px-4 py-2"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>STATUS</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>Awaiting Backend</div>
          </div>
          <div
            className="rounded-xl px-4 py-2"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>PROTOCOL</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>WebSocket</div>
          </div>
        </div>
      </div>

      {/* Main live area — skeleton */}
      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
        {/* Map canvas skeleton */}
        <div className="glass flex-1" style={{ minHeight: 480 }}>
          <div className="p-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Slot Map</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-red">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block' }} />
                Occupied
              </div>
              <div className="badge badge-green">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
                Empty
              </div>
            </div>
          </div>

          {/* Slot grid skeleton preview */}
          <div className="p-5 pt-2">
            <div
              className="rounded-2xl relative overflow-hidden flex items-center justify-center"
              style={{
                height: 380,
                background: 'rgba(0,212,255,0.02)',
                border: '1px dashed rgba(0,212,255,0.12)',
              }}
            >
              {/* Skeleton slot rows */}
              <div className="absolute inset-0 p-8 flex flex-col gap-4 pointer-events-none">
                {[6, 5, 6, 5].map((count, row) => (
                  <div key={row} className="flex gap-3 justify-center">
                    {Array.from({ length: count }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton rounded-lg"
                        style={{
                          width: 64,
                          height: 44,
                          opacity: 0.4,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Overlay message */}
              <div
                className="relative z-10 text-center rounded-2xl p-8"
                style={{
                  background: 'rgba(5,13,26,0.85)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ width: 56, height: 56, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <Wifi size={26} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                  Waiting for Live Feed
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6, marginBottom: 16 }}>
                  When the FastAPI backend streams WebSocket data, this map will
                  render all polygon slots in real-time — flipping between{" "}
                  <span style={{ color: 'var(--accent-green)' }}>green (empty)</span> and{" "}
                  <span style={{ color: 'var(--accent-red)' }}>red (occupied)</span> as cars park and leave.
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Expected payload format:
                  </div>
                  <code
                    className="rounded-xl px-4 py-2 block text-left"
                    style={{
                      fontSize: 11,
                      background: 'rgba(0,212,255,0.06)',
                      border: '1px solid rgba(0,212,255,0.12)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    {`{ "A1": "OCCUPIED", "A2": "EMPTY", "B1": "OCCUPIED" }`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4" style={{ width: 220 }}>
          {/* Stats */}
          {[
            { icon: Car, label: "Total Slots", value: "—", color: "#00d4ff" },
            { icon: Car, label: "Occupied", value: "—", color: "#ff3b5c" },
            { icon: Car, label: "Available", value: "—", color: "#00ff88" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="glass rounded-2xl p-4 flex items-center gap-3"
            >
              <div
                className="rounded-xl flex items-center justify-center"
                style={{ width: 38, height: 38, background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
              </div>
            </div>
          ))}

          {/* Last updated */}
          <div
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                LAST UPDATE
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Never — no connection
            </div>
          </div>

          {/* Setup prompt */}
          <div
            className="glass rounded-2xl p-4"
            style={{ borderColor: 'rgba(0,212,255,0.15)' }}
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle size={14} style={{ color: 'var(--accent-blue)', marginTop: 1, flexShrink: 0 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)' }}>SETUP STEPS</div>
            </div>
            <ol style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Draw slots in Admin</li>
              <li>Export slots_config.json</li>
              <li>Start FastAPI backend</li>
              <li>Live map auto-connects</li>
            </ol>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <button className="btn-primary w-full mt-3" style={{ width: '100%', fontSize: 12 }}>
                <Settings2 size={13} style={{ display: 'inline', marginRight: 6 }} />
                Go to Admin Setup
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
