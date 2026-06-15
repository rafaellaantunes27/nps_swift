import { createFileRoute } from "@tanstack/react-router";
import { useNpsData } from "@/lib/npsDataContext";
import { PageHeader, Card, CardTitle } from "@/components/dashboard/primitives";
import { CategoryBar } from "@/components/dashboard/charts";
import { fmtNum, fmtPct } from "@/lib/format";
import type { ReactNode } from "react";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Swift NPS" },
      { name: "description", content: "Categorias de problemas e elogios extraídas dos comentários." },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const { data } = useNpsData();
  const problemas = data.problemas.map((p) => ({
    categoria_modelo: p.categoria_modelo as string,
    qtd: p.qtd as number,
  }));
  const elogios = data.elogios.map((p) => ({
    categoria_modelo: p.categoria_modelo as string,
    qtd: p.qtd as number,
  }));
  const totalProb = problemas.reduce((s, p) => s + p.qtd, 0);
  const totalElo = elogios.reduce((s, p) => s + p.qtd, 0);

  // problemas por gestão — agrupar
  const byGroup = new Map<string, { categoria: string; qtd: number; pct: number }[]>();
  for (const r of data.problemas_gestao) {
    const g = r.tipo_gestao as string;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push({
      categoria: r.categoria_modelo as string,
      qtd: r.qtd as number,
      pct: r.pct_no_grupo as number,
    });
  }

  const matriz = data.matriz ?? [];
  const categoriasMatriz = [...new Set(matriz.map((m) => m.categoria_modelo as string))];
  const classesNps = ["detrator", "neutro", "promotor"];
  const exemplosBase = data.inferencia ?? data.exemplos ?? [];
  const exemplosNegativos = exemplosBase
    .filter((r) => r.sentimento_modelo === "negativo" && String(r.comentario ?? "").length > 12)
    .slice(0, 6);
  const exemplosPositivos = exemplosBase
    .filter((r) => r.sentimento_modelo === "positivo" && String(r.comentario ?? "").length > 12)
    .slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Análise textual"
        title="Categorias de problemas e elogios"
        description="Temas extraídos automaticamente dos comentários para guiar planos de ação."
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            title="Problemas mais citados"
            subtitle={`${fmtNum(totalProb)} menções classificadas`}
          />
          <CategoryBar data={problemas} color="oklch(0.5 0.05 40)" />
        </Card>
        <Card>
          <CardTitle
            title="Elogios mais citados"
            subtitle={`${fmtNum(totalElo)} menções classificadas`}
          />
          <CategoryBar data={elogios} />
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...byGroup.entries()].map(([grupo, items]) => (
          <Card key={grupo}>
            <CardTitle title={grupo} subtitle="% de cada categoria dentro do grupo" />
            <ul className="space-y-3">
              {items
                .sort((a, b) => b.qtd - a.qtd)
                .slice(0, 6)
                .map((it) => (
                  <li key={it.categoria}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium truncate pr-2">{it.categoria}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {fmtNum(it.qtd)} · {fmtPct(it.pct, 1)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, it.pct * 2.5)}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </section>

      {matriz.length > 0 && (
        <Card className="mt-6">
          <CardTitle
            title="Matriz NPS × categoria"
            subtitle="Classifica detratores, neutros e promotores dentro dos tipos de comentário"
          />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Classificação NPS
                  </th>
                  {categoriasMatriz.map((cat) => (
                    <th key={cat} className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classesNps.map((cls) => (
                  <tr key={cls} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-3 font-semibold capitalize">{cls}</td>
                    {categoriasMatriz.map((cat) => {
                      const cell = matriz.find((m) => m.classificacao_nps === cls && m.categoria_modelo === cat);
                      return (
                        <td key={cat} className="px-3 py-3 text-right tabular-nums">
                          <span className={cls === "detrator" && Number(cell?.qtd ?? 0) > 0 ? "font-bold text-destructive" : "font-medium"}>
                            {fmtNum(Number(cell?.qtd ?? 0))}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({fmtPct(Number(cell?.pct_linha ?? 0), 1)})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(exemplosNegativos.length > 0 || exemplosPositivos.length > 0) && (
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle title="Exemplos representativos de problemas" subtitle="Comentários negativos com maior sinal textual" />
            <CommentList>
              {exemplosNegativos.map((r, i) => (
                <CommentItem key={i} categoria={String(r.categoria_modelo ?? "")} loja={String(r.centronv2 ?? "")}>
                  {String(r.comentario ?? "")}
                </CommentItem>
              ))}
            </CommentList>
          </Card>
          <Card>
            <CardTitle title="Exemplos representativos de elogios" subtitle="Comentários positivos para leitura executiva" />
            <CommentList>
              {exemplosPositivos.map((r, i) => (
                <CommentItem key={i} categoria={String(r.categoria_modelo ?? "")} loja={String(r.centronv2 ?? "")}>
                  {String(r.comentario ?? "")}
                </CommentItem>
              ))}
            </CommentList>
          </Card>
        </section>
      )}
    </>
  );
}

function CommentList({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function CommentItem({ children, categoria, loja }: { children: ReactNode; categoria: string; loja: string; key?: unknown }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">{categoria}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">{loja}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
