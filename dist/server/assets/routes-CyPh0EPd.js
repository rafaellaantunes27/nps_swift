import { n as useNpsData } from "./npsDataContext-VKmOdn_1.js";
import { a as Badge, c as PageHeader, i as npsBand, l as StatCard, n as fmtNum, o as Card, r as fmtPct, s as CardTitle } from "./format-BqGZyFOp.js";
import { i as TrendChart, r as NpsDonut, t as CategoryBar } from "./charts-V1aDlj0v.js";
import { useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, FileSpreadsheet, Info, MessageSquareText, RotateCcw, Sparkles, TrendingUp, UploadCloud } from "lucide-react";
//#region src/components/dashboard/CsvUploadPanel.tsx
function CsvUploadPanel() {
	const { data, loadCsvFile, resetData, sourceName, isUploaded, rowCount, error, modelInfo } = useNpsData();
	const [loading, setLoading] = useState(false);
	const inputRef = useRef(null);
	function downloadInference() {
		const rows = data.inferencia ?? [];
		if (!rows.length) return;
		const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
		const escape = (value) => {
			const s = String(value ?? "");
			return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
		};
		const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
		const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `base_inferencia_${sourceName.replace(/[^a-z0-9_-]+/gi, "_")}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
	async function handleFile(file) {
		if (!file) return;
		setLoading(true);
		try {
			await loadCsvFile(file);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ jsx(Card, {
		className: "mb-6 border-primary/20 bg-[linear-gradient(135deg,var(--color-card)_0%,var(--color-primary-soft)_160%)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ jsx(Badge, {
							tone: "primary",
							children: "CSV dinâmico"
						}), /* @__PURE__ */ jsx(Badge, { children: isUploaded ? "Base enviada pelo site" : "Base padrão do projeto" })]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-3 text-xl font-bold tracking-tight",
						children: "Upload de CSV com inferência automática"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 max-w-3xl text-sm text-muted-foreground",
						children: "Ao anexar um CSV, o front identifica nota, comentário, loja, gestão, região e data; aplica os modelos incorporados de sentimento e categorização; calcula NPS tradicional, score textual, NPS ajustado e atualiza todos os painéis."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium",
								children: [
									/* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-3.5 w-3.5" }),
									" ",
									sourceName
								]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium",
								children: [
									/* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
									" ",
									fmtNum(rowCount),
									" comentários processados"
								]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium",
								children: ["Fórmula: ", modelInfo.npsFormula]
							})
						]
					}),
					error && /* @__PURE__ */ jsx("p", {
						className: "mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive",
						children: error
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex shrink-0 flex-wrap gap-2",
				children: [
					/* @__PURE__ */ jsx("input", {
						ref: inputRef,
						type: "file",
						accept: ".csv,text/csv",
						className: "hidden",
						onChange: (e) => handleFile(e.target.files?.[0])
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => inputRef.current?.click(),
						disabled: loading,
						className: "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60",
						children: [/* @__PURE__ */ jsx(UploadCloud, { className: "h-4 w-4" }), loading ? "Processando..." : "Anexar CSV"]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: downloadInference,
						disabled: !isUploaded || !data.inferencia?.length,
						className: "inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-soft px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-soft/80 disabled:opacity-50",
						children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4" }), "Baixar inferência"]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: resetData,
						className: "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:bg-accent",
						children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }), "Resetar"]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function OverviewPage() {
	const { data } = useNpsData();
	const r = data.resumo;
	const band = npsBand(r.nps_ajustado);
	const gap = r.nps_ajustado - r.nps_tradicional;
	const tendencia = data.tendencia.map((t) => ({
		mes_ano: t.mes_ano,
		nps_tradicional: t.nps_tradicional,
		nps_ajustado: t.nps_ajustado,
		comentarios: t.comentarios
	}));
	const topProblemas = data.problemas.slice(0, 7).map((p) => ({
		categoria_modelo: p.categoria_modelo,
		qtd: p.qtd
	}));
	const topElogios = data.elogios.slice(0, 7).map((p) => ({
		categoria_modelo: p.categoria_modelo,
		qtd: p.qtd
	}));
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Painel executivo",
			title: "Visão Executiva NPS",
			description: "Indicadores tradicionais combinados à camada de análise textual dos comentários para uma leitura mais precisa da experiência do cliente.",
			right: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ jsxs(Badge, {
					tone: "primary",
					children: [fmtNum(r.comentarios), " comentários"]
				}), /* @__PURE__ */ jsxs(Badge, {
					tone: band.tone,
					children: ["NPS ", band.label]
				})]
			})
		}),
		/* @__PURE__ */ jsx(CsvUploadPanel, {}),
		/* @__PURE__ */ jsxs("section", {
			className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(StatCard, {
					accent: true,
					label: "NPS Ajustado",
					value: fmtNum(r.nps_ajustado, 1),
					hint: "70% nota + 30% análise textual",
					trend: { value: `${gap >= 0 ? "+" : ""}${fmtNum(gap, 1)} vs tradicional` }
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "NPS Tradicional",
					value: fmtNum(r.nps_tradicional, 1),
					hint: "nota original 0–10"
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Score textual",
					value: fmtNum(r.score_sentimento, 1),
					hint: "positivo menos negativo"
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: "Divergência",
					value: fmtPct(r["divergencia_%"], 1),
					hint: "nota e comentário discordam"
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "lg:col-span-1",
				children: [/* @__PURE__ */ jsx(CardTitle, {
					title: "Distribuição NPS",
					subtitle: "Promotores, neutros e detratores"
				}), /* @__PURE__ */ jsx(NpsDonut, {
					promotores: r["promotores_%"],
					neutros: r["neutros_%"],
					detratores: r["detratores_%"],
					centerValue: fmtNum(r.nps_tradicional, 0)
				})]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ jsx(CardTitle, {
					title: "Evolução mensal do NPS",
					subtitle: "Comparação entre NPS tradicional e ajustado",
					right: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary" }), " Ajustado"]
						}), /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-muted-foreground/60" }), " Tradicional"]
						})]
					})
				}), /* @__PURE__ */ jsx(TrendChart, { data: tendencia })]
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(InsightCard, {
					icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
					title: "Promotores",
					value: fmtPct(r["promotores_%"]),
					desc: "dos clientes recomendam a marca"
				}),
				/* @__PURE__ */ jsx(InsightCard, {
					icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
					title: "Sentimento positivo",
					value: fmtPct(r["sentimento_positivo_%"]),
					desc: "dos comentários têm tom positivo"
				}),
				/* @__PURE__ */ jsx(InsightCard, {
					icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
					title: "Detratores",
					value: fmtPct(r["detratores_%"]),
					desc: "exigem ação prioritária"
				}),
				/* @__PURE__ */ jsx(InsightCard, {
					icon: /* @__PURE__ */ jsx(MessageSquareText, { className: "h-4 w-4" }),
					title: "Volume analisado",
					value: fmtNum(r.comentarios),
					desc: "comentários processados"
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Principais problemas",
				subtitle: "Categorias mais frequentes em comentários negativos"
			}), /* @__PURE__ */ jsx(CategoryBar, {
				data: topProblemas,
				color: "oklch(0.5 0.05 40)"
			})] }), /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardTitle, {
				title: "Principais elogios",
				subtitle: "Categorias mais frequentes em comentários positivos"
			}), /* @__PURE__ */ jsx(CategoryBar, { data: topElogios })] })]
		})
	] });
}
function InsightCard({ icon, title, value, desc }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-3xl border border-border bg-card p-5 shadow-soft",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary",
					children: icon
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground",
					children: title
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 font-display text-2xl font-bold tracking-tight",
				children: value
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: desc
			})
		]
	});
}
//#endregion
export { OverviewPage as component };
