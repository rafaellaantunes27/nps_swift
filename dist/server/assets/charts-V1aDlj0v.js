import { n as fmtNum, t as fmtMes } from "./format-BqGZyFOp.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
//#region src/components/dashboard/charts.tsx
var COLORS = {
	primary: "var(--color-primary)",
	primaryGlow: "var(--color-primary-glow)",
	muted: "var(--color-muted-foreground)",
	axis: "var(--color-muted-foreground)",
	grid: "var(--color-border)",
	foreground: "var(--color-foreground)"
};
var TOOLTIP_STYLE = {
	background: "var(--color-popover)",
	border: "1px solid var(--color-border)",
	borderRadius: 12,
	boxShadow: "var(--shadow-elevated)",
	padding: "8px 12px",
	fontSize: 12,
	color: "var(--color-popover-foreground)"
};
function NpsDonut({ promotores, neutros, detratores, centerValue, centerLabel = "NPS" }) {
	const data = [
		{
			name: "Promotores",
			value: promotores,
			color: "var(--color-primary)"
		},
		{
			name: "Neutros",
			value: neutros,
			color: "oklch(0.82 0.04 60)"
		},
		{
			name: "Detratores",
			value: detratores,
			color: "oklch(0.45 0.04 40)"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "relative h-72",
		children: [/* @__PURE__ */ jsx(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ jsxs(PieChart, { children: [
				/* @__PURE__ */ jsx(Pie, {
					data,
					innerRadius: 75,
					outerRadius: 108,
					paddingAngle: 3,
					dataKey: "value",
					strokeWidth: 0,
					children: data.map((d) => /* @__PURE__ */ jsx(Cell, { fill: d.color }, d.name))
				}),
				/* @__PURE__ */ jsx(Tooltip, {
					contentStyle: TOOLTIP_STYLE,
					formatter: (v, n) => [`${fmtNum(v, 1)}%`, n]
				}),
				/* @__PURE__ */ jsx(Legend, {
					verticalAlign: "bottom",
					iconType: "circle",
					wrapperStyle: {
						fontSize: 12,
						paddingTop: 8
					}
				})
			] })
		}), /* @__PURE__ */ jsxs("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground",
				children: centerLabel
			}), /* @__PURE__ */ jsx("span", {
				className: "font-display text-4xl font-bold tracking-tight",
				children: centerValue
			})]
		})]
	});
}
function TrendChart({ data }) {
	return /* @__PURE__ */ jsx("div", {
		className: "h-80",
		children: /* @__PURE__ */ jsx(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ jsxs(AreaChart, {
				data: data.map((d) => ({
					mes: fmtMes(d.mes_ano),
					"NPS Tradicional": Number(d.nps_tradicional.toFixed(1)),
					"NPS Ajustado": Number(d.nps_ajustado.toFixed(1)),
					Comentários: d.comentarios
				})),
				margin: {
					top: 10,
					right: 12,
					left: -10,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsxs("linearGradient", {
						id: "ajustado",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ jsx("stop", {
							offset: "0%",
							stopColor: "var(--color-primary)",
							stopOpacity: .35
						}), /* @__PURE__ */ jsx("stop", {
							offset: "100%",
							stopColor: "var(--color-primary)",
							stopOpacity: 0
						})]
					}), /* @__PURE__ */ jsxs("linearGradient", {
						id: "tradicional",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ jsx("stop", {
							offset: "0%",
							stopColor: "oklch(0.55 0.05 45)",
							stopOpacity: .18
						}), /* @__PURE__ */ jsx("stop", {
							offset: "100%",
							stopColor: "oklch(0.55 0.05 45)",
							stopOpacity: 0
						})]
					})] }),
					/* @__PURE__ */ jsx(CartesianGrid, {
						stroke: COLORS.grid,
						strokeDasharray: "3 6",
						vertical: false
					}),
					/* @__PURE__ */ jsx(XAxis, {
						dataKey: "mes",
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ jsx(YAxis, {
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false,
						width: 36
					}),
					/* @__PURE__ */ jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
					/* @__PURE__ */ jsx(Legend, {
						iconType: "circle",
						wrapperStyle: { fontSize: 12 }
					}),
					/* @__PURE__ */ jsx(Area, {
						type: "monotone",
						dataKey: "NPS Tradicional",
						stroke: "oklch(0.45 0.05 45)",
						strokeWidth: 2,
						fill: "url(#tradicional)"
					}),
					/* @__PURE__ */ jsx(Area, {
						type: "monotone",
						dataKey: "NPS Ajustado",
						stroke: "var(--color-primary)",
						strokeWidth: 3,
						fill: "url(#ajustado)"
					})
				]
			})
		})
	});
}
function VolumeChart({ data }) {
	return /* @__PURE__ */ jsx("div", {
		className: "h-64",
		children: /* @__PURE__ */ jsx(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ jsxs(BarChart, {
				data: data.map((d) => ({
					mes: fmtMes(d.mes_ano),
					Comentários: d.comentarios
				})),
				margin: {
					top: 8,
					right: 8,
					left: -10,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ jsx(CartesianGrid, {
						stroke: COLORS.grid,
						strokeDasharray: "3 6",
						vertical: false
					}),
					/* @__PURE__ */ jsx(XAxis, {
						dataKey: "mes",
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ jsx(YAxis, {
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false,
						width: 42
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						contentStyle: TOOLTIP_STYLE,
						formatter: (v) => fmtNum(v)
					}),
					/* @__PURE__ */ jsx(Bar, {
						dataKey: "Comentários",
						fill: "var(--color-primary)",
						radius: [
							8,
							8,
							0,
							0
						]
					})
				]
			})
		})
	});
}
function CategoryBar({ data, color = "var(--color-primary)" }) {
	const formatted = [...data].sort((a, b) => a.qtd - b.qtd).map((d) => ({
		name: d.categoria_modelo,
		value: d.qtd
	}));
	return /* @__PURE__ */ jsx("div", {
		style: { height: Math.max(260, formatted.length * 38) },
		children: /* @__PURE__ */ jsx(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ jsxs(BarChart, {
				layout: "vertical",
				data: formatted,
				margin: {
					top: 4,
					right: 40,
					left: 8,
					bottom: 4
				},
				children: [
					/* @__PURE__ */ jsx(CartesianGrid, {
						stroke: COLORS.grid,
						strokeDasharray: "3 6",
						horizontal: false
					}),
					/* @__PURE__ */ jsx(XAxis, {
						type: "number",
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ jsx(YAxis, {
						type: "category",
						dataKey: "name",
						tick: {
							fill: COLORS.foreground,
							fontSize: 12
						},
						tickLine: false,
						axisLine: false,
						width: 180
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						contentStyle: TOOLTIP_STYLE,
						formatter: (v) => fmtNum(v)
					}),
					/* @__PURE__ */ jsx(Bar, {
						dataKey: "value",
						fill: color,
						radius: [
							0,
							8,
							8,
							0
						],
						barSize: 20
					})
				]
			})
		})
	});
}
function GroupCompareBar({ data, keys }) {
	return /* @__PURE__ */ jsx("div", {
		className: "h-72",
		children: /* @__PURE__ */ jsx(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ jsxs(BarChart, {
				data,
				margin: {
					top: 8,
					right: 12,
					left: -10,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ jsx(CartesianGrid, {
						stroke: COLORS.grid,
						strokeDasharray: "3 6",
						vertical: false
					}),
					/* @__PURE__ */ jsx(XAxis, {
						dataKey: "grupo",
						tick: {
							fill: COLORS.axis,
							fontSize: 12
						},
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ jsx(YAxis, {
						tick: {
							fill: COLORS.axis,
							fontSize: 11
						},
						tickLine: false,
						axisLine: false,
						width: 40
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						contentStyle: TOOLTIP_STYLE,
						formatter: (v) => fmtNum(v, 1)
					}),
					/* @__PURE__ */ jsx(Legend, {
						iconType: "circle",
						wrapperStyle: { fontSize: 12 }
					}),
					keys.map((k) => /* @__PURE__ */ jsx(Bar, {
						dataKey: k.dataKey,
						name: k.label,
						fill: k.color,
						radius: [
							8,
							8,
							0,
							0
						],
						barSize: 28
					}, k.dataKey))
				]
			})
		})
	});
}
//#endregion
export { VolumeChart as a, TrendChart as i, GroupCompareBar as n, NpsDonut as r, CategoryBar as t };
