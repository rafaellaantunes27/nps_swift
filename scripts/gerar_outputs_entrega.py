from __future__ import annotations

import csv
import gzip
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "public/models/base_inferida_swift.csv.gz"
OUT = ROOT / "entrega/outputs"


def open_text(path: Path):
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8-sig", newline="")
    return path.open("r", encoding="utf-8-sig", newline="")


def read_csv(path: Path) -> list[dict[str, str]]:
    with open_text(path) as f:
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        return list(csv.DictReader(f, dialect=dialect))


def write_csv(path: Path, rows: Iterable[dict]) -> None:
    rows = list(rows)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = list(dict.fromkeys(k for row in rows for k in row.keys()))
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def num(value, default=0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(str(value).replace(",", "."))
    except Exception:
        return default


def truthy(value) -> bool:
    return str(value).strip().lower() in {"1", "true", "sim", "yes", "y"}


def pct(part: float, total: float) -> float:
    return 0.0 if not total else 100.0 * part / total


def faixa_nps(value: float) -> str:
    if value > 0:
        return "positivo"
    if value < 0:
        return "negativo"
    return "neutro"


def faixa_exec(value: float) -> str:
    if value >= 75:
        return "excelente"
    if value >= 50:
        return "bom"
    if value >= 0:
        return "atenção"
    return "crítico"


def main() -> None:
    rows = read_csv(BASE)
    print(f"Base lida: {len(rows):,} linhas")

    # 1) matriz classificação NPS x categoria
    matriz = Counter()
    matriz_total = Counter()
    for r in rows:
        classe = r.get("classificacao") or r.get("classificacao_nps") or "sem nota"
        cat = r.get("categoria_modelo") or "Outros / Genéricos"
        peso = num(r.get("qtd_clientes"), 1.0) or 1.0
        matriz[(classe, cat)] += peso
        matriz_total[classe] += peso
    write_csv(
        OUT / "matriz_nps_categoria.csv",
        [
            {"classificacao_nps": classe, "categoria_modelo": cat, "qtd": qtd, "pct_linha": pct(qtd, matriz_total[classe])}
            for (classe, cat), qtd in sorted(matriz.items())
        ],
    )

    # 2) qualidade de dados textual
    total_com = sum(1 for r in rows if str(r.get("comentario") or "").strip()) or 1
    metrics = {
        "comentários com texto": total_com,
        "duplicatas exatas": sum(1 for r in rows if truthy(r.get("duplicata_exata"))),
        "duplicatas normalizadas": sum(1 for r in rows if truthy(r.get("duplicata_normalizada"))),
        "comentários com emoji": sum(1 for r in rows if truthy(r.get("tem_emoji"))),
        "possível não português": sum(1 for r in rows if truthy(r.get("possivel_nao_pt"))),
        "possível lixo/spam": sum(1 for r in rows if truthy(r.get("possivel_lixo"))),
        "comentários curtos": sum(1 for r in rows if truthy(r.get("flag_curto"))),
        "divergência nota × texto": sum(1 for r in rows if truthy(r.get("divergencia_nota_texto"))),
        "baixa confiança sentimento": sum(1 for r in rows if truthy(r.get("flag_baixa_confianca_sentimento")) or truthy(r.get("baixa_confianca_sentimento"))),
        "baixa confiança categoria": sum(1 for r in rows if truthy(r.get("flag_baixa_confianca_categoria")) or truthy(r.get("baixa_confianca_categoria"))),
    }
    write_csv(OUT / "qualidade_dados.csv", [{"metrica": k, "qtd": v, "pct_comentarios": pct(v, total_com)} for k, v in metrics.items()])

    # 3) exemplos representativos por categoria e sentimento
    examples = []
    seen = set()
    sorted_rows = sorted(
        [r for r in rows if len(str(r.get("comentario") or "")) >= 18],
        key=lambda r: (num(r.get("confianca_sentimento"), 0), num(r.get("confianca_categoria"), 0), len(str(r.get("comentario") or ""))),
        reverse=True,
    )
    per_key = Counter()
    for r in sorted_rows:
        sent = r.get("sentimento_modelo") or "não informado"
        cat = r.get("categoria_modelo") or "Outros / Genéricos"
        key = (sent, cat)
        text = str(r.get("comentario") or "").strip()
        norm = text.lower()
        if per_key[key] >= 3 or norm in seen:
            continue
        seen.add(norm)
        per_key[key] += 1
        examples.append({
            "sentimento_modelo": sent,
            "categoria_modelo": cat,
            "loja": r.get("centronv2") or "",
            "comentario": text,
            "confianca_sentimento": r.get("confianca_sentimento") or "",
            "confianca_categoria": r.get("confianca_categoria") or "",
        })
    write_csv(OUT / "exemplos_comentarios.csv", examples)

    # 4) casos extremos de divergência
    divergent = [r for r in rows if truthy(r.get("divergencia_nota_texto")) and len(str(r.get("comentario") or "")) >= 10]
    divergent.sort(key=lambda r: (num(r.get("confianca_sentimento"), 0), len(str(r.get("comentario") or ""))), reverse=True)
    write_csv(
        OUT / "casos_extremos_divergencia.csv",
        [
            {
                "loja": r.get("centronv2") or "",
                "classificacao_nps": r.get("classificacao") or r.get("classificacao_nps") or "",
                "sentimento_modelo": r.get("sentimento_modelo") or "",
                "categoria_modelo": r.get("categoria_modelo") or "",
                "comentario": r.get("comentario") or "",
                "confianca_sentimento": r.get("confianca_sentimento") or "",
                "confianca_categoria": r.get("confianca_categoria") or "",
            }
            for r in divergent[:50]
        ],
    )

    # 5) impacto do NPS ajustado nas faixas das lojas
    lojas_path = OUT / "lojas_resumo.csv"
    if lojas_path.exists():
        lojas = read_csv(lojas_path)
        impact = []
        for r in lojas:
            trad = num(r.get("nps_tradicional"), 0)
            adj = num(r.get("nps_ajustado"), 0)
            impact.append({
                **r,
                "gap_ajustado_vs_tradicional": adj - trad,
                "faixa_nps_tradicional": faixa_nps(trad),
                "faixa_nps_ajustado": faixa_nps(adj),
                "mudou_faixa_nps": faixa_nps(trad) != faixa_nps(adj),
                "faixa_executiva_tradicional": faixa_exec(trad),
                "faixa_executiva_ajustada": faixa_exec(adj),
                "mudou_faixa_executiva": faixa_exec(trad) != faixa_exec(adj),
            })
        impact.sort(key=lambda r: abs(num(r.get("gap_ajustado_vs_tradicional"), 0)), reverse=True)
        write_csv(OUT / "impacto_nps_ajustado_lojas.csv", impact)

    # 6) métricas dos modelos em CSV a partir do JSON salvo
    metrics_path = ROOT / "public/models/model_metrics.json"
    if metrics_path.exists():
        metrics_json = json.loads(metrics_path.read_text(encoding="utf-8"))
        sentimento = metrics_json.get("sentiment", {})
        categoria = metrics_json.get("category", {})
        write_csv(OUT / "metricas_modelo_sentimento.csv", [{
            "modelo": sentimento.get("model"),
            "labels": ", ".join(sentimento.get("labels", [])),
            "accuracy_against_nps_proxy": sentimento.get("accuracy_against_nps_proxy"),
            "macro_f1_against_nps_proxy": sentimento.get("macro_f1_against_nps_proxy"),
            "weighted_f1_against_nps_proxy": sentimento.get("weighted_f1_against_nps_proxy"),
            "observacao": sentimento.get("note"),
        }])
        write_csv(OUT / "metricas_modelo_categorizacao.csv", [{
            "modelo": categoria.get("model"),
            "labels": ", ".join(categoria.get("labels", [])),
            "observacao": categoria.get("note"),
        }])

    print(f"Outputs gerados em: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
