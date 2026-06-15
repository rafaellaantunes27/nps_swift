from __future__ import annotations

from pathlib import Path

import joblib

SENTIMENT_MODEL = Path("api/models/modelo_sentimento.joblib")
CATEGORY_MODEL = Path("api/models/modelo_categorizacao.joblib")

EXEMPLOS = [
    "Atendimento excelente e produtos de ótima qualidade.",
    "Preço muito alto e fila demorada no caixa.",
    "O app travou no pagamento e o pedido atrasou.",
    "Carne veio dura e com muita gordura.",
    "Loja organizada, mas faltou promoção.",
]


def main() -> None:
    if not SENTIMENT_MODEL.exists():
        raise FileNotFoundError(f"Modelo não encontrado: {SENTIMENT_MODEL}")
    if not CATEGORY_MODEL.exists():
        raise FileNotFoundError(f"Modelo não encontrado: {CATEGORY_MODEL}")

    sentimento = joblib.load(SENTIMENT_MODEL)
    categoria = joblib.load(CATEGORY_MODEL)

    print("Teste rápido dos modelos:\n")
    for texto in EXEMPLOS:
        sent = sentimento.predict([texto])[0]
        cat = categoria.predict([texto])[0]
        print(f"Comentário: {texto}")
        print(f"  sentimento: {sent}")
        print(f"  categoria:   {cat}\n")


if __name__ == "__main__":
    main()
