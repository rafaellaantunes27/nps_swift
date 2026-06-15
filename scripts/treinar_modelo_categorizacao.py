from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

RANDOM_STATE = 42

COMMENT_ALIASES = ["comentario", "comentário", "comentario_limpo", "comment", "texto", "feedback", "resposta"]
CATEGORY_ALIASES = [
    "categoria_anotador_1",
    "categoria_final",
    "categoria_modelo",
    "categoria",
    "category",
    "topico_categoria",
]


def normalize_name(value: str) -> str:
    value = str(value).strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "_", value).strip("_")


def first_existing_column(df: pd.DataFrame, aliases: list[str]) -> str | None:
    lookup = {normalize_name(c): c for c in df.columns}
    for alias in aliases:
        found = lookup.get(normalize_name(alias))
        if found:
            return found
    return None


def normalize_text(value: object) -> str:
    if value is None or pd.isna(value):
        return ""
    text = unicodedata.normalize("NFKC", str(value)).strip()
    return re.sub(r"\s+", " ", text)


def build_logistic(C: float) -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    max_features=10000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    min_df=2,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    C=C,
                    class_weight="balanced",
                    max_iter=2000,
                    random_state=RANDOM_STATE,
                    solver="lbfgs",
                ),
            ),
        ]
    )


def build_svc(C: float) -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    max_features=10000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    min_df=2,
                ),
            ),
            (
                "clf",
                LinearSVC(
                    C=C,
                    class_weight="balanced",
                    max_iter=5000,
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def evaluate_model(name: str, model: Pipeline, X, y, cv: StratifiedKFold) -> dict:
    y_pred = cross_val_predict(model, X, y, cv=cv)
    return {
        "modelo": name,
        "acuracia": float(accuracy_score(y, y_pred)),
        "f1_macro": float(f1_score(y, y_pred, average="macro")),
        "f1_weighted": float(f1_score(y, y_pred, average="weighted")),
        "classification_report": classification_report(y, y_pred, output_dict=True, zero_division=0),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Treina o modelo de categorização do NPS Swift.")
    parser.add_argument(
        "--input",
        default="03_amostra_anotada.csv",
        help="CSV anotado com comentário e categoria. Ex.: 03_amostra_anotada.csv",
    )
    parser.add_argument(
        "--output",
        default="api/models/modelo_categorizacao.joblib",
        help="Caminho de saída do .joblib usado pela API Python.",
    )
    parser.add_argument("--report", default="models/relatorio_modelo_categorizacao.json")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    report_path = Path(args.report)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_path)
    comment_col = first_existing_column(df, COMMENT_ALIASES)
    category_col = first_existing_column(df, CATEGORY_ALIASES)

    if not comment_col:
        raise ValueError("Não encontrei coluna de comentário. Use: " + ", ".join(COMMENT_ALIASES))
    if not category_col:
        raise ValueError("Não encontrei coluna de categoria. Use: " + ", ".join(CATEGORY_ALIASES))

    amostra = df[[comment_col, category_col]].dropna().copy()
    amostra[comment_col] = amostra[comment_col].map(normalize_text)
    amostra[category_col] = amostra[category_col].astype(str).str.strip()
    amostra = amostra[(amostra[comment_col] != "") & (amostra[category_col] != "")].copy()

    X = amostra[comment_col].astype(str).values
    y = amostra[category_col].astype(str).values

    min_class_count = int(pd.Series(y).value_counts().min())
    n_splits = min(5, min_class_count)
    if n_splits < 2:
        raise ValueError("Amostra insuficiente: cada categoria precisa ter pelo menos 2 exemplos.")

    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_STATE)

    candidates: list[tuple[str, Pipeline]] = []
    for C in [1.0, 2.0, 3.0, 5.0]:
        candidates.append((f"LogisticRegression C={C}", build_logistic(C)))
    for C in [1.0, 2.0, 3.0]:
        candidates.append((f"LinearSVC C={C}", build_svc(C)))

    results = [evaluate_model(name, model, X, y, cv) for name, model in candidates]
    best = max(results, key=lambda r: r["f1_macro"])

    # Modelo final igual ao notebook original: LinearSVC C=2.0 treinado na amostra toda.
    final_model = build_svc(C=2.0)
    final_model.fit(X, y)
    joblib.dump(final_model, output_path)

    report = {
        "input": str(input_path),
        "output": str(output_path),
        "amostra": int(len(amostra)),
        "n_splits": int(n_splits),
        "distribuicao": pd.Series(y).value_counts().to_dict(),
        "melhor_validacao_cruzada": best,
        "comparacao": [
            {k: v for k, v in item.items() if k != "classification_report"} for item in results
        ],
        "modelo_final_salvo": "LinearSVC C=2.0",
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Modelo de categorização salvo em: {output_path}")
    print(f"Relatório salvo em: {report_path}")
    print(json.dumps(report["melhor_validacao_cruzada"], ensure_ascii=False, indent=2)[:1200])


if __name__ == "__main__":
    main()
