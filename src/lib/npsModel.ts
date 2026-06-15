export const modelInfo = {
  sentiment: {
    name: "Modelo de sentimento processado em Python",
    labels: ["positivo", "neutro", "negativo"],
    output: ["sentimento_modelo", "confianca_sentimento", "baixa_confianca_sentimento"],
  },
  category: {
    name: "Modelo de categorização processado em Python",
    labels: [
      "Atendimento / Loja física",
      "Preço / Promoções",
      "Qualidade do produto",
      "App / Site / Pagamento",
      "Entrega / Pedido digital",
      "Outros / Genéricos",
    ],
    output: ["categoria_modelo", "confianca_categoria", "baixa_confianca_categoria"],
  },
  npsFormula: "NPS_ajustado = 0,7 × NPS_tradicional + 0,3 × Score_sentimento",
};
