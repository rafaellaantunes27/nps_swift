import { n as useNpsData } from "./npsDataContext-VKmOdn_1.js";
import { c as PageHeader, n as fmtNum, o as Card, r as fmtPct, s as CardTitle } from "./format-BqGZyFOp.js";
import { t as CategoryBar } from "./charts-V1aDlj0v.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/categorias.tsx?tsr-split=component
function CategoriasPage() {
	const { data } = useNpsData();
	const problemas = data.problemas.map((p) => ({
		categoria_modelo: p.categoria_modelo,
		qtd: p.qtd
	}));
	const elogios = data.elogios.map((p) => ({
		categoria_modelo: p.categoria_modelo,
		qtd: p.qtd
	}));
	const totalProb = problemas.reduce((s, p) => s + p.qtd, 0);
	const totalElo = elogios.reduce((s, p) => s + p.qtd, 0);
	const byGroup = /* @__PURE__ */ new Map();
	for (const r of data.problemas_gestao) {
		const g = r.tipo_gestao;
		if (!byGroup.has(g)) byGroup.set(g, []);
		byGroup.get(g).push({
			categoria: r.categoria_modelo,
			qtd: r.qtd,
			pct: r.pct_no_grupo
		});
	}
	const matriz = data.matriz ?? [];
	const categoriasMatriz = [...new Set(matriz.map((m) => m.categoria_modelo))];
	const classesNps = [
		"detrator",
		"neutro",
		"promotor"
	];
	const exemplosBase = data.inferencia ?? data.exemplos ?? [];
	const exemplosNegativos = exemplosBase.filter((r) => r.sentimento_modelo === "negativo" && String(r.comentario ?? "").length > 12).slice(0, 6);
	const exemplosPositivos = exemplosBase.filter((r) => r.sentimento_modelo === "positivo" && String(r.comentario ?? "").length > 12).slice(0, 6);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Análise textual",
			title: "Categorias de problemas e elogios",
			description: "Temas extraídos automaticamente dos comentários para guiar planos de ação."
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Problemas mais citados",
				subtitle: `${fmtNum(totalProb)} menções classificadas`
			}), /* @__PURE__ */ jsx(CategoryBar, {
				data: problemas,
				color: "oklch(0.5 0.05 40)"
			})] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Elogios mais citados",
				subtitle: `${fmtNum(totalElo)} menções classificadas`
			}), /* @__PURE__ */ jsx(CategoryBar, { data: elogios })] })]
		}),
		/* @__PURE__ */ jsx("section", {
			className: "mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3",
			children: [...byGroup.entries()].map(([grupo, items]) => /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: grupo,
				subtitle: "% de cada categoria dentro do grupo"
			}), /* @__PURE__ */ jsx("ul", {
				className: "space-y-3",
				children: items.sort((a, b) => b.qtd - a.qtd).slice(0, 6).map((it) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-baseline justify-between text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-medium truncate pr-2",
						children: it.categoria
					}), /* @__PURE__ */ jsxs("span", {
						className: "tabular-nums text-muted-foreground",
						children: [
							fmtNum(it.qtd),
							" · ",
							fmtPct(it.pct, 1)
						]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full rounded-full bg-primary",
						style: { width: `${Math.min(100, it.pct * 2.5)}%` }
					})
				})] }, it.categoria))
			})] }, grupo))
		}),
		matriz.length > 0 && /* @__PURE__ */ jsxs(Card, {
			className: "mt-6",
			children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Matriz NPS × categoria",
				subtitle: "Classifica detratores, neutros e promotores dentro dos tipos de comentário"
			}), /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto -mx-2",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[820px] text-sm",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-border",
						children: [/* @__PURE__ */ jsx("th", {
							className: "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Classificação NPS"
						}), categoriasMatriz.map((cat) => /* @__PURE__ */ jsx("th", {
							className: "px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
							children: cat
						}, cat))]
					}) }), /* @__PURE__ */ jsx("tbody", { children: classesNps.map((cls) => /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-border/60 last:border-0 hover:bg-muted/40",
						children: [/* @__PURE__ */ jsx("td", {
							className: "px-3 py-3 font-semibold capitalize",
							children: cls
						}), categoriasMatriz.map((cat) => {
							const cell = matriz.find((m) => m.classificacao_nps === cls && m.categoria_modelo === cat);
							return /* @__PURE__ */ jsxs("td", {
								className: "px-3 py-3 text-right tabular-nums",
								children: [/* @__PURE__ */ jsx("span", {
									className: cls === "detrator" && Number(cell?.qtd ?? 0) > 0 ? "font-bold text-destructive" : "font-medium",
									children: fmtNum(Number(cell?.qtd ?? 0))
								}), /* @__PURE__ */ jsxs("span", {
									className: "ml-1 text-xs text-muted-foreground",
									children: [
										"(",
										fmtPct(Number(cell?.pct_linha ?? 0), 1),
										")"
									]
								})]
							}, cat);
						})]
					}, cls)) })]
				})
			})]
		}),
		(exemplosNegativos.length > 0 || exemplosPositivos.length > 0) && /* @__PURE__ */ jsxs("section", {
			className: "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Exemplos representativos de problemas",
				subtitle: "Comentários negativos com maior sinal textual"
			}), /* @__PURE__ */ jsx(CommentList, { children: exemplosNegativos.map((r, i) => /* @__PURE__ */ jsx(CommentItem, {
				categoria: String(r.categoria_modelo ?? ""),
				loja: String(r.centronv2 ?? ""),
				children: String(r.comentario ?? "")
			}, i)) })] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Exemplos representativos de elogios",
				subtitle: "Comentários positivos para leitura executiva"
			}), /* @__PURE__ */ jsx(CommentList, { children: exemplosPositivos.map((r, i) => /* @__PURE__ */ jsx(CommentItem, {
				categoria: String(r.categoria_modelo ?? ""),
				loja: String(r.centronv2 ?? ""),
				children: String(r.comentario ?? "")
			}, i)) })] })]
		})
	] });
}
function CommentList({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-3",
		children
	});
}
function CommentItem({ children, categoria, loja }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-border bg-background p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ jsx("span", {
				className: "rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary",
				children: categoria
			}), /* @__PURE__ */ jsx("span", {
				className: "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground",
				children: loja
			})]
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-sm leading-relaxed text-muted-foreground",
			children
		})]
	});
}
//#endregion
export { CategoriasPage as component };
