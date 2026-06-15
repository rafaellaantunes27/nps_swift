
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { data as defaultData } from "@/data/nps";
import { modelInfo, predictCategory, predictSentiment } from "@/lib/npsModel";

export type AnyRow = Record<string, string | number | boolean | null | undefined>;
type DashboardData = Omit<
  typeof defaultData,
  "resumo" | "gestao" | "regiao" | "lojas" | "tendencia" | "problemas" | "elogios" | "problemas_gestao" | "matriz" | "exemplos"
> & {
  resumo: AnyRow;
  gestao: AnyRow[];
  regiao: AnyRow[];
  lojas: AnyRow[];
  tendencia: AnyRow[];
  problemas: AnyRow[];
  elogios: AnyRow[];
  problemas_gestao: AnyRow[];
  matriz?: AnyRow[];
  inferencia?: AnyRow[];
  exemplos?: AnyRow[];
  sourceName?: string;
};

type NpsContextValue = {
  data: DashboardData;
  sourceName: string;
  isUploaded: boolean;
  rowCount: number;
  modelInfo: typeof modelInfo;
  loadCsvFile: (file: File) => Promise<void>;
  resetData: () => void;
  error?: string;
};

const NpsDataContext = createContext<NpsContextValue | null>(null);

const aliases = {
  nota: ["nota", "score", "nps", "avaliacao", "avaliação", "rating", "nota_nps", "resposta_nps"],
  comentario: ["comentario", "comentário", "comment", "texto", "resposta", "feedback", "comentario_cliente", "comentario_limpo_basico"],
  loja: ["centronv2", "loja", "store", "unidade", "centro", "codigo_loja", "nome_loja"],
  municipio: ["municipio", "município", "cidade", "city"],
  gestao: ["tipo_gestao", "gestao", "gestão", "gerencia", "gerência", "tipo_de_gestao", "perfil_gestao"],
  regiao: ["regiao_im", "regiao", "região", "regional", "cluster", "uf"],
  data: ["mes_ano", "data", "data_resposta", "data_pesquisa", "created_at", "dt_resposta", "mes"],
  peso: ["qtd_clientes", "peso", "avaliacoes_ponderadas", "quantidade", "qtde"]
};

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function findColumn(headers: string[], key: keyof typeof aliases) {
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalizeKey(h) }));
  const candidates = aliases[key].map(normalizeKey);
  return normalizedHeaders.find((h) => candidates.includes(h.norm))?.raw;
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return NaN;
  if (typeof value === "number") return value;
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace("%", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseCsv(text: string): AnyRow[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if ((ch === "," || ch === ";" || ch === "\t") && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += ch;
    }
  }
  row.push(current);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  if (rows.length < 2) return [];
  const headers = rows[0].map((h, i) => h.trim() || `coluna_${i + 1}`);
  return rows.slice(1).map((cells) => {
    const out: AnyRow = {};
    headers.forEach((h, i) => {
      const raw = cells[i] ?? "";
      const n = parseNumber(raw);
      out[h] = Number.isFinite(n) && raw.trim() !== "" && /^-?[\d\s.,%]+$/.test(raw.trim()) ? n : raw.trim();
    });
    return out;
  });
}

function npsClass(score: number) {
  if (!Number.isFinite(score)) return "sem nota";
  if (score >= 9) return "promotor";
  if (score >= 7) return "neutro";
  return "detrator";
}

function canonicalMonth(value: unknown) {
  if (!value) return "Sem data";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 7) + "-01";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [d, m, y] = s.slice(0, 10).split("/");
    return `${y}-${m}-01`;
  }
  if (/^\d{2}\/\d{4}/.test(s)) {
    const [m, y] = s.split("/");
    return `${y}-${m.padStart(2, "0")}-01`;
  }
  const date = new Date(s);
  if (!Number.isNaN(date.getTime())) return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
  return s;
}

function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0;
}

function summarize(rows: AnyRow[], groupBy?: string) {
  const groups = new Map<string, AnyRow[]>();
  if (groupBy) {
    for (const r of rows) {
      const k = String(r[groupBy] ?? "Não informado");
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(r);
    }
  } else {
    groups.set("__all__", rows);
  }

  const result: AnyRow[] = [];
  for (const [group, items] of groups) {
    const total = items.length || 1;
    const prom = items.filter((r) => r.classificacao_nps === "promotor").length;
    const neu = items.filter((r) => r.classificacao_nps === "neutro").length;
    const det = items.filter((r) => r.classificacao_nps === "detrator").length;
    const pos = items.filter((r) => r.sentimento_modelo === "positivo").length;
    const neg = items.filter((r) => r.sentimento_modelo === "negativo").length;
    const diverg = items.filter((r) => r.divergencia_nota_texto).length;
    const lowSent = items.filter((r) => r.baixa_confianca_sentimento).length;
    const lowCat = items.filter((r) => r.baixa_confianca_categoria).length;
    const nps = pct(prom, total) - pct(det, total);
    const scoreSent = pct(pos, total) - pct(neg, total);
    const row: AnyRow = {
      comentarios: items.length,
      avaliacoes_ponderadas: items.length,
      "promotores_%": pct(prom, total),
      "neutros_%": pct(neu, total),
      "detratores_%": pct(det, total),
      nps_tradicional: nps,
      "sentimento_positivo_%": pct(pos, total),
      "sentimento_negativo_%": pct(neg, total),
      score_sentimento: scoreSent,
      nps_ajustado: 0.7 * nps + 0.3 * scoreSent,
      "divergencia_%": pct(diverg, total),
      "baixa_conf_sent_%": pct(lowSent, total),
      "baixa_conf_cat_%": pct(lowCat, total)
    };
    if (groupBy) row[groupBy] = group;
    result.push(row);
  }
  return groupBy ? result : result[0];
}

function topCategories(rows: AnyRow[], filter: (r: AnyRow) => boolean, groupBy?: string) {
  const filtered = rows.filter(filter);
  const groups = new Map<string, AnyRow[]>();
  if (groupBy) {
    for (const r of filtered) {
      const g = String(r[groupBy] ?? "Não informado");
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(r);
    }
  } else {
    groups.set("__all__", filtered);
  }

  const out: AnyRow[] = [];
  for (const [group, items] of groups) {
    const total = items.length || 1;
    const counts = new Map<string, number>();
    for (const r of items) {
      const cat = String(r.categoria_modelo ?? "Outros / Genéricos");
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([cat, qtd]) => {
      const row: AnyRow = { categoria_modelo: cat, qtd, pct_no_grupo: pct(qtd, total) };
      if (groupBy) row[groupBy] = group;
      out.push(row);
    });
  }
  return out;
}

function representativeComments(rows: AnyRow[], sentiment: string, limit = 9) {
  return rows
    .filter((r) => r.sentimento_modelo === sentiment && String(r.comentario ?? "").length > 12)
    .sort((a, b) => Number(b.confianca_sentimento ?? 0) - Number(a.confianca_sentimento ?? 0))
    .slice(0, limit)
    .map((r) => ({
      loja: r.centronv2 ?? "Loja não informada",
      categoria_modelo: r.categoria_modelo,
      comentario: r.comentario,
      confianca_sentimento: r.confianca_sentimento,
    }));
}

function buildDashboard(rows: AnyRow[], sourceName: string): DashboardData {
  const headers = Object.keys(rows[0] ?? {});
  const colNota = findColumn(headers, "nota");
  const colComentario = findColumn(headers, "comentario");
  const colLoja = findColumn(headers, "loja");
  const colMunicipio = findColumn(headers, "municipio");
  const colGestao = findColumn(headers, "gestao");
  const colRegiao = findColumn(headers, "regiao");
  const colData = findColumn(headers, "data");

  const inferencia = rows.map((raw, i) => {
    const nota = parseNumber(colNota ? raw[colNota] : undefined);
    const classificacao = npsClass(nota);
    const comentario = colComentario ? raw[colComentario] : "";
    const sent = predictSentiment(comentario, classificacao);
    const cat = predictCategory(comentario);
    const divergencia =
      (classificacao === "promotor" && sent.label === "negativo") ||
      (classificacao === "detrator" && sent.label === "positivo") ||
      (classificacao === "neutro" && sent.label !== "neutro");

    return {
      ...raw,
      id_linha: i + 1,
      nota_nps: Number.isFinite(nota) ? nota : null,
      classificacao_nps: classificacao,
      comentario: String(comentario ?? ""),
      centronv2: String((colLoja ? raw[colLoja] : undefined) ?? "Loja não informada"),
      municipio: String((colMunicipio ? raw[colMunicipio] : undefined) ?? "Não informado"),
      tipo_gestao: String((colGestao ? raw[colGestao] : undefined) ?? "Não informado"),
      regiao_im: String((colRegiao ? raw[colRegiao] : undefined) ?? "Não informado"),
      mes_ano: canonicalMonth(colData ? raw[colData] : undefined),
      sentimento_modelo: sent.label,
      confianca_sentimento: sent.confidence,
      baixa_confianca_sentimento: sent.lowConfidence,
      categoria_modelo: cat.label,
      confianca_categoria: cat.confidence,
      baixa_confianca_categoria: cat.lowConfidence,
      divergencia_nota_texto: divergencia,
    };
  }).filter((r) => r.classificacao_nps !== "sem nota" || r.comentario);

  const resumo = summarize(inferencia) as DashboardData["resumo"];
  const gestao = summarize(inferencia, "tipo_gestao") as DashboardData["gestao"];
  const regiao = summarize(inferencia, "regiao_im") as DashboardData["regiao"];

  const lojaSummary = (summarize(inferencia, "centronv2") as AnyRow[]).map((l) => {
    const items = inferencia.filter((r) => r.centronv2 === l.centronv2);
    const topProb = topCategories(items, (r) => r.sentimento_modelo === "negativo").slice(0, 3).map((x) => x.categoria_modelo).join(", ");
    const topElo = topCategories(items, (r) => r.sentimento_modelo === "positivo").slice(0, 3).map((x) => x.categoria_modelo).join(", ");
    return {
      ...l,
      municipio: items[0]?.municipio ?? "Não informado",
      tipo_gestao: items[0]?.tipo_gestao ?? "Não informado",
      regiao_im: items[0]?.regiao_im ?? "Não informado",
      top_problemas: topProb || "Sem padrão claro",
      top_elogios: topElo || "Sem padrão claro",
      alerta_delta_nps: Math.abs(Number(l.nps_ajustado) - Number(l.nps_tradicional)) >= 8 ? "Sim" : "Não"
    };
  }).sort((a, b) => Number(b["nps_ajustado"]) - Number(a["nps_ajustado"])) as DashboardData["lojas"];

  const tendencia = (summarize(inferencia, "mes_ano") as AnyRow[])
    .filter((r) => r.mes_ano !== "Sem data")
    .sort((a, b) => String(a.mes_ano).localeCompare(String(b.mes_ano))) as DashboardData["tendencia"];

  const problemas = topCategories(inferencia, (r) => r.sentimento_modelo === "negativo" || r.classificacao_nps === "detrator")
    .slice(0, 12) as DashboardData["problemas"];
  const elogios = topCategories(inferencia, (r) => r.sentimento_modelo === "positivo" || r.classificacao_nps === "promotor")
    .slice(0, 12) as DashboardData["elogios"];
  const problemas_gestao = topCategories(inferencia, (r) => r.sentimento_modelo === "negativo" || r.classificacao_nps === "detrator", "tipo_gestao")
    .slice(0, 40) as DashboardData["problemas_gestao"];

  const matriz: AnyRow[] = [];
  const classes = ["detrator", "neutro", "promotor"];
  const cats = [...new Set(inferencia.map((r) => String(r.categoria_modelo)))];
  for (const cls of classes) {
    const items = inferencia.filter((r) => r.classificacao_nps === cls);
    const total = items.length || 1;
    for (const cat of cats) {
      const qtd = items.filter((r) => r.categoria_modelo === cat).length;
      matriz.push({ classificacao_nps: cls, categoria_modelo: cat, qtd, pct_linha: pct(qtd, total) });
    }
  }

  return {
    ...defaultData,
    resumo,
    gestao,
    regiao,
    lojas: lojaSummary,
    tendencia: tendencia.length ? tendencia : defaultData.tendencia,
    problemas,
    elogios,
    problemas_gestao,
    matriz,
    inferencia,
    sourceName
  };
}

export function NpsDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>({ ...defaultData, sourceName: "Base inferida padrão" });
  const [sourceName, setSourceName] = useState("Base inferida padrão");
  const [error, setError] = useState<string | undefined>();

  const value = useMemo<NpsContextValue>(() => ({
    data,
    sourceName,
    isUploaded: sourceName !== "Base inferida padrão",
    rowCount: Number(data.resumo?.comentarios ?? 0),
    modelInfo,
    error,
    async loadCsvFile(file: File) {
      setError(undefined);
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        setError("Não consegui ler linhas válidas nesse CSV. Confira o separador e o cabeçalho.");
        return;
      }
      const built = buildDashboard(rows, file.name);
      setData(built);
      setSourceName(file.name);
    },
    resetData() {
      setData({ ...defaultData, sourceName: "Base inferida padrão" });
      setSourceName("Base inferida padrão");
      setError(undefined);
    }
  }), [data, sourceName, error]);

  return <NpsDataContext.Provider value={value}>{children}</NpsDataContext.Provider>;
}

export function useNpsData() {
  const ctx = useContext(NpsDataContext);
  if (!ctx) throw new Error("useNpsData must be used inside NpsDataProvider");
  return ctx;
}
