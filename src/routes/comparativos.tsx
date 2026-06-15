import { createFileRoute } from "@tanstack/react-router";
import { useNpsData } from "@/lib/npsDataContext";
import { PageHeader, Card, CardTitle, StatCard, Badge } from "@/components/dashboard/primitives";
import { GroupCompareBar } from "@/components/dashboard/charts";
import { fmtNum, fmtPct } from "@/lib/format";

export const Route = createFileRoute("/comparativos")({
  head: () => ({
    meta: [
      { title: "Comparativos — Swift NPS" },
      { name: "description", content: "Comparação por tipo de gestão e região." },
    ],
  }),
  component: ComparativosPage,
});

function ComparativosPage() {
  const { data } = useNpsData();
  const gestao = data.gestao.map((g) => ({
    grupo: g.tipo_gestao as string,
    "NPS Tradicional": Number((g.nps_tradicional as number).toFixed(1)),
    "NPS Ajustado": Number((g.nps_ajustado as number).toFixed(1)),
    "Score Textual": Number((g.score_sentimento as number).toFixed(1)),
  }));
  const regiao = data.regiao.map((g) => ({
    grupo: g.regiao_im as string,
    "NPS Tradicional": Number((g.nps_tradicional as number).toFixed(1)),
    "NPS Ajustado": Number((g.nps_ajustado as number).toFixed(1)),
    "Score Textual": Number((g.score_sentimento as number).toFixed(1)),
  }));

  const regular = data.gestao.find((g) => String(g.tipo_gestao).toLowerCase().includes("regular"));
  const germinare = data.gestao.find((g) => String(g.tipo_gestao).toLowerCase().includes("germinare") || String(g.tipo_gestao).toLowerCase().includes("tocadora"));
  const gapAjustado = regular && germinare ? Number(germinare.nps_ajustado) - Number(regular.nps_ajustado) : 0;
  const leitura = gapAjustado >= 0
    ? "Germinare/Tocadora aparece acima ou igual ao grupo Regular no NPS ajustado."
    : "Regular aparece acima de Germinare/Tocadora no NPS ajustado; vale investigar categorias e comentários.";

  return (
    <>
      <PageHeader
        eyebrow="Recortes"
        title="Comparativos por gestão e região"
        description="Veja como o NPS tradicional, o ajustado e o score textual variam entre tipos de gestão e regiões."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          accent
          label="Gap Germinare × Regular"
          value={`${gapAjustado >= 0 ? "+" : ""}${fmtNum(gapAjustado, 1)}`}
          hint="diferença no NPS ajustado"
        />
        <StatCard
          label="Regular"
          value={regular ? fmtNum(regular.nps_ajustado as number, 1) : "—"}
          hint="NPS ajustado do grupo"
        />
        <StatCard
          label="Germinare/Tocadora"
          value={germinare ? fmtNum(germinare.nps_ajustado as number, 1) : "—"}
          hint={leitura}
        />
      </section>

      <Card className="mb-6">
        <CardTitle
          title="Por tipo de gestão"
          subtitle="Foco da análise: Germinare/Tocadora × Regular/externos"
          right={<Badge tone={gapAjustado >= 0 ? "success" : "warning"}>{gapAjustado >= 0 ? "vantagem Germinare" : "atenção Germinare"}</Badge>}
        />
        <GroupCompareBar
          data={gestao}
          keys={[
            { dataKey: "NPS Tradicional", label: "NPS Tradicional", color: "oklch(0.55 0.05 45)" },
            { dataKey: "NPS Ajustado", label: "NPS Ajustado", color: "var(--color-primary)" },
            { dataKey: "Score Textual", label: "Score textual", color: "oklch(0.78 0.12 60)" },
          ]}
        />
        <DetailTable
          headers={["Gestão", "Comentários", "Promotores", "Detratores", "NPS Trad.", "NPS Ajust.", "Score textual"]}
          rows={data.gestao.map((g) => [
            g.tipo_gestao as string,
            fmtNum(g.comentarios as number),
            fmtPct(g["promotores_%"] as number),
            fmtPct(g["detratores_%"] as number),
            fmtNum(g.nps_tradicional as number, 1),
            fmtNum(g.nps_ajustado as number, 1),
            fmtNum(g.score_sentimento as number, 1),
          ])}
        />
      </Card>

      <Card>
        <CardTitle title="Por região" subtitle="Comparativo Capital, Interior, Litoral, Sul/Sudeste" />
        <GroupCompareBar
          data={regiao}
          keys={[
            { dataKey: "NPS Tradicional", label: "NPS Tradicional", color: "oklch(0.55 0.05 45)" },
            { dataKey: "NPS Ajustado", label: "NPS Ajustado", color: "var(--color-primary)" },
            { dataKey: "Score Textual", label: "Score textual", color: "oklch(0.78 0.12 60)" },
          ]}
        />
        <DetailTable
          headers={["Região", "Comentários", "Promotores", "Detratores", "NPS Trad.", "NPS Ajust.", "Score textual"]}
          rows={data.regiao.map((g) => [
            g.regiao_im as string,
            fmtNum(g.comentarios as number),
            fmtPct(g["promotores_%"] as number),
            fmtPct(g["detratores_%"] as number),
            fmtNum(g.nps_tradicional as number, 1),
            fmtNum(g.nps_ajustado as number, 1),
            fmtNum(g.score_sentimento as number, 1),
          ])}
        />
      </Card>
    </>
  );
}

function DetailTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-6 overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                  i === 0 ? "text-left" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-3 ${ci === 0 ? "text-left font-semibold" : "text-right font-medium tabular-nums"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
