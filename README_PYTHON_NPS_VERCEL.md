# Patch Python + Vercel — NPS Swift

Este patch move a maior parte do processamento do dashboard para Python sem alterar o visual do front.

## O que foi para Python

- Leitura e detecção de CSV com separador `;`, `,` ou tab.
- Padronização de colunas por aliases.
- Classificação NPS por nota ou pela coluna `classificacao` já existente.
- Cálculo ponderado por `qtd_clientes`, seguindo o racional dos notebooks.
- NPS tradicional: `% promotores - % detratores`.
- Score de sentimento: `% positivo - % negativo`.
- NPS ajustado: `0,7 × NPS tradicional + 0,3 × score sentimento`.
- Sentimento ternário: positivo, neutro e negativo.
- Regra de comentário misto: falha operacional pesa mais e tende a negativo.
- Categorias single-label baseadas na taxonomia dos notebooks:
  - Atendimento / Loja física
  - Preço / Promoções
  - Qualidade do produto
  - App / Site / Pagamento
  - Entrega / Pedido digital
  - Outros / Genéricos
- Flags de qualidade de texto:
  - comentário real
  - texto curto
  - duplicata exata
  - duplicata normalizada
  - emoji
  - possível lixo/spam
  - possível não português
- Ranking por loja, gestão, região, tendência mensal, matriz NPS × categoria, exemplos representativos e termos mais frequentes.

## Como aplicar

Extraia este ZIP por cima da pasta atual do projeto. Não apague o projeto inteiro.

Depois rode:

```powershell
npm install
npm run build
```

Se passar:

```powershell
git add .
git commit -m "move calculos nps para python"
git push
```

## Teste local da API Python

Para testar upload de CSV com a API Python, use:

```powershell
npx vercel dev
```

O `npm run dev` sobe o front, mas nem sempre simula `/api/process_nps` igual à Vercel.

## Regenerar base padrão com Python

Opcionalmente:

```powershell
python scripts/gerar_dados_nps.py
```

Por padrão, o script usa `public/models/base_inferida_swift.csv.gz` e recria `src/data/nps.ts`.


## Atualização de modelos treinados

Este patch inclui os modelos enviados em:

```text
api/models/modelo_sentimento.joblib
api/models/modelo_categorizacao.joblib
```

O Python usa esses modelos primeiro. Se algum modelo não carregar na Vercel/local, o dashboard continua funcionando com as heurísticas de fallback de `api/nps_engine.py`.

Para trocar os modelos no futuro, substitua os arquivos `.joblib` dentro de `api/models/` mantendo os mesmos nomes.

As dependências Python necessárias para carregar os modelos ficam em:

```text
requirements.txt
```

