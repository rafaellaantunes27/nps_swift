# Projeto NPS Swift — Entrega Final

Dashboard interativo em React/TanStack Start + API Python para análise de NPS, sentimento e categorização de comentários de clientes da Swift.

## O que este projeto entrega

- Front interativo publicado na Vercel.
- API Python em `/api/process_nps.py` para processar CSV enviado pelo dashboard.
- Motor de cálculo em Python em `/api/nps_engine.py`.
- Modelos leves em JSON.GZ para rodar na Vercel sem estourar limite de Lambda.
- Modelos salvos em `.joblib` dentro de `entrega/modelos_salvos/` para a entrega acadêmica.
- Base completa inferida em `entrega/outputs/base_inferida_completa.csv.gz`.
- Relatórios CSV e Markdown em `entrega/outputs/`.
- Notebooks e documentação em `entrega/notebooks/` e `entrega/README_ENTREGA_FINAL.md`.

## Como rodar localmente

Requisitos:

- Node.js 22.x
- Python 3.12+

```powershell
npm install
npm run build
npm run dev
```

Para testar a API Python igual à Vercel:

```powershell
npx vercel dev
```

## Como publicar na Vercel

O projeto já está configurado com:

- `vercel.json` usando `tanstack-start`;
- `.python-version` com Python 3.12;
- `.vercelignore` ignorando artefatos pesados da entrega;
- modelos leves em `api/models/*.json.gz`.

Depois de alterar:

```powershell
git add .
git commit -m "entrega final nps swift"
git push
```

## Arquivos principais

```text
api/nps_engine.py                  # cálculo NPS, sentimento, categoria, matrizes e análises
api/process_nps.py                 # endpoint Python da Vercel
api/lightweight_models.py          # inferência leve sem sklearn/numpy/scipy
api/models/*.json.gz               # modelos leves usados na Vercel
src/lib/npsDataContext.tsx         # front chama a API Python
src/data/nps.ts                    # base padrão já carregada no dashboard
entrega/                           # pacote acadêmico da entrega final
```

## NPS ajustado usado

```text
NPS_ajustado = 0,7 × NPS_tradicional + 0,3 × Score_sentimento
```

Onde:

```text
NPS_tradicional = % promotores - % detratores
Score_sentimento = % comentários positivos - % comentários negativos
```

O indicador ajustado é complementar ao NPS tradicional; ele não substitui a métrica oficial.
