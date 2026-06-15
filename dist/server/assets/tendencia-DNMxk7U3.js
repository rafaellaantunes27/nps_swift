import { n as useNpsData } from "./npsDataContext-VKmOdn_1.js";
import { c as PageHeader, l as StatCard, n as fmtNum, o as Card, s as CardTitle } from "./format-BqGZyFOp.js";
import { a as VolumeChart, i as TrendChart } from "./charts-V1aDlj0v.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/tendencia.tsx?tsr-split=component
function TendenciaPage() {
	const { data } = useNpsData();
	const t = data.tendencia.map((x) => ({
		mes_ano: x.mes_ano,
		nps_tradicional: x.nps_tradicional,
		nps_ajustado: x.nps_ajustado,
		comentarios: x.comentarios
	}));
	const last = t[t.length - 1];
	const first = t[0];
	const delta = last.nps_ajustado - first.nps_ajustado;
	const maxMonth = [...t].sort((a, b) => b.nps_ajustado - a.nps_ajustado)[0];
	const minMonth = [...t].sort((a, b) => a.nps_ajustado - b.nps_ajustado)[0];
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Série temporal",
			title: "Tendência mensal",
			description: `Evolução de janeiro a ${new Date(last.mes_ano).toLocaleDateString("pt-BR", {
				month: "long",
				year: "numeric"
			})}.`
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6",
			children: [
				/* @__PURE__ */ jsx(StatCard, {
					accent: true,
					label: "NPS atual",
					value: fmtNum(last.nps_ajustado, 1),
					hint: "último mês fechado",
					trend: { value: `${delta >= 0 ? "+" : ""}${fmtNum(delta, 1)} no período` }
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Melhor mês",
					value: fmtNum(maxMonth.nps_ajustado, 1),
					hint: new Date(maxMonth.mes_ano).toLocaleDateString("pt-BR", {
						month: "long",
						year: "numeric"
					})
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Pior mês",
					value: fmtNum(minMonth.nps_ajustado, 1),
					hint: new Date(minMonth.mes_ano).toLocaleDateString("pt-BR", {
						month: "long",
						year: "numeric"
					})
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Comentários no mês",
					value: fmtNum(last.comentarios),
					hint: "volume mais recente"
				})
			]
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "mb-6",
			children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "NPS Tradicional × Ajustado",
				subtitle: "Linhas suavizadas com sombreamento de tendência"
			}), /* @__PURE__ */ jsx(TrendChart, { data: t })]
		}),
		/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
			title: "Volume mensal de comentários",
			subtitle: "Quantidade processada mês a mês"
		}), /* @__PURE__ */ jsx(VolumeChart, { data: t })] })
	] });
}
//#endregion
export { TendenciaPage as component };
