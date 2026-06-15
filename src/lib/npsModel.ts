
export type SentimentLabel = "positivo" | "neutro" | "negativo";
export type CategoryLabel =
  | "Atendimento / Loja física"
  | "Preço / Promoções"
  | "Qualidade do produto"
  | "App / Site / Pagamento"
  | "Entrega / Pedido digital"
  | "Outros / Genéricos";

type ScoredLabel<T extends string> = {
  label: T;
  confidence: number;
  lowConfidence: boolean;
  scores: Record<string, number>;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countMatches = (text: string, terms: string[]) =>
  terms.reduce((score, term) => {
    const normalizedTerm = normalize(term);
    const re = new RegExp(`(^|\\s)${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "g");
    return score + (text.match(re)?.length ?? 0);
  }, 0);

const positiveTerms = [
  "bom","boa","otimo","otima","excelente","maravilhoso","maravilhosa","perfeito","perfeita",
  "gostei","adoro","amei","satisfeito","satisfeita","recomendo","rapido","rapida","qualidade",
  "atencioso","atenciosa","educado","educada","limpo","limpa","organizado","organizada",
  "facil","pratico","pratica","promoção","promocao","barato","preco bom","fresco","fresca"
];

const negativeTerms = [
  "ruim","pessimo","pessima","horrivel","caro","cara","demora","demorado","demorada",
  "fila","atraso","atrasado","atrasada","fraco","fraca","problema","reclamar","reclamacao",
  "reclamação","nunca","nao gostei","não gostei","decepcionado","decepcionada","estragado",
  "estragada","vencido","vencida","gordura","duro","dura","seco","seca","mal atendimento",
  "sem estoque","cancelado","cancelada","erro","falha","estorno","faltou","falta","sujo","suja"
];

const categoryTerms: Record<CategoryLabel, string[]> = {
  "Preço / Promoções": [
    "preco","precos","valor","caro","cara","barato","barata","promocao","promocoes","desconto",
    "oferta","cupom","custo beneficio","custo","beneficio","cashback"
  ],
  "Atendimento / Loja física": [
    "atendimento","atendente","funcionario","funcionaria","caixa","fila","loja","limpeza",
    "organizada","organizado","desorganizada","desorganizado","balcao","vendedor","vendedora",
    "espera","equipe","educado","educada","grosseiro","grosseira"
  ],
  "Qualidade do produto": [
    "produto","carne","frango","peixe","qualidade","sabor","gosto","textura","corte","gordura",
    "validade","vencido","vencida","estragado","estragada","duro","dura","seco","seca","congelado",
    "congelada","fresco","fresca"
  ],
  "App / Site / Pagamento": [
    "app","aplicativo","site","pagamento","pix","cartao","cartão","checkout","sistema",
    "login","senha","cupom","online","internet","erro","travou","travando"
  ],
  "Entrega / Pedido digital": [
    "entrega","pedido","delivery","retirada","atraso","atrasado","atrasada","motoboy",
    "entregador","recebi","recebido","cancelado","cancelada","estorno","frete"
  ],
  "Outros / Genéricos": []
};

export function predictSentiment(comment: unknown, npsClass?: string): ScoredLabel<SentimentLabel> {
  const text = normalize(comment);
  if (!text) {
    const fallback = npsClass === "promotor" ? "positivo" : npsClass === "detrator" ? "negativo" : "neutro";
    return { label: fallback, confidence: 0.45, lowConfidence: true, scores: { positivo: 0, neutro: 0, negativo: 0 } };
  }

  const pos = countMatches(text, positiveTerms);
  const neg = countMatches(text, negativeTerms);
  let neu = text.split(" ").length <= 3 ? 1 : 0;

  // Regras para comentários mistos: falha concreta pesa mais que elogio genérico.
  const hasOperationalFailure = /(atras|erro|estorno|vencid|estragad|fila|sem estoque|cancelad|gordura|duro|seca)/.test(text);
  const adjustedNeg = neg + (hasOperationalFailure ? 1.15 : 0);
  const adjustedPos = pos;

  let label: SentimentLabel = "neutro";
  if (adjustedPos - adjustedNeg >= 1) label = "positivo";
  else if (adjustedNeg - adjustedPos >= 1) label = "negativo";

  if (label === "neutro" && npsClass) {
    if (npsClass === "promotor" && adjustedNeg === 0) label = "positivo";
    if (npsClass === "detrator" && adjustedPos === 0) label = "negativo";
  }

  const diff = Math.abs(adjustedPos - adjustedNeg);
  const evidence = adjustedPos + adjustedNeg + neu;
  const confidence = Math.max(0.42, Math.min(0.96, 0.48 + diff * 0.18 + Math.min(evidence, 4) * 0.05));
  return {
    label,
    confidence,
    lowConfidence: confidence < 0.62 || text.split(" ").length < 4,
    scores: { positivo: adjustedPos, neutro: neu, negativo: adjustedNeg }
  };
}

export function predictCategory(comment: unknown): ScoredLabel<CategoryLabel> {
  const text = normalize(comment);
  const raw: Record<string, number> = {};
  for (const [cat, terms] of Object.entries(categoryTerms)) {
    raw[cat] = countMatches(text, terms);
  }
  const entries = Object.entries(raw).sort((a, b) => b[1] - a[1]);
  const [bestLabel, bestScore] = entries[0] ?? ["Outros / Genéricos", 0];
  const second = entries[1]?.[1] ?? 0;
  const label = bestScore > 0 ? (bestLabel as CategoryLabel) : "Outros / Genéricos";
  const confidence = bestScore <= 0 ? 0.38 : Math.max(0.48, Math.min(0.95, 0.48 + bestScore * 0.12 + (bestScore - second) * 0.08));
  return {
    label,
    confidence,
    lowConfidence: confidence < 0.6 || label === "Outros / Genéricos",
    scores: raw
  };
}

export const modelInfo = {
  sentiment: {
    name: "Modelo de sentimento incorporado ao front",
    labels: ["positivo", "neutro", "negativo"],
    output: ["sentimento_modelo", "confianca_sentimento", "baixa_confianca_sentimento"],
  },
  category: {
    name: "Modelo de categorização incorporado ao front",
    labels: Object.keys(categoryTerms),
    output: ["categoria_modelo", "confianca_categoria", "baixa_confianca_categoria"],
  },
  npsFormula: "NPS_ajustado = 0,7 × NPS_tradicional + 0,3 × Score_sentimento",
};
