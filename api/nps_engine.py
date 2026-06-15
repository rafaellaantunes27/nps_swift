from __future__ import annotations

import csv
import gzip
import io
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

AnyRow = dict[str, Any]

ORDER_NPS = ["detrator", "neutro", "promotor"]
DEFAULT_WEIGHT = 1.0

ALIASES = {
    "nota": ["nota", "score", "nps", "avaliacao", "avaliação", "rating", "nota_nps", "resposta_nps"],
    "classificacao": ["classificacao", "classificação", "classe", "classe_nps", "classificacao_nps", "tipo_nps", "perfil_nps"],
    "comentario": ["comentario", "comentário", "comment", "texto", "resposta", "feedback", "comentario_cliente", "comentario_limpo_basico"],
    "loja": ["centronv2", "loja", "store", "unidade", "centro", "codigo_loja", "nome_loja"],
    "municipio": ["municipio", "município", "cidade", "city"],
    "uf": ["uf", "estado"],
    "gestao": ["tipo_gestao", "gestao", "gestão", "gerencia", "gerência", "tipo_de_gestao", "perfil_gestao"],
    "flag": ["flag", "tipo_flag", "grupo", "tipo_loja"],
    "regiao": ["regiao_im", "regiao", "região", "regional", "cluster"],
    "data": ["mes_ano", "data", "data_resposta", "data_pesquisa", "data_avaliacao", "created_at", "dt_resposta", "mes"],
    "peso": ["qtd_clientes", "peso", "avaliacoes_ponderadas", "quantidade", "qtde", "qtd", "volume"],
    "transacoes": ["transacoes", "transações", "transactions", "qtd_transacoes"],
    "sentimento": ["sentimento_modelo", "sentimento", "sentiment", "classe_sentimento"],
    "confianca_sentimento": ["confianca_sentimento", "conf_sentimento", "prob_sentimento", "score_sentimento_modelo"],
    "baixa_conf_sentimento": ["baixa_confianca_sentimento", "flag_baixa_confianca_sentimento", "baixa_conf_sent"],
    "categoria": ["categoria_modelo", "categoria", "categoria_final", "topico_categoria", "category"],
    "confianca_categoria": ["confianca_categoria", "conf_categoria", "prob_categoria"],
    "baixa_conf_categoria": ["baixa_confianca_categoria", "flag_baixa_confianca_categoria", "baixa_conf_cat"],
    "divergencia": ["divergencia_nota_texto", "divergencia", "flag_divergencia"],
}

# Mesmas categorias documentadas no notebook de categorias.
CATEGORY_CRITERIA = {
    "Atendimento / Loja física": "Atendimento, funcionários, organização da loja, caixa, fila e experiência presencial.",
    "Preço / Promoções": "Preço, promoções, descontos, valor percebido, custo-benefício e comparação com mercado.",
    "Qualidade do produto": "Qualidade, sabor, textura, corte, gordura, validade e conservação dos produtos.",
    "App / Site / Pagamento": "App, site, pagamento, estoque online, jornada digital e problemas no checkout.",
    "Entrega / Pedido digital": "Entrega, pedido, retirada, produto não recebido, atraso, estorno e problemas operacionais.",
    "Outros / Genéricos": "Comentários sem tema acionável ou que não se encaixam nas categorias anteriores.",
}

POSITIVE_TERMS = [
    "bom", "boa", "bons", "boas", "otimo", "otima", "ótimo", "ótima", "excelente", "maravilhoso", "maravilhosa",
    "perfeito", "perfeita", "gostei", "adoro", "amei", "satisfeito", "satisfeita", "recomendo", "rapido", "rápido",
    "rapida", "rápida", "qualidade", "atencioso", "atenciosa", "educado", "educada", "limpo", "limpa", "organizado",
    "organizada", "facil", "fácil", "pratico", "prático", "pratica", "prática", "promoção", "promocao", "barato",
    "barata", "preco bom", "preço bom", "fresco", "fresca", "agradavel", "agradável", "funciona", "rápida entrega",
]

NEGATIVE_TERMS = [
    "ruim", "pessimo", "péssimo", "pessima", "péssima", "horrivel", "horrível", "caro", "cara", "demora",
    "demorado", "demorada", "fila", "atraso", "atrasado", "atrasada", "fraco", "fraca", "problema", "reclamar",
    "reclamacao", "reclamação", "nunca", "nao gostei", "não gostei", "decepcionado", "decepcionada", "estragado",
    "estragada", "vencido", "vencida", "gordura", "duro", "dura", "seco", "seca", "mal atendimento", "sem estoque",
    "cancelado", "cancelada", "erro", "falha", "estorno", "faltou", "falta", "sujo", "suja", "absurdo",
]

CATEGORY_TERMS: dict[str, list[str]] = {
    "Preço / Promoções": [
        "preco", "preço", "precos", "preços", "valor", "caro", "cara", "barato", "barata", "promocao", "promoção",
        "promocoes", "promoções", "desconto", "oferta", "cupom", "custo beneficio", "custo benefício", "custo", "beneficio",
        "benefício", "cashback", "preço alto", "mais barato", "mercado",
    ],
    "Atendimento / Loja física": [
        "atendimento", "atendente", "funcionario", "funcionário", "funcionaria", "funcionária", "caixa", "fila", "loja",
        "limpeza", "organizada", "organizado", "desorganizada", "desorganizado", "balcao", "balcão", "vendedor", "vendedora",
        "espera", "equipe", "educado", "educada", "grosseiro", "grosseira", "mal atendimento", "presencial",
    ],
    "Qualidade do produto": [
        "produto", "produtos", "carne", "carnes", "frango", "peixe", "qualidade", "sabor", "gosto", "textura", "corte",
        "gordura", "validade", "vencido", "vencida", "estragado", "estragada", "duro", "dura", "seco", "seca",
        "congelado", "congelada", "fresco", "fresca", "macio", "macia", "temperado", "temperada",
    ],
    "App / Site / Pagamento": [
        "app", "aplicativo", "site", "pagamento", "pix", "cartao", "cartão", "checkout", "sistema", "login", "senha",
        "cupom", "online", "internet", "erro", "travou", "travando", "estoque online", "pedido online", "jornada digital",
    ],
    "Entrega / Pedido digital": [
        "entrega", "pedido", "delivery", "retirada", "atraso", "atrasado", "atrasada", "motoboy", "entregador", "recebi",
        "recebido", "cancelado", "cancelada", "estorno", "frete", "não recebi", "nao recebi", "retirar", "agendamento",
    ],
    "Outros / Genéricos": [],
}

STOPWORDS_PT = set(
    """
    a o os as um uma uns umas de da do das dos em no na nos nas por para com sem sobre entre ate até e ou mas que se ao aos
    aonde onde como quando porque pois seu sua seus suas meu minha meus minhas nosso nossa nossos nossas esse essa esses essas
    este esta estes estas isso isto aquele aquela aqueles aquelas foi foram era eram ser ter tem tinha tinham ha há ja já muito
    muita muitos muitas pouco pouca poucos poucas mais menos bem mal bom boa bons boas ruim ruins otimo ótima ótimo otimos ótimos
    pessimo péssima péssimo pessimos péssimos loja lojas produto produtos comprar compra cliente clientes swift mercado mercados carne
    carnes atendimento atendente dia dias vez vezes tudo nada sempre
    """.split()
)
for neg in ["nao", "não", "nunca", "jamais"]:
    STOPWORDS_PT.discard(neg)

SEM_COMENTARIO = {"", "-", "nan", "none", "null", "sem comentário", "sem comentario"}
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF\U00002700-\U000027BF\U00002600-\U000026FF]", flags=re.UNICODE)
STOP_PT_IDIOMA = set(
    "de da do das dos que para com nao não uma um por em no na os as e o a foi muito mais loja produto atendimento entrega bom boa ruim otimo ótimo pessimo péssimo".split()
)


def strip_accents(text: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFD", text) if unicodedata.category(ch) != "Mn")


def normalize(value: Any) -> str:
    text = str(value or "").lower()
    text = strip_accents(text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_keep_pt(value: Any) -> str:
    text = str(value or "").lower().strip()
    text = strip_accents(text)
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", normalize(value)).strip("_")


def find_column(headers: list[str], key: str) -> str | None:
    candidates = {normalize_key(v) for v in ALIASES[key]}
    for raw in headers:
        if normalize_key(raw) in candidates:
            return raw
    return None


def parse_number(value: Any) -> float:
    if value is None or value == "":
        return math.nan
    if isinstance(value, (int, float)):
        number = float(value)
        return number if math.isfinite(number) else math.nan
    text = str(value).strip().replace("%", "").replace(" ", "")
    if not text:
        return math.nan
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    try:
        number = float(text)
    except ValueError:
        return math.nan
    return number if math.isfinite(number) else math.nan


def maybe_number(raw: str) -> Any:
    stripped = raw.strip()
    if not stripped:
        return ""
    if re.fullmatch(r"-?[\d\s.,%]+", stripped):
        number = parse_number(stripped)
        if math.isfinite(number):
            return number
    return stripped


def detect_dialect(text: str) -> csv.Dialect:
    sample = text[:8192]
    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        class Fallback(csv.excel):
            delimiter = ";" if sample.count(";") >= sample.count(",") else ","
        return Fallback


def parse_csv_text(text: str) -> list[AnyRow]:
    text = text.lstrip("\ufeff")
    if not text.strip():
        return []
    dialect = detect_dialect(text)
    reader = csv.reader(io.StringIO(text), dialect)
    raw_rows = [[cell for cell in row] for row in reader if any(str(cell).strip() for cell in row)]
    if len(raw_rows) < 2:
        return []
    headers = [(h.strip() or f"coluna_{i + 1}") for i, h in enumerate(raw_rows[0])]
    rows: list[AnyRow] = []
    for cells in raw_rows[1:]:
        row: AnyRow = {}
        for i, header in enumerate(headers):
            row[header] = maybe_number(cells[i] if i < len(cells) else "")
        rows.append(row)
    return rows


def read_csv_path(path: str | Path) -> list[AnyRow]:
    path = Path(path)
    if path.suffix == ".gz":
        with gzip.open(path, "rt", encoding="utf-8", errors="replace") as f:
            return parse_csv_text(f.read())
    return parse_csv_text(path.read_text(encoding="utf-8", errors="replace"))


def nps_class_from_score(score: float) -> str:
    if not math.isfinite(score):
        return "sem nota"
    if score >= 9:
        return "promotor"
    if score >= 7:
        return "neutro"
    return "detrator"


def normalize_nps_class(value: Any) -> str:
    text = normalize(value)
    if not text:
        return "sem nota"
    if text in {"promotor", "promoter", "positivo", "satisfeito"}:
        return "promotor"
    if text in {"neutro", "neutral", "passivo", "passive"}:
        return "neutro"
    if text in {"detrator", "detractor", "negativo", "insatisfeito"}:
        return "detrator"
    return "sem nota"


def classify_nps(raw: AnyRow, col_nota: str | None, col_classificacao: str | None) -> tuple[str, float | None]:
    existing = normalize_nps_class(raw.get(col_classificacao)) if col_classificacao else "sem nota"
    if existing != "sem nota":
        nota = parse_number(raw.get(col_nota)) if col_nota else math.nan
        return existing, (nota if math.isfinite(nota) else None)
    nota = parse_number(raw.get(col_nota)) if col_nota else math.nan
    return nps_class_from_score(nota), (nota if math.isfinite(nota) else None)


def canonical_month(value: Any) -> str:
    if value is None or value == "":
        return "Sem data"
    text = str(value).strip()
    if re.match(r"^\d{4}-\d{2}", text):
        return text[:7] + "-01"
    if re.match(r"^\d{2}/\d{2}/\d{4}", text):
        day, month, year = text[:10].split("/")
        return f"{year}-{month.zfill(2)}-01"
    if re.match(r"^\d{2}/\d{4}", text):
        month, year = text.split("/")[:2]
        return f"{year}-{month.zfill(2)}-01"
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y", "%Y-%m", "%m-%Y"):
        try:
            dt = datetime.strptime(text[:10] if "%d" in fmt else text[:7], fmt)
            return f"{dt.year}-{dt.month:02d}-01"
        except ValueError:
            pass
    return text


def safe_weight(value: Any) -> float:
    weight = parse_number(value)
    if not math.isfinite(weight) or weight <= 0:
        return DEFAULT_WEIGHT
    return float(weight)


def pct(part: float, total: float) -> float:
    return (float(part) / float(total)) * 100 if total else 0.0


def weighted_sum(rows: list[AnyRow], condition: Callable[[AnyRow], bool]) -> float:
    return sum(float(r.get("peso_calculo") or DEFAULT_WEIGHT) for r in rows if condition(r))


def mode_value(rows: list[AnyRow], key: str, fallback: str = "Não informado") -> str:
    values = [str(r.get(key) or "").strip() for r in rows if str(r.get(key) or "").strip()]
    if not values:
        return fallback
    return Counter(values).most_common(1)[0][0]


def count_matches(text: str, terms: list[str]) -> float:
    # Mais rápido que regex por termo: usa set de tokens para palavras e substring para frases.
    if not text:
        return 0.0
    tokens = set(text.split())
    padded = f" {text} "
    score = 0.0
    for term in terms:
        normalized_term = normalize(term)
        if not normalized_term:
            continue
        if " " in normalized_term:
            if f" {normalized_term} " in padded:
                score += 1.0
        elif normalized_term in tokens:
            score += 1.0
    return score


def preprocess_text(comment: Any) -> dict[str, Any]:
    original = str(comment or "").strip()
    lower = original.lower().strip()
    has_comment = lower not in SEM_COMENTARIO
    clean = re.sub(r"\s+", " ", original).strip() if has_comment else ""
    text_norm = normalize_keep_pt(clean)
    num_words = len(text_norm.split()) if text_norm else 0
    num_chars = len(clean)
    only_number_or_symbol = bool(re.fullmatch(r"[0-9\s]*", text_norm or ""))
    repeated_char = bool(re.search(r"(.)\1{5,}", clean))
    possible_garbage = only_number_or_symbol or repeated_char or len(text_norm) <= 1
    has_emoji = bool(EMOJI_RE.search(clean))
    tokens = text_norm.split()
    if len(tokens) < 3:
        probable_pt = True
    else:
        hits = sum(t in STOP_PT_IDIOMA for t in tokens)
        has_pt_accent = bool(re.search(r"[ãõáéíóúâêôç]", original.lower()))
        probable_pt = hits >= 1 or has_pt_accent
    return {
        "comentario_limpo_basico": clean,
        "texto_norm": text_norm,
        "tem_comentario": has_comment,
        "num_palavras": num_words,
        "num_caracteres": num_chars,
        "flag_curto": num_words < 5,
        "tem_emoji": has_emoji,
        "so_numero_ou_sinal": only_number_or_symbol,
        "repeticao_caracter": repeated_char,
        "possivel_lixo": possible_garbage,
        "provavel_portugues": probable_pt,
        "possivel_nao_pt": not probable_pt,
    }


def predict_sentiment(comment: Any, classification: str | None = None) -> dict[str, Any]:
    # Regra inspirada no notebook: sentimento ternário, texto como fonte principal e falha operacional domina em comentário misto.
    text = normalize(comment)
    if not text:
        fallback = "positivo" if classification == "promotor" else "negativo" if classification == "detrator" else "neutro"
        return {"label": fallback, "confidence": 0.45, "lowConfidence": True, "scores": {"positivo": 0, "neutro": 0, "negativo": 0}}

    pos = count_matches(text, POSITIVE_TERMS)
    neg = count_matches(text, NEGATIVE_TERMS)
    neu = 1 if len(text.split()) <= 3 else 0
    has_operational_failure = bool(re.search(r"(atras|erro|estorno|vencid|estragad|fila|sem estoque|cancelad|gordura|duro|seca|falha)", text))
    adjusted_neg = neg + (1.15 if has_operational_failure else 0)
    adjusted_pos = pos

    label = "neutro"
    if adjusted_pos - adjusted_neg >= 1:
        label = "positivo"
    elif adjusted_neg - adjusted_pos >= 1:
        label = "negativo"

    if label == "neutro" and classification:
        if classification == "promotor" and adjusted_neg == 0:
            label = "positivo"
        if classification == "detrator" and adjusted_pos == 0:
            label = "negativo"

    diff = abs(adjusted_pos - adjusted_neg)
    evidence = adjusted_pos + adjusted_neg + neu
    confidence = max(0.42, min(0.96, 0.48 + diff * 0.18 + min(evidence, 4) * 0.05))
    return {
        "label": label,
        "confidence": confidence,
        "lowConfidence": confidence < 0.62 or len(text.split()) < 4,
        "scores": {"positivo": adjusted_pos, "neutro": neu, "negativo": adjusted_neg},
    }


def predict_category(comment: Any) -> dict[str, Any]:
    text = normalize(comment)
    raw = {category: count_matches(text, terms) for category, terms in CATEGORY_TERMS.items()}
    entries = sorted(raw.items(), key=lambda item: item[1], reverse=True)
    best_label, best_score = entries[0] if entries else ("Outros / Genéricos", 0)
    second = entries[1][1] if len(entries) > 1 else 0
    label = best_label if best_score > 0 else "Outros / Genéricos"
    confidence = 0.38 if best_score <= 0 else max(0.48, min(0.95, 0.48 + best_score * 0.12 + (best_score - second) * 0.08))
    return {"label": label, "confidence": confidence, "lowConfidence": confidence < 0.6 or label == "Outros / Genéricos", "scores": raw}




def normalize_sentiment_label(value: Any) -> str | None:
    text = normalize(value)
    if text in {"positivo", "positive", "pos"}:
        return "positivo"
    if text in {"neutro", "neutral", "neu"}:
        return "neutro"
    if text in {"negativo", "negative", "neg"}:
        return "negativo"
    return None


def normalize_category_label(value: Any) -> str | None:
    raw = str(value or "").strip()
    if raw in CATEGORY_CRITERIA:
        return raw
    text = normalize(raw)
    for category in CATEGORY_CRITERIA:
        if normalize(category) == text:
            return category
    return None


def parse_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    text = normalize(value)
    if text in {"true", "1", "sim", "s", "yes", "y"}:
        return True
    if text in {"false", "0", "nao", "não", "n", "no"}:
        return False
    return None


def existing_or_predicted_sentiment(raw: AnyRow, col_sent: str | None, col_conf: str | None, col_low: str | None, comment: str, classification: str) -> dict[str, Any]:
    label = normalize_sentiment_label(raw.get(col_sent)) if col_sent else None
    if not label:
        return predict_sentiment(comment, classification)
    confidence = parse_number(raw.get(col_conf)) if col_conf else math.nan
    if not math.isfinite(confidence):
        confidence = 0.75
    low = parse_bool(raw.get(col_low)) if col_low else None
    return {
        "label": label,
        "confidence": float(confidence),
        "lowConfidence": bool(low) if low is not None else float(confidence) < 0.62,
        "scores": {},
    }


def existing_or_predicted_category(raw: AnyRow, col_cat: str | None, col_conf: str | None, col_low: str | None, comment: str) -> dict[str, Any]:
    label = normalize_category_label(raw.get(col_cat)) if col_cat else None
    if not label:
        return predict_category(comment)
    confidence = parse_number(raw.get(col_conf)) if col_conf else math.nan
    if not math.isfinite(confidence):
        confidence = 0.75 if label != "Outros / Genéricos" else 0.38
    low = parse_bool(raw.get(col_low)) if col_low else None
    return {
        "label": label,
        "confidence": float(confidence),
        "lowConfidence": bool(low) if low is not None else float(confidence) < 0.6 or label == "Outros / Genéricos",
        "scores": {},
    }

def derive_management(raw: AnyRow, col_gestao: str | None, col_flag: str | None) -> str:
    if col_gestao:
        value = str(raw.get(col_gestao) or "").strip()
        if value:
            return value
    flag = normalize(raw.get(col_flag)) if col_flag else ""
    if "tocadora" in flag or "germinare" in flag:
        return "Tocadora/Germinare"
    if "regular" in flag:
        return "Regular"
    if flag:
        return str(raw.get(col_flag) or "Sem flag")
    return "Sem flag"


def summarize(rows: list[AnyRow], group_by: str | None = None) -> AnyRow | list[AnyRow]:
    groups: dict[str, list[AnyRow]] = defaultdict(list)
    if group_by:
        for row in rows:
            groups[str(row.get(group_by) or "Não informado")].append(row)
    else:
        groups["__all__"] = rows

    result: list[AnyRow] = []
    for group, items in groups.items():
        valid = [r for r in items if r.get("classificacao_nps") in ORDER_NPS]
        total_avaliacoes = sum(float(r.get("peso_calculo") or DEFAULT_WEIGHT) for r in valid)
        total_comentarios = weighted_sum(valid, lambda r: bool(r.get("tem_comentario")))
        prom = weighted_sum(valid, lambda r: r.get("classificacao_nps") == "promotor")
        neu = weighted_sum(valid, lambda r: r.get("classificacao_nps") == "neutro")
        det = weighted_sum(valid, lambda r: r.get("classificacao_nps") == "detrator")
        pos = weighted_sum(valid, lambda r: r.get("sentimento_modelo") == "positivo")
        neg = weighted_sum(valid, lambda r: r.get("sentimento_modelo") == "negativo")
        diverg = weighted_sum(valid, lambda r: bool(r.get("divergencia_nota_texto")))
        low_sent = weighted_sum(valid, lambda r: bool(r.get("baixa_confianca_sentimento")))
        low_cat = weighted_sum(valid, lambda r: bool(r.get("baixa_confianca_categoria")))
        nps = pct(prom, total_avaliacoes) - pct(det, total_avaliacoes)
        score_sent = pct(pos, total_avaliacoes) - pct(neg, total_avaliacoes)
        out: AnyRow = {
            "comentarios": total_comentarios,
            "avaliacoes_ponderadas": total_avaliacoes,
            "promotores_%": pct(prom, total_avaliacoes),
            "neutros_%": pct(neu, total_avaliacoes),
            "detratores_%": pct(det, total_avaliacoes),
            "nps_tradicional": nps,
            "sentimento_positivo_%": pct(pos, total_avaliacoes),
            "sentimento_negativo_%": pct(neg, total_avaliacoes),
            "score_sentimento": score_sent,
            "nps_ajustado": 0.7 * nps + 0.3 * score_sent,
            "divergencia_%": pct(diverg, total_avaliacoes),
            "baixa_conf_sent_%": pct(low_sent, total_avaliacoes),
            "baixa_conf_cat_%": pct(low_cat, total_avaliacoes),
        }
        if group_by:
            out[group_by] = group
        result.append(out)
    return result if group_by else (result[0] if result else {})


def top_categories(rows: list[AnyRow], filter_fn: Callable[[AnyRow], bool], group_by: str | None = None) -> list[AnyRow]:
    filtered = [r for r in rows if filter_fn(r)]
    groups: dict[str, list[AnyRow]] = defaultdict(list)
    if group_by:
        for row in filtered:
            groups[str(row.get(group_by) or "Não informado")].append(row)
    else:
        groups["__all__"] = filtered

    out: list[AnyRow] = []
    for group, items in groups.items():
        total = sum(float(r.get("peso_calculo") or DEFAULT_WEIGHT) for r in items) or DEFAULT_WEIGHT
        counts: Counter[str] = Counter()
        for row in items:
            counts[str(row.get("categoria_modelo") or "Outros / Genéricos")] += float(row.get("peso_calculo") or DEFAULT_WEIGHT)
        for category, quantity in counts.most_common():
            row: AnyRow = {"categoria_modelo": category, "qtd": quantity, "pct_no_grupo": pct(quantity, total)}
            if group_by:
                row[group_by] = group
            out.append(row)
    return out


def representative_comments(rows: list[AnyRow], sentiment: str, limit: int = 9) -> list[AnyRow]:
    items = [r for r in rows if r.get("sentimento_modelo") == sentiment and len(str(r.get("comentario") or "")) > 12]
    items.sort(key=lambda r: (float(r.get("confianca_sentimento") or 0), float(r.get("peso_calculo") or 1)), reverse=True)
    return [
        {
            "loja": r.get("centronv2") or "Loja não informada",
            "centronv2": r.get("centronv2") or "Loja não informada",
            "categoria_modelo": r.get("categoria_modelo"),
            "comentario": r.get("comentario"),
            "confianca_sentimento": r.get("confianca_sentimento"),
        }
        for r in items[:limit]
    ]


def top_terms(rows: list[AnyRow], classification: str, ngram: int = 1, top_n: int = 20) -> list[AnyRow]:
    counter: Counter[str] = Counter()
    for row in rows:
        if row.get("classificacao_nps") != classification or not row.get("tem_comentario"):
            continue
        tokens = [t for t in str(row.get("texto_norm") or "").split() if len(t) >= 2 and t not in STOPWORDS_PT]
        if ngram == 1:
            units = tokens
        else:
            units = [" ".join(tokens[i:i + ngram]) for i in range(len(tokens) - ngram + 1)]
        weight = float(row.get("peso_calculo") or DEFAULT_WEIGHT)
        for unit in units:
            counter[unit] += weight
    return [{"termo": term, "freq": freq} for term, freq in counter.most_common(top_n)]


def add_duplicate_flags(inference: list[AnyRow]) -> None:
    raw_comments = [str(r.get("comentario") or "") for r in inference]
    norm_comments = [str(r.get("texto_norm") or "") for r in inference]
    raw_counts = Counter(raw_comments)
    norm_counts = Counter(c for c in norm_comments if c)
    for row in inference:
        row["duplicata_exata"] = raw_counts[str(row.get("comentario") or "")] > 1 and bool(row.get("comentario"))
        row["duplicata_normalizada"] = norm_counts[str(row.get("texto_norm") or "")] > 1 and bool(row.get("texto_norm"))


def quality_summary(rows: list[AnyRow]) -> list[AnyRow]:
    comment_rows = [r for r in rows if r.get("tem_comentario")]
    total = sum(float(r.get("peso_calculo") or DEFAULT_WEIGHT) for r in comment_rows) or DEFAULT_WEIGHT
    metrics = [
        ("duplicatas exatas", weighted_sum(comment_rows, lambda r: bool(r.get("duplicata_exata")))),
        ("duplicatas normalizadas", weighted_sum(comment_rows, lambda r: bool(r.get("duplicata_normalizada")))),
        ("comentários com emoji", weighted_sum(comment_rows, lambda r: bool(r.get("tem_emoji")))),
        ("possível não-PT (heurística)", weighted_sum(comment_rows, lambda r: bool(r.get("possivel_nao_pt")))),
        ("possível lixo/spam", weighted_sum(comment_rows, lambda r: bool(r.get("possivel_lixo")))),
        ("comentários curtos (<5 palavras)", weighted_sum(comment_rows, lambda r: bool(r.get("flag_curto")))),
    ]
    return [{"métrica": name, "qtd": value, "%": pct(value, total)} for name, value in metrics]


def build_dashboard(rows: list[AnyRow], source_name: str = "Base enviada") -> dict[str, Any]:
    headers = list(rows[0].keys()) if rows else []
    col_nota = find_column(headers, "nota")
    col_classificacao = find_column(headers, "classificacao")
    col_comentario = find_column(headers, "comentario")
    col_loja = find_column(headers, "loja")
    col_municipio = find_column(headers, "municipio")
    col_uf = find_column(headers, "uf")
    col_gestao = find_column(headers, "gestao")
    col_flag = find_column(headers, "flag")
    col_regiao = find_column(headers, "regiao")
    col_data = find_column(headers, "data")
    col_peso = find_column(headers, "peso")
    col_transacoes = find_column(headers, "transacoes")
    col_sentimento = find_column(headers, "sentimento")
    col_conf_sentimento = find_column(headers, "confianca_sentimento")
    col_low_sentimento = find_column(headers, "baixa_conf_sentimento")
    col_categoria = find_column(headers, "categoria")
    col_conf_categoria = find_column(headers, "confianca_categoria")
    col_low_categoria = find_column(headers, "baixa_conf_categoria")
    col_divergencia = find_column(headers, "divergencia")

    inference: list[AnyRow] = []
    for index, raw in enumerate(rows):
        classification, nota = classify_nps(raw, col_nota, col_classificacao)
        comentario = str(raw.get(col_comentario) if col_comentario else "")
        text_flags = preprocess_text(comentario)
        sentiment = existing_or_predicted_sentiment(raw, col_sentimento, col_conf_sentimento, col_low_sentimento, text_flags["comentario_limpo_basico"], classification)
        category = existing_or_predicted_category(raw, col_categoria, col_conf_categoria, col_low_categoria, text_flags["comentario_limpo_basico"])
        existing_divergence = parse_bool(raw.get(col_divergencia)) if col_divergencia else None
        divergence = existing_divergence if existing_divergence is not None else (
            (classification == "promotor" and sentiment["label"] == "negativo")
            or (classification == "detrator" and sentiment["label"] == "positivo")
            or (classification == "neutro" and sentiment["label"] != "neutro")
        )
        row: AnyRow = {
            **raw,
            **text_flags,
            "id_linha": index + 1,
            "nota_nps": nota,
            "classificacao_nps": classification,
            "comentario": text_flags["comentario_limpo_basico"],
            "centronv2": str((raw.get(col_loja) if col_loja else None) or "Loja não informada"),
            "municipio": str((raw.get(col_municipio) if col_municipio else None) or "Não informado"),
            "uf": str((raw.get(col_uf) if col_uf else None) or "Não informado"),
            "tipo_gestao": derive_management(raw, col_gestao, col_flag),
            "flag": str((raw.get(col_flag) if col_flag else None) or "SEM_FLAG"),
            "regiao_im": str((raw.get(col_regiao) if col_regiao else None) or (raw.get(col_uf) if col_uf else None) or "Não informado"),
            "mes_ano": canonical_month(raw.get(col_data) if col_data else None),
            "transacoes": parse_number(raw.get(col_transacoes)) if col_transacoes else None,
            "peso_calculo": safe_weight(raw.get(col_peso) if col_peso else DEFAULT_WEIGHT),
            "sentimento_modelo": sentiment["label"],
            "confianca_sentimento": sentiment["confidence"],
            "baixa_confianca_sentimento": sentiment["lowConfidence"],
            "categoria_modelo": category["label"],
            "confianca_categoria": category["confidence"],
            "baixa_confianca_categoria": category["lowConfidence"],
            "divergencia_nota_texto": divergence,
        }
        if row["classificacao_nps"] != "sem nota" or row["tem_comentario"]:
            inference.append(row)

    add_duplicate_flags(inference)

    resumo = summarize(inference)
    gestao = summarize(inference, "tipo_gestao")
    regiao = summarize(inference, "regiao_im")

    loja_groups: dict[str, list[AnyRow]] = defaultdict(list)
    for row in inference:
        loja_groups[str(row.get("centronv2") or "Loja não informada")].append(row)

    loja_summary: list[AnyRow] = []
    loja_summaries = summarize(inference, "centronv2")
    loja_summary_by_name = {str(item.get("centronv2")): item for item in loja_summaries}
    for loja_name, items in loja_groups.items():
        loja = loja_summary_by_name.get(loja_name, {})
        top_prob = ", ".join(str(x["categoria_modelo"]) for x in top_categories(items, lambda r: r.get("sentimento_modelo") == "negativo" or r.get("classificacao_nps") == "detrator")[:3])
        top_elo = ", ".join(str(x["categoria_modelo"]) for x in top_categories(items, lambda r: r.get("sentimento_modelo") == "positivo" or r.get("classificacao_nps") == "promotor")[:3])
        trans_total = sum(float(r.get("transacoes") or 0) for r in items if isinstance(r.get("transacoes"), (int, float)))
        avaliacoes = float(loja.get("avaliacoes_ponderadas") or 0)
        comentarios = float(loja.get("comentarios") or 0)
        loja_summary.append(
            {
                **loja,
                "centronv2": loja_name,
                "municipio": mode_value(items, "municipio"),
                "tipo_gestao": mode_value(items, "tipo_gestao", "Sem flag"),
                "regiao_im": mode_value(items, "regiao_im"),
                "flag": mode_value(items, "flag", "SEM_FLAG"),
                "transacoes": trans_total if trans_total else None,
                "taxa_avaliacao": avaliacoes / trans_total if trans_total else None,
                "taxa_comentario": comentarios / trans_total if trans_total else None,
                "top_problemas": top_prob or "Sem padrão claro",
                "top_elogios": top_elo or "Sem padrão claro",
                "alerta_delta_nps": "Sim" if abs(float(loja.get("nps_ajustado") or 0) - float(loja.get("nps_tradicional") or 0)) >= 8 else "Não",
            }
        )
    loja_summary.sort(key=lambda r: float(r.get("nps_ajustado") or 0), reverse=True)

    tendencia = [r for r in summarize(inference, "mes_ano") if r.get("mes_ano") != "Sem data"]
    tendencia.sort(key=lambda r: str(r.get("mes_ano") or ""))
    # Variação mensal, como no notebook de EDA.
    prev_nps: float | None = None
    for row in tendencia:
        nps_value = float(row.get("nps_tradicional") or 0)
        row["variacao_nps"] = None if prev_nps is None else nps_value - prev_nps
        prev_nps = nps_value

    problemas = top_categories(inference, lambda r: r.get("sentimento_modelo") == "negativo" or r.get("classificacao_nps") == "detrator")[:12]
    elogios = top_categories(inference, lambda r: r.get("sentimento_modelo") == "positivo" or r.get("classificacao_nps") == "promotor")[:12]
    problemas_gestao = top_categories(
        inference,
        lambda r: r.get("sentimento_modelo") == "negativo" or r.get("classificacao_nps") == "detrator",
        "tipo_gestao",
    )[:40]

    matriz: list[AnyRow] = []
    cats = sorted({str(r.get("categoria_modelo") or "Outros / Genéricos") for r in inference})
    for classification in ORDER_NPS:
        items = [r for r in inference if r.get("classificacao_nps") == classification]
        total = sum(float(r.get("peso_calculo") or DEFAULT_WEIGHT) for r in items) or DEFAULT_WEIGHT
        for category in cats:
            quantity = weighted_sum(items, lambda r, category=category: r.get("categoria_modelo") == category)
            matriz.append({"classificacao_nps": classification, "categoria_modelo": category, "qtd": quantity, "pct_linha": pct(quantity, total)})

    comentarios_por_loja = [float(l.get("comentarios") or 0) for l in loja_summary if float(l.get("comentarios") or 0) > 0]
    lojas_menos_30 = sum(1 for v in comentarios_por_loja if v < 30)
    lojas_menos_50 = sum(1 for v in comentarios_por_loja if v < 50)
    qtd_lojas = len(comentarios_por_loja)
    threshold_dashboard = 50 if qtd_lojas and lojas_menos_50 / qtd_lojas <= 0.25 else 30

    return {
        "resumo": resumo,
        "gestao": gestao,
        "regiao": regiao,
        "lojas": loja_summary,
        "tendencia": tendencia,
        "problemas": problemas,
        "elogios": elogios,
        "problemas_gestao": problemas_gestao,
        "matriz": matriz,
        "inferencia": inference,
        "exemplos": representative_comments(inference, "negativo", 9) + representative_comments(inference, "positivo", 9),
        "qualidade_dados": quality_summary(inference),
        "termos_detratores": top_terms(inference, "detrator", 1, 20),
        "termos_promotores": top_terms(inference, "promotor", 1, 20),
        "bigramas_detratores": top_terms(inference, "detrator", 2, 20),
        "bigramas_promotores": top_terms(inference, "promotor", 2, 20),
        "diagnostico_eda": {
            "lojas_com_comentario": qtd_lojas,
            "lojas_menos_30_comentarios": lojas_menos_30,
            "lojas_menos_50_comentarios": lojas_menos_50,
            "corte_recomendado_dashboard": threshold_dashboard,
            "categorias_validas": list(CATEGORY_CRITERIA.keys()),
            "criterios_categoria": CATEGORY_CRITERIA,
        },
        "sourceName": source_name,
    }


def dashboard_from_csv_text(csv_text: str, source_name: str = "Base enviada") -> dict[str, Any]:
    rows = parse_csv_text(csv_text)
    if not rows:
        raise ValueError("Não consegui ler linhas válidas nesse CSV. Confira o separador e o cabeçalho.")
    return build_dashboard(rows, source_name)


def to_typescript_module(data: dict[str, Any]) -> str:
    dumped = json.dumps(data, ensure_ascii=False, indent=2)
    return "// Auto-generated by scripts/gerar_dados_nps.py\nexport const data = " + dumped + " as const;\n"
