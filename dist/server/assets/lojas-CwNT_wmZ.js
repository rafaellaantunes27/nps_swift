import { n as useNpsData } from "./npsDataContext-VKmOdn_1.js";
import { a as Badge, c as PageHeader, i as npsBand, n as fmtNum, o as Card, s as CardTitle } from "./format-BqGZyFOp.js";
import { useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowUpDown, Search } from "lucide-react";
//#region src/routes/lojas.tsx?tsr-split=component
function LojasPage() {
	const { data } = useNpsData();
	const [q, setQ] = useState("");
	const [gestao, setGestao] = useState("Todas");
	const [regiao, setRegiao] = useState("Todas");
	const [sortKey, setSortKey] = useState("nps_ajustado");
	const [asc, setAsc] = useState(false);
	const gestoes = useMemo(() => ["Todas", ...new Set(data.lojas.map((l) => l.tipo_gestao))], [data.lojas]);
	const regioes = useMemo(() => ["Todas", ...new Set(data.lojas.map((l) => l.regiao_im))], [data.lojas]);
	const filtered = useMemo(() => {
		const ql = q.toLowerCase().trim();
		return data.lojas.slice().filter((l) => gestao === "Todas" ? true : l.tipo_gestao === gestao).filter((l) => regiao === "Todas" ? true : l.regiao_im === regiao).filter((l) => ql === "" ? true : l.centronv2.toLowerCase().includes(ql) || l.municipio.toLowerCase().includes(ql)).sort((a, b) => {
			const av = a[sortKey];
			const bv = b[sortKey];
			return asc ? av - bv : bv - av;
		});
	}, [
		q,
		gestao,
		regiao,
		sortKey,
		asc
	]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Ranking",
			title: "Performance por loja",
			description: "Ordene, filtre e busque entre todas as lojas para identificar líderes e oportunidades."
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "mb-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-3 sm:grid-cols-[1fr_auto_auto]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx("input", {
							type: "search",
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Buscar por loja ou município",
							className: "w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
						})]
					}),
					/* @__PURE__ */ jsx(Select, {
						value: gestao,
						onChange: setGestao,
						options: gestoes,
						label: "Gestão"
					}),
					/* @__PURE__ */ jsx(Select, {
						value: regiao,
						onChange: setRegiao,
						options: regioes,
						label: "Região"
					})
				]
			}), /* @__PURE__ */ jsxs("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"Mostrando ",
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-foreground",
						children: filtered.length
					}),
					" de ",
					data.lojas.length,
					" lojas"
				]
			})]
		}),
		/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
			title: "Lojas",
			subtitle: "Clique nos cabeçalhos para reordenar"
		}), /* @__PURE__ */ jsxs("div", {
			className: "overflow-x-auto -mx-2",
			children: [/* @__PURE__ */ jsxs("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ jsx(Th, { children: "Loja" }),
						/* @__PURE__ */ jsx(Th, { children: "Município" }),
						/* @__PURE__ */ jsx(Th, { children: "Gestão" }),
						/* @__PURE__ */ jsx(ThSort, {
							active: sortKey === "comentarios",
							asc,
							onClick: () => toggle("comentarios"),
							children: "Comentários"
						}),
						/* @__PURE__ */ jsx(ThSort, {
							active: sortKey === "nps_tradicional",
							asc,
							onClick: () => toggle("nps_tradicional"),
							children: "NPS Trad."
						}),
						/* @__PURE__ */ jsx(ThSort, {
							active: sortKey === "nps_ajustado",
							asc,
							onClick: () => toggle("nps_ajustado"),
							children: "NPS Ajust."
						}),
						/* @__PURE__ */ jsx(Th, { children: "Top problemas" }),
						/* @__PURE__ */ jsx(Th, { children: "Top elogios" }),
						/* @__PURE__ */ jsx(Th, { children: "Alerta" }),
						/* @__PURE__ */ jsx(Th, { children: "Faixa" })
					]
				}) }), /* @__PURE__ */ jsx("tbody", { children: filtered.slice(0, 80).map((l) => {
					const band = npsBand(l.nps_ajustado);
					return /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-border/60 last:border-0 hover:bg-muted/40",
						children: [
							/* @__PURE__ */ jsx(Td, {
								className: "font-semibold",
								children: l.centronv2
							}),
							/* @__PURE__ */ jsx(Td, {
								className: "text-muted-foreground",
								children: l.municipio
							}),
							/* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Badge, { children: l.tipo_gestao }) }),
							/* @__PURE__ */ jsx(Td, {
								right: true,
								children: fmtNum(l.comentarios)
							}),
							/* @__PURE__ */ jsx(Td, {
								right: true,
								className: "tabular-nums",
								children: fmtNum(l.nps_tradicional, 1)
							}),
							/* @__PURE__ */ jsx(Td, {
								right: true,
								className: "tabular-nums font-semibold",
								children: fmtNum(l.nps_ajustado, 1)
							}),
							/* @__PURE__ */ jsx(Td, {
								className: "max-w-[220px] text-xs text-muted-foreground",
								children: String(l.top_problemas ?? "Sem padrão claro")
							}),
							/* @__PURE__ */ jsx(Td, {
								className: "max-w-[220px] text-xs text-muted-foreground",
								children: String(l.top_elogios ?? "Sem padrão claro")
							}),
							/* @__PURE__ */ jsx(Td, { children: String(l.alerta_delta_nps ?? "Não") === "Sim" ? /* @__PURE__ */ jsx(Badge, {
								tone: "warning",
								children: "Diferença alta"
							}) : /* @__PURE__ */ jsx(Badge, { children: "OK" }) }),
							/* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Badge, {
								tone: band.tone,
								children: band.label
							}) })
						]
					}, l.centronv2);
				}) })]
			}), filtered.length > 80 && /* @__PURE__ */ jsx("p", {
				className: "px-3 py-3 text-xs text-muted-foreground",
				children: "Exibindo as 80 primeiras. Refine os filtros para reduzir a lista."
			})]
		})] })
	] });
	function toggle(k) {
		if (k === sortKey) setAsc((s) => !s);
		else {
			setSortKey(k);
			setAsc(false);
		}
	}
}
function Select({ value, onChange, options, label }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("select", {
			value,
			onChange: (e) => onChange(e.target.value),
			className: "bg-transparent outline-none font-medium",
			children: options.map((o) => /* @__PURE__ */ jsx("option", {
				value: o,
				children: o
			}, o))
		})]
	});
}
function Th({ children }) {
	return /* @__PURE__ */ jsx("th", {
		className: "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
		children
	});
}
function ThSort({ children, active, asc, onClick }) {
	return /* @__PURE__ */ jsx("th", {
		className: "px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
		children: /* @__PURE__ */ jsxs("button", {
			onClick,
			className: `inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? "text-primary" : ""}`,
			children: [
				children,
				/* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" }),
				active && /* @__PURE__ */ jsx("span", {
					className: "text-[10px]",
					children: asc ? "↑" : "↓"
				})
			]
		})
	});
}
function Td({ children, right, className = "" }) {
	return /* @__PURE__ */ jsx("td", {
		className: `px-3 py-3 ${right ? "text-right" : ""} ${className}`,
		children
	});
}
//#endregion
export { LojasPage as component };
