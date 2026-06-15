import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {right}
    </header>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[152px] flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-soft transition-shadow hover:shadow-elevated",
        accent
          ? "border-transparent bg-gradient-primary text-primary-foreground"
          : "border-border bg-card"
      )}
    >
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.12em]",
          accent ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl",
          accent ? "" : "text-foreground"
        )}
      >
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-3 flex min-h-9 flex-wrap items-end gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                accent
                  ? "bg-white/20 text-primary-foreground"
                  : trend.positive
                  ? "bg-primary-soft text-primary"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && (
            <span
              className={cn(
                "text-[11px] font-medium",
                accent ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {hint}
            </span>
          )}
        </div>
      )}
      {accent && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const map = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary-soft text-primary",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/20 text-[color:var(--foreground)]",
    destructive: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}
