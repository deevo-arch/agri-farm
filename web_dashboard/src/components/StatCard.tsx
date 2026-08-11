import { ReactNode } from "react";
import "../styles/Dashboard.css";

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  badge?: string;
  accent?: "blue" | "green" | "red" | "orange";
  icon?: ReactNode;
};

export default function StatCard({
  title,
  value,
  subtitle,
  badge,
  accent = "blue",
  icon,
}: StatCardProps) {
  const accentMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
    green: { bg: "rgba(16,185,129,0.12)", text: "#10b981" },
    red: { bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
    orange: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  };

  const accentStyle = accentMap[accent] || accentMap.blue;

  return (
    <div className="stat-card neu-stat-card" data-accent={accent}>
      <div className="stat-card-top">
        <div className="stat-card-text">
          <span className="stat-card-title">{title}</span>
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
        {icon && (
          <div
            className="stat-card-icon-pill neu-icon-pill"
            style={{ backgroundColor: accentStyle.bg, color: accentStyle.text }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="stat-card-bottom">
        <span className="stat-card-value">{value}</span>
        {badge && (
          <span
            className="stat-card-badge neu-badge-pill"
            style={{ color: accentStyle.text, backgroundColor: accentStyle.bg }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
