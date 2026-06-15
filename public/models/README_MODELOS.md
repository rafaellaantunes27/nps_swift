# Modelos incorporados ao front

Esta pasta contém os artefatos de modelo e a base inferida usada como referência do projeto.

## Arquivos

- `sentiment_model.joblib`: modelo salvo para análise de sentimento.
- `category_model.joblib`: modelo salvo para categorização dos comentários.
- `model_metrics.json`: métricas registradas dos modelos.
- `base_inferida_swift.csv.gz`: base de comentários inferida.
- `model_manifest.json`: manifesto dos artefatos.

## Uso no dashboard

O front em React/TanStack possui um motor de inferência em TypeScript em `src/lib/npsModel.ts`.
Ele permite que o site processe CSV diretamente no navegador, sem backend Python, gerando:

- `sentimento_modelo`
- `confianca_sentimento`
- `baixa_confianca_sentimento`
- `categoria_modelo`
- `confianca_categoria`
- `baixa_confianca_categoria`
- `classificacao_nps`
- `divergencia_nota_texto`

A fórmula usada no painel é:

`NPS_ajustado = 0,7 × NPS_tradicional + 0,3 × Score_sentimento`

Os arquivos `.joblib` ficam preservados para a entrega técnica e para carregamento em Python, caso o professor peça reprodução fora do front.
