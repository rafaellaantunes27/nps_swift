import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useNpsData } from "@/lib/npsDataContext";
import { PageHeader, Card, CardTitle, StatCard, Badge } from "@/components/dashboard/primitives";
import { NpsDonut, TrendChart, CategoryBar } from "@/components/dashboard/charts";
import { fmtNum, fmtPct, npsBand } from "@/lib/format";
import { MessageSquareText, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { CsvUploadPanel } from "@/components/dashboard/CsvUploadPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Executiva — Swift NPS" },
      { name: "description", content: "Resumo executivo dos indicadores de NPS." },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const { data } = useNpsData();
  const r = data.resumo;
  const band = npsBand(r.nps_ajustado as number);
  const gap = (r.nps_ajustado as number) - (r.nps_tradicional as number);
  const tendencia = data.tendencia.map((t) => ({
    mes_ano: t.mes_ano as string,
    nps_tradicional: t.nps_tradicional as number,
    nps_ajustado: t.nps_ajustado as number,
    comentarios: t.comentarios as number,
  }));
  const topProblemas = data.problemas.slice(0, 7).map((p) => ({
    categoria_modelo: p.categoria_modelo as string,
    qtd: p.qtd as number,
  }));
  const topElogios = data.elogios.slice(0, 7).map((p) => ({
    categoria_modelo: p.categoria_modelo as string,
    qtd: p.qtd as number,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Painel executivo"
        title="Visão Executiva NPS"
        description="Indicadores tradicionais combinados à camada de análise textual dos comentários para uma leitura mais precisa da experiência do cliente."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{fmtNum(r.comentarios as number)} comentários</Badge>
            <Badge tone={band.tone}>NPS {band.label}</Badge>
          </div>
        }
      />

      <CsvUploadPanel />

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          accent
          label="NPS Ajustado"
          value={fmtNum(r.nps_ajustado as number, 1)}
          hint="70% nota + 30% análise textual"
          trend={{ value: `${gap >= 0 ? "+" : ""}${fmtNum(gap, 1)} vs tradicional` }}
        />
        <StatCard
          label="NPS Tradicional"
          value={fmtNum(r.nps_tradicional as number, 1)}
          hint="nota original 0–10"
        />
        <StatCard
          label="Score textual"
          value={fmtNum(r.score_sentimento as number, 1)}
          hint="positivo menos negativo"
        />
        <StatCard
          label="Divergência"
          value={fmtPct(r["divergencia_%"] as number, 1)}
          hint="nota e comentário discordam"
        />
      </section>

      {/* Charts row */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle
            title="Distribuição NPS"
            subtitle="Promotores, neutros e detratores"
          />
          <NpsDonut
            promotores={r["promotores_%"] as number}
            neutros={r["neutros_%"] as number}
            detratores={r["detratores_%"] as number}
            centerValue={fmtNum(r.nps_tradicional as number, 0)}
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle
            title="Evolução mensal do NPS"
            subtitle="Comparação entre NPS tradicional e ajustado"
            right={
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Ajustado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Tradicional
                </span>
              </div>
            }
          />
          <TrendChart data={tendencia} />
        </Card>
      </section>

      {/* Insights */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          icon={<Sparkles className="h-4 w-4" />}
          title="Promotores"
          value={fmtPct(r["promotores_%"] as number)}
          desc="dos clientes recomendam a marca"
        />
        <InsightCard
          icon={<TrendingUp className="h-4 w-4" />}
          title="Sentimento positivo"
          value={fmtPct(r["sentimento_positivo_%"] as number)}
          desc="dos comentários têm tom positivo"
        />
        <InsightCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Detratores"
          value={fmtPct(r["detratores_%"] as number)}
          desc="exigem ação prioritária"
        />
        <InsightCard
          icon={<MessageSquareText className="h-4 w-4" />}
          title="Volume analisado"
          value={fmtNum(r.comentarios as number)}
          desc="comentários processados"
        />
      </section>

      {/* Problems vs Praises */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            title="Principais problemas"
            subtitle="Categorias mais frequentes em comentários negativos"
          />
          <CategoryBar data={topProblemas} color="oklch(0.5 0.05 40)" />
        </Card>
        <Card>
          <CardTitle
            title="Principais elogios"
            subtitle="Categorias mais frequentes em comentários positivos"
          />
          <CategoryBar data={topElogios} />
        </Card>
      </section>
    </>
  );
}

function InsightCard({
  icon,
  title,
  value,
  desc,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
