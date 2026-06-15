from __future__ import annotations

from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]
SENTIMENT_CANDIDATES = [
    ROOT / "api/models/modelo_sentimento.joblib",
    ROOT / "entrega/modelos_salvos/modelo_sentimento.joblib",
]
CATEGORY_CANDIDATES = [
    ROOT / "api/models/modelo_categorizacao.joblib",
    ROOT / "entrega/modelos_salvos/modelo_categorizacao.joblib",
]

EXEMPLOS = [
    "Atendimento excelente e produtos de ótima qualidade.",
    "Preço muito alto e fila demorada no caixa.",
    "O app travou no pagamento e o pedido atrasou.",
    "Carne veio dura e com muita gordura.",
    "Loja organizada, mas faltou promoção.",
]


def first_existing(paths: list[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError("Nenhum modelo encontrado em: " + ", ".join(str(p) for p in paths))


def main() -> None:
    sentiment_path = first_existing(SENTIMENT_CANDIDATES)
    category_path = first_existing(CATEGORY_CANDIDATES)

    sentimento = joblib.load(sentiment_path)
    categoria = joblib.load(category_path)

    print(f"Modelo sentimento: {sentiment_path.relative_to(ROOT)}")
    print(f"Modelo categoria:   {category_path.relative_to(ROOT)}\n")

    for texto in EXEMPLOS:
        sent = sentimento.predict([texto])[0]
        cat = categoria.predict([texto])[0]
        print(f"Comentário: {texto}")
        print(f"  sentimento: {sent}")
        print(f"  categoria:   {cat}\n")


if __name__ == "__main__":
    main()
