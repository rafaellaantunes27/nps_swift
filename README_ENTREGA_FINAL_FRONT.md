# Swift NPS Intelligence — Front interativo da entrega final

## O que foi incorporado

Este projeto foi ajustado para ser o **Compilado Executivo do Sentimento** da entrega final.

Ele agora contém:

1. Front interativo em React/TanStack.
2. Upload de CSV diretamente no site.
3. Inferência automática de sentimento e categoria no navegador.
4. Cálculo automático de:
   - NPS tradicional
   - Score textual
   - NPS ajustado
   - Divergência entre nota e comentário
   - Flags de baixa confiança
5. Painéis para:
   - Visão executiva
   - Comparativo Germinare/Regular/Externos
   - Tendência mensal
   - Ranking e análise por loja
   - Categorias, matriz NPS × categoria e exemplos de comentários
6. Artefatos de entrega em `entrega_final/`.
7. Modelos/artefatos em `public/models/`.

## Como rodar

```bash
npm install
npm run dev
```

ou, se usarem Bun:

```bash
bun install
bun run dev
```

## Como usar o CSV no site

Na página inicial, clique em **Anexar CSV**.

O dashboard tenta reconhecer automaticamente colunas com estes nomes ou equivalentes:

- nota: `nota`, `score`, `nps`, `avaliacao`, `rating`, `nota_nps`
- comentário: `comentario`, `comentário`, `comment`, `texto`, `feedback`, `comentario_cliente`
- loja: `centronv2`, `loja`, `store`, `unidade`, `centro`
- gestão: `tipo_gestao`, `gestao`, `gerencia`, `perfil_gestao`
- região: `regiao_im`, `regiao`, `regional`, `cluster`
- data: `mes_ano`, `data`, `data_resposta`, `data_pesquisa`, `created_at`

Após o upload, todos os gráficos e tabelas são recalculados automaticamente.

## Exportação

Depois de anexar o CSV, use **Baixar inferência** para gerar a base completa anotada pelos modelos no navegador.

## Observação técnica

Os arquivos `.joblib` estão preservados em `public/models/` para a entrega técnica.
Como navegador não carrega `.joblib` diretamente, o site usa uma versão incorporada em TypeScript para a inferência client-side.
