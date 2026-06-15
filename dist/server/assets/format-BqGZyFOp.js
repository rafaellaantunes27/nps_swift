import { jsx, jsxs } from "react/jsx-runtime";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/dashboard/primitives.tsx
function PageHeader({ eyebrow, title, description, right }) {
	return /* @__PURE__ */ jsxs("header", {
		className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "min-w-0",
			children: [
				eyebrow && /* @__PURE__ */ jsx("span", {
					className: "inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary",
					children: eyebrow
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-3 text-3xl font-bold tracking-tight sm:text-4xl",
					children: title
				}),
				description && /* @__PURE__ */ jsx("p", {
					className: "mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base",
					children: description
				})
			]
		}), right]
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: cn("rounded-3xl border border-border bg-card p-6 shadow-soft", className),
		children
	});
}
function CardTitle({ title, subtitle, right }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-5 flex items-start justify-between gap-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "text-base font-semibold tracking-tight",
				children: title
			}), subtitle && /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: subtitle
			})]
		}), right]
	});
}
function StatCard({ label, value, hint, trend, accent = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn("relative flex h-full min-h-[152px] flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-soft transition-shadow hover:shadow-elevated", accent ? "border-transparent bg-gradient-primary text-primary-foreground" : "border-border bg-card"),
		children: [
			/* @__PURE__ */ jsx("p", {
				className: cn("text-[11px] font-bold uppercase tracking-[0.12em]", accent ? "text-primary-foreground/80" : "text-muted-foreground"),
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: cn("mt-3 font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl", accent ? "" : "text-foreground"),
				children: value
			}),
			(hint || trend) && /* @__PURE__ */ jsxs("div", {
				className: "mt-3 flex min-h-9 flex-wrap items-end gap-2",
				children: [trend && /* @__PURE__ */ jsx("span", {
					className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold", accent ? "bg-white/20 text-primary-foreground" : trend.positive ? "bg-primary-soft text-primary" : "bg-secondary text-secondary-foreground"),
					children: trend.value
				}), hint && /* @__PURE__ */ jsx("span", {
					className: cn("text-[11px] font-medium", accent ? "text-primary-foreground/80" : "text-muted-foreground"),
					children: hint
				})]
			}),
			accent && /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl",
				"aria-hidden": true
			})
		]
	});
}
function Badge({ children, tone = "default" }) {
	return /* @__PURE__ */ jsx("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", {
			default: "bg-secondary text-secondary-foreground",
			primary: "bg-primary-soft text-primary",
			success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
			warning: "bg-[color:var(--warning)]/20 text-[color:var(--foreground)]",
			destructive: "bg-destructive/10 text-destructive"
		}[tone]),
		children
	});
}
//#endregion
//#region src/lib/format.ts
var fmtNum = (v, digits = 0) => v == null || isNaN(v) ? "—" : Number(v).toLocaleString("pt-BR", {
	minimumFractionDigits: digits,
	maximumFractionDigits: digits
});
var fmtPct = (v, digits = 1) => v == null || isNaN(v) ? "—" : `${fmtNum(v, digits)}%`;
var npsBand = (v) => {
	if (v >= 75) return {
		label: "Excelente",
		tone: "success"
	};
	if (v >= 50) return {
		label: "Bom",
		tone: "primary"
	};
	if (v >= 0) return {
		label: "Atenção",
		tone: "warning"
	};
	return {
		label: "Crítico",
		tone: "destructive"
	};
};
var fmtMes = (iso) => {
	return new Date(iso).toLocaleDateString("pt-BR", {
		month: "short",
		year: "2-digit"
	}).replace(".", "");
};
//#endregion
export { Badge as a, PageHeader as c, npsBand as i, StatCard as l, fmtNum as n, Card as o, fmtPct as r, CardTitle as s, fmtMes as t };
