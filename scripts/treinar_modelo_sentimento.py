from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.utils.class_weight import compute_class_weight

RANDOM_STATE = 42

COMMENT_ALIASES = [
    "comentario_limpo",
    "comentario_limpo_basico",
    "comentario",
    "comentário",
    "comment",
    "texto",
    "feedback",
    "resposta",
]
CLASS_ALIASES = [
    "classificacao",
    "classificação",
    "classe_nps",
    "classificacao_nps",
    "tipo_nps",
    "perfil_nps",
]
SCORE_ALIASES = ["nota", "score", "nps", "avaliacao", "avaliação", "rating", "nota_nps"]


def first_existing_column(df: pd.DataFrame, aliases: list[str]) -> str | None:
    lookup = {normalize_name(c): c for c in df.columns}
    for alias in aliases:
        found = lookup.get(normalize_name(alias))
        if found:
            return found
    return None


def normalize_name(value: str) -> str:
    value = str(value).strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "_", value).strip("_")


def normalize_text(value: object) -> str:
    text = "" if value is None or pd.isna(value) else str(value)
    text = unicodedata.normalize("NFKC", text).strip()
    text = re.sub(r"\s+", " ", text)
    return text.lower()


def score_to_class(score: object) -> str | None:
    try:
        value = float(str(score).replace(",", "."))
    except Exception:
        return None
    if not np.isfinite(value):
        return None
    if value >= 9:
        return "promotor"
    if value >= 7:
        return "neutro"
    return "detrator"


def normalize_nps_class(value: object) -> str | None:
    text = normalize_text(value)
    if text in {"promotor", "promoter", "positivo"}:
        return "promotor"
    if text in {"neutro", "neutral"}:
        return "neutro"
    if text in {"detrator", "detractor", "negativo"}:
        return "detrator"
    return None


def possible_trash(text: str) -> bool:
    compact = re.sub(r"\s+", "", text)
    if len(compact) < 3:
        return True
    if re.fullmatch(r"[\W_]+", compact):
        return True
    if len(set(compact.lower())) <= 2 and len(compact) >= 5:
        return True
    return False


def prepare_dataset(input_path: Path) -> pd.DataFrame:
    df = pd.read_csv(input_path)

    comment_col = first_existing_column(df, COMMENT_ALIASES)
    if not comment_col:
        raise ValueError(
            "Não encontrei coluna de comentário. Use uma destas: " + ", ".join(COMMENT_ALIASES)
        )

    class_col = first_existing_column(df, CLASS_ALIASES)
    score_col = first_existing_column(df, SCORE_ALIASES)

    work = pd.DataFrame()
    work["comentario_limpo"] = df[comment_col].map(normalize_text)

    if class_col:
        work["classificacao"] = df[class_col].map(normalize_nps_class)
    elif score_col:
        work["classificacao"] = df[score_col].map(score_to_class)
    else:
        raise ValueError(
            "Não encontrei coluna de classificação nem nota NPS. "
            "Inclua 'classificacao' ou 'nota'."
        )

    work["num_palavras"] = work["comentario_limpo"].str.split().str.len()
    work["possivel_lixo"] = work["comentario_limpo"].map(possible_trash)

    if "possivel_lixo" in df.columns:
        work["possivel_lixo"] = df["possivel_lixo"].astype(bool)
    if "num_palavras" in df.columns:
        work["num_palavras"] = pd.to_numeric(df["num_palavras"], errors="coerce").fillna(work["num_palavras"])
    if "idioma" in df.columns:
        work["idioma"] = df["idioma"].astype(str).str.lower()
    else:
        work["idioma"] = "pt"

    work["sentimento"] = work["classificacao"].map(
        {"promotor": "positivo", "neutro": "neutro", "detrator": "negativo"}
    )

    mask = (
        work["comentario_limpo"].notna()
        & (work["comentario_limpo"].astype(str).str.strip() != "")
        & (~work["possivel_lixo"])
        & (work["idioma"] == "pt")
        & (work["num_palavras"] >= 3)
        & work["sentimento"].notna()
    )
    return work[mask].drop_duplicates("comentario_limpo").copy()


def build_model() -> Pipeline:
    return Pipeline(
        [
            (
                "features",
                FeatureUnion(
                    [
                        (
                            "word",
                            TfidfVectorizer(
                                ngram_range=(1, 3),
                                max_features=80000,
                                sublinear_tf=True,
                                strip_accents="unicode",
                                min_df=3,
                                max_df=0.95,
                            ),
                        ),
                        (
                            "char",
                            TfidfVectorizer(
                                analyzer="char_wb",
                                ngram_range=(3, 5),
                                max_features=60000,
                                sublinear_tf=True,
                                min_df=3,
                                max_df=0.95,
                            ),
                        ),
                    ]
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    C=1.0,
                    class_weight="balanced",
                    max_iter=2000,
                    random_state=RANDOM_STATE,
                    solver="lbfgs",
                ),
            ),
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Treina o modelo ternário de sentimento do NPS Swift.")
    parser.add_argument(
        "--input",
        default="data/processed/dataset_nps_preprocessamento_final.csv",
        help="CSV de treino com comentário e classificação/nota NPS.",
    )
    parser.add_argument(
        "--output",
        default="api/models/modelo_sentimento.joblib",
        help="Caminho de saída do .joblib usado pela API Python.",
    )
    parser.add_argument("--report", default="models/relatorio_modelo_sentimento.json")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    report_path = Path(args.report)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    df_unique = prepare_dataset(input_path)
    if len(df_unique) < 30:
        raise ValueError(f"Poucos comentários elegíveis para treino: {len(df_unique)}")

    X = df_unique["comentario_limpo"].astype(str).values
    y = df_unique["sentimento"].astype(str).values

    train_df, test_df = train_test_split(
        df_unique,
        test_size=0.15,
        random_state=RANDOM_STATE,
        stratify=df_unique["sentimento"],
    )

    X_train = train_df["comentario_limpo"].astype(str).values
    y_train = train_df["sentimento"].astype(str).values
    X_test = test_df["comentario_limpo"].astype(str).values
    y_test = test_df["sentimento"].astype(str).values

    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)
    y_pred_baseline = baseline.predict(X_test)

    model = build_model()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    classes = np.array(["negativo", "neutro", "positivo"])
    weights = compute_class_weight("balanced", classes=classes, y=y_train)

    report = {
        "input": str(input_path),
        "output": str(output_path),
        "registros_elegiveis_unicos": int(len(df_unique)),
        "treino": int(len(train_df)),
        "teste": int(len(test_df)),
        "distribuicao": pd.Series(y).value_counts().to_dict(),
        "class_weights": {cls: float(w) for cls, w in zip(classes, weights)},
        "baseline": {
            "acuracia": float(accuracy_score(y_test, y_pred_baseline)),
            "f1_macro": float(f1_score(y_test, y_pred_baseline, average="macro")),
        },
        "modelo": {
            "acuracia": float(accuracy_score(y_test, y_pred)),
            "f1_macro": float(f1_score(y_test, y_pred, average="macro")),
            "f1_weighted": float(f1_score(y_test, y_pred, average="weighted")),
            "classification_report": classification_report(y_test, y_pred, output_dict=True, zero_division=0),
        },
    }

    # Modelo final: refeito com todos os comentários únicos elegíveis, como no notebook original.
    final_model = build_model()
    final_model.fit(X, y)
    joblib.dump(final_model, output_path)

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Modelo de sentimento salvo em: {output_path}")
    print(f"Relatório salvo em: {report_path}")
    print(json.dumps(report["modelo"], ensure_ascii=False, indent=2)[:1200])


if __name__ == "__main__":
    main()
