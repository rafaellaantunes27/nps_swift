import { createFileRoute } from "@tanstack/react-router";
import { useNpsData } from "@/lib/npsDataContext";
import { PageHeader, Card, CardTitle, StatCard } from "@/components/dashboard/primitives";
import { TrendChart, VolumeChart } from "@/components/dashboard/charts";
import { fmtNum } from "@/lib/format";

export const Route = createFileRoute("/tendencia")({
  head: () => ({
    meta: [
      { title: "Tendência mensal — Swift NPS" },
      { name: "description", content: "Evolução mensal do NPS e volume de comentários." },
    ],
  }),
  component: TendenciaPage,
});

function TendenciaPage() {
  const { data } = useNpsData();
  const t = data.tendencia.map((x) => ({
    mes_ano: x.mes_ano as string,
    nps_tradicional: x.nps_tradicional as number,
    nps_ajustado: x.nps_ajustado as number,
    comentarios: x.comentarios as number,
  }));
  const last = t[t.length - 1];
  const first = t[0];
  const delta = last.nps_ajustado - first.nps_ajustado;
  const maxMonth = [...t].sort((a, b) => b.nps_ajustado - a.nps_ajustado)[0];
  const minMonth = [...t].sort((a, b) => a.nps_ajustado - b.nps_ajustado)[0];

  return (
    <>
      <PageHeader
        eyebrow="Série temporal"
        title="Tendência mensal"
        description={`Evolução de janeiro a ${new Date(last.mes_ano).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.`}
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard accent label="NPS atual" value={fmtNum(last.nps_ajustado, 1)} hint="último mês fechado" trend={{ value: `${delta >= 0 ? "+" : ""}${fmtNum(delta, 1)} no período` }} />
        <StatCard label="Melhor mês" value={fmtNum(maxMonth.nps_ajustado, 1)} hint={new Date(maxMonth.mes_ano).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} />
        <StatCard label="Pior mês" value={fmtNum(minMonth.nps_ajustado, 1)} hint={new Date(minMonth.mes_ano).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} />
        <StatCard label="Comentários no mês" value={fmtNum(last.comentarios)} hint="volume mais recente" />
      </section>

      <Card className="mb-6">
        <CardTitle title="NPS Tradicional × Ajustado" subtitle="Linhas suavizadas com sombreamento de tendência" />
        <TrendChart data={t} />
      </Card>

      <Card>
        <CardTitle title="Volume mensal de comentários" subtitle="Quantidade processada mês a mês" />
        <VolumeChart data={t} />
      </Card>
    </>
  );
}
