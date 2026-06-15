import { n as useNpsData } from "./npsDataContext-VKmOdn_1.js";
import { a as Badge, c as PageHeader, l as StatCard, n as fmtNum, o as Card, r as fmtPct, s as CardTitle } from "./format-BqGZyFOp.js";
import { n as GroupCompareBar } from "./charts-V1aDlj0v.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/comparativos.tsx?tsr-split=component
function ComparativosPage() {
	const { data } = useNpsData();
	const gestao = data.gestao.map((g) => ({
		grupo: g.tipo_gestao,
		"NPS Tradicional": Number(g.nps_tradicional.toFixed(1)),
		"NPS Ajustado": Number(g.nps_ajustado.toFixed(1)),
		"Score Textual": Number(g.score_sentimento.toFixed(1))
	}));
	const regiao = data.regiao.map((g) => ({
		grupo: g.regiao_im,
		"NPS Tradicional": Number(g.nps_tradicional.toFixed(1)),
		"NPS Ajustado": Number(g.nps_ajustado.toFixed(1)),
		"Score Textual": Number(g.score_sentimento.toFixed(1))
	}));
	const regular = data.gestao.find((g) => String(g.tipo_gestao).toLowerCase().includes("regular"));
	const germinare = data.gestao.find((g) => String(g.tipo_gestao).toLowerCase().includes("germinare") || String(g.tipo_gestao).toLowerCase().includes("tocadora"));
	const gapAjustado = regular && germinare ? Number(germinare.nps_ajustado) - Number(regular.nps_ajustado) : 0;
	const leitura = gapAjustado >= 0 ? "Germinare/Tocadora aparece acima ou igual ao grupo Regular no NPS ajustado." : "Regular aparece acima de Germinare/Tocadora no NPS ajustado; vale investigar categorias e comentários.";
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Recortes",
			title: "Comparativos por gestão e região",
			description: "Veja como o NPS tradicional, o ajustado e o score textual variam entre tipos de gestão e regiões."
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ jsx(StatCard, {
					accent: true,
					label: "Gap Germinare × Regular",
					value: `${gapAjustado >= 0 ? "+" : ""}${fmtNum(gapAjustado, 1)}`,
					hint: "diferença no NPS ajustado"
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Regular",
					value: regular ? fmtNum(regular.nps_ajustado, 1) : "—",
					hint: "NPS ajustado do grupo"
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Germinare/Tocadora",
					value: germinare ? fmtNum(germinare.nps_ajustado, 1) : "—",
					hint: leitura
				})
			]
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "mb-6",
			children: [
				/* @__PURE__ */ jsx(CardTitle, {
					title: "Por tipo de gestão",
					subtitle: "Foco da análise: Germinare/Tocadora × Regular/externos",
					right: /* @__PURE__ */ jsx(Badge, {
						tone: gapAjustado >= 0 ? "success" : "warning",
						children: gapAjustado >= 0 ? "vantagem Germinare" : "atenção Germinare"
					})
				}),
				/* @__PURE__ */ jsx(GroupCompareBar, {
					data: gestao,
					keys: [
						{
							dataKey: "NPS Tradicional",
							label: "NPS Tradicional",
							color: "oklch(0.55 0.05 45)"
						},
						{
							dataKey: "NPS Ajustado",
							label: "NPS Ajustado",
							color: "var(--color-primary)"
						},
						{
							dataKey: "Score Textual",
							label: "Score textual",
							color: "oklch(0.78 0.12 60)"
						}
					]
				}),
				/* @__PURE__ */ jsx(DetailTable, {
					headers: [
						"Gestão",
						"Comentários",
						"Promotores",
						"Detratores",
						"NPS Trad.",
						"NPS Ajust.",
						"Score textual"
					],
					rows: data.gestao.map((g) => [
						g.tipo_gestao,
						fmtNum(g.comentarios),
						fmtPct(g["promotores_%"]),
						fmtPct(g["detratores_%"]),
						fmtNum(g.nps_tradicional, 1),
						fmtNum(g.nps_ajustado, 1),
						fmtNum(g.score_sentimento, 1)
					])
				})
			]
		}),
		/* @__PURE__ */ jsxs(Card, { children: [
			/* @__PURE__ */ jsx(CardTitle, {
				title: "Por região",
				subtitle: "Comparativo Capital, Interior, Litoral, Sul/Sudeste"
			}),
			/* @__PURE__ */ jsx(GroupCompareBar, {
				data: regiao,
				keys: [
					{
						dataKey: "NPS Tradicional",
						label: "NPS Tradicional",
						color: "oklch(0.55 0.05 45)"
					},
					{
						dataKey: "NPS Ajustado",
						label: "NPS Ajustado",
						color: "var(--color-primary)"
					},
					{
						dataKey: "Score Textual",
						label: "Score textual",
						color: "oklch(0.78 0.12 60)"
					}
				]
			}),
			/* @__PURE__ */ jsx(DetailTable, {
				headers: [
					"Região",
					"Comentários",
					"Promotores",
					"Detratores",
					"NPS Trad.",
					"NPS Ajust.",
					"Score textual"
				],
				rows: data.regiao.map((g) => [
					g.regiao_im,
					fmtNum(g.comentarios),
					fmtPct(g["promotores_%"]),
					fmtPct(g["detratores_%"]),
					fmtNum(g.nps_tradicional, 1),
					fmtNum(g.nps_ajustado, 1),
					fmtNum(g.score_sentimento, 1)
				])
			})
		] })
	] });
}
function DetailTable({ headers, rows }) {
	return /* @__PURE__ */ jsx("div", {
		className: "mt-6 overflow-x-auto -mx-2",
		children: /* @__PURE__ */ jsxs("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", {
				className: "border-b border-border",
				children: headers.map((h, i) => /* @__PURE__ */ jsx("th", {
					className: `px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`,
					children: h
				}, h))
			}) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row, ri) => /* @__PURE__ */ jsx("tr", {
				className: "border-b border-border/60 last:border-0 hover:bg-muted/40",
				children: row.map((cell, ci) => /* @__PURE__ */ jsx("td", {
					className: `px-3 py-3 ${ci === 0 ? "text-left font-semibold" : "text-right font-medium tabular-nums"}`,
					children: cell
				}, ci))
			}, ri)) })]
		})
	});
}
//#endregion
export { ComparativosPage as component };
