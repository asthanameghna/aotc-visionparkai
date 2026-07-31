"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Radio,
  BarChart3,
  Navigation2,
  Cpu,
  ChevronRight,
  Activity,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Overview", desc: "System summary" },
  { href: "/admin", icon: Settings2, label: "Admin Setup", desc: "Polygon mapping" },
  { href: "/live", icon: Radio, label: "Live Map", desc: "Real-time slots" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", desc: "Peak hours & trends" },
  { href: "/navigate", icon: Navigation2, label: "Navigate", desc: "A* wayfinding" },
];

type SidebarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Sidebar({ isSidebarOpen, onToggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="glass-strong relative z-20 flex shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        width: isSidebarOpen ? "256px" : "64px",
        height: "100vh",
        borderRight: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: 0,
      }}
    >
      <div className={`flex items-center ${isSidebarOpen ? "justify-between p-4 pb-4" : "justify-center px-3 pt-4 pb-3"}`}>
        <div className={`flex items-center gap-3 ${isSidebarOpen ? "" : "justify-center"}`}>
          <div
            className="flex items-center justify-center rounded-xl glass"
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, rgba(56,189,248,0.28) 0%, rgba(99,102,241,0.28) 100%)",
            }}
          >
            <Cpu size={20} color="#dbeafe" strokeWidth={2.5} />
          </div>
          {isSidebarOpen && (
            <div>
              <div className="font-bold text-sm gradient-text" style={{ letterSpacing: "0.05em" }}>
                VisionPark
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                AI SYSTEM v2.0
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRightIcon size={16} />}
        </button>
      </div>

      {isSidebarOpen && <div className="divider mx-4 mb-4" />}

      <nav className={`flex-1 ${isSidebarOpen ? "px-3 space-y-1" : "px-2 space-y-2"}`}>
        {isSidebarOpen && (
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", padding: "0 12px 8px" }}>
            NAVIGATION
          </div>
        )}
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={!isSidebarOpen ? label : undefined}
              className={`nav-link ${active ? "active" : ""} ${isSidebarOpen ? "" : "justify-center px-0"}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {isSidebarOpen && (
                <>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{desc}</div>
                  </div>
                  {active && <ChevronRight size={14} style={{ color: "var(--accent-blue)", opacity: 0.7 }} />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {isSidebarOpen && (
        <div className="mt-auto p-4 pt-2">
          <div className="divider mb-4" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Activity size={12} />
              Live Status
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">YOLOv8n</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">PENDING</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">conf=0.25 · 3-of-5 pts</div>
          </div>
        </div>
      )}
    </aside>
  );
}
