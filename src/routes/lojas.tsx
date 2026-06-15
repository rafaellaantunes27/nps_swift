import { createFileRoute } from "@tanstack/react-router";
import { useNpsData } from "@/lib/npsDataContext";
import { useMemo, useState, type ReactNode } from "react";
import { PageHeader, Card, CardTitle, Badge } from "@/components/dashboard/primitives";
import { fmtNum, fmtPct, npsBand } from "@/lib/format";
import { Search, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/lojas")({
  head: () => ({
    meta: [
      { title: "Ranking de Lojas — Swift NPS" },
      { name: "description", content: "NPS por loja, com filtros por gestão e região." },
    ],
  }),
  component: LojasPage,
});

type SortKey = "nps_ajustado" | "nps_tradicional" | "comentarios";

function LojasPage() {
  const { data } = useNpsData();
  const [q, setQ] = useState("");
  const [gestao, setGestao] = useState<string>("Todas");
  const [regiao, setRegiao] = useState<string>("Todas");
  const [sortKey, setSortKey] = useState<SortKey>("nps_ajustado");
  const [asc, setAsc] = useState(false);

  const gestoes = useMemo(() => ["Todas", ...new Set(data.lojas.map((l) => l.tipo_gestao as string))], [data.lojas]);
  const regioes = useMemo(() => ["Todas", ...new Set(data.lojas.map((l) => l.regiao_im as string))], [data.lojas]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return data.lojas
      .slice()
      .filter((l) => (gestao === "Todas" ? true : l.tipo_gestao === gestao))
      .filter((l) => (regiao === "Todas" ? true : l.regiao_im === regiao))
      .filter((l) =>
        ql === ""
          ? true
          : (l.centronv2 as string).toLowerCase().includes(ql) ||
            (l.municipio as string).toLowerCase().includes(ql),
      )
      .sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        return asc ? av - bv : bv - av;
      });
  }, [q, gestao, regiao, sortKey, asc]);

  return (
    <>
      <PageHeader
        eyebrow="Ranking"
        title="Performance por loja"
        description="Ordene, filtre e busque entre todas as lojas para identificar líderes e oportunidades."
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por loja ou município"
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Select value={gestao} onChange={setGestao} options={gestoes} label="Gestão" />
          <Select value={regiao} onChange={setRegiao} options={regioes} label="Região" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filtered.length}</span> de {data.lojas.length} lojas
        </p>
      </Card>

      <Card>
        <CardTitle title="Lojas" subtitle="Clique nos cabeçalhos para reordenar" />
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Loja</Th>
                <Th>Município</Th>
                <Th>Gestão</Th>
                <ThSort active={sortKey === "comentarios"} asc={asc} onClick={() => toggle("comentarios")}>Comentários</ThSort>
                <ThSort active={sortKey === "nps_tradicional"} asc={asc} onClick={() => toggle("nps_tradicional")}>NPS Trad.</ThSort>
                <ThSort active={sortKey === "nps_ajustado"} asc={asc} onClick={() => toggle("nps_ajustado")}>NPS Ajust.</ThSort>
                <Th>Top problemas</Th>
                <Th>Top elogios</Th>
                <Th>Alerta</Th>
                <Th>Faixa</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((l) => {
                const band = npsBand(l.nps_ajustado as number);
                return (
                  <tr key={l.centronv2 as string} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <Td className="font-semibold">{l.centronv2}</Td>
                    <Td className="text-muted-foreground">{l.municipio}</Td>
                    <Td><Badge>{l.tipo_gestao as string}</Badge></Td>
                    <Td right>{fmtNum(l.comentarios as number)}</Td>
                    <Td right className="tabular-nums">{fmtNum(l.nps_tradicional as number, 1)}</Td>
                    <Td right className="tabular-nums font-semibold">{fmtNum(l.nps_ajustado as number, 1)}</Td>
                    <Td className="max-w-[220px] text-xs text-muted-foreground">{String(l.top_problemas ?? "Sem padrão claro")}</Td>
                    <Td className="max-w-[220px] text-xs text-muted-foreground">{String(l.top_elogios ?? "Sem padrão claro")}</Td>
                    <Td>{String(l.alerta_delta_nps ?? "Não") === "Sim" ? <Badge tone="warning">Diferença alta</Badge> : <Badge>OK</Badge>}</Td>
                    <Td><Badge tone={band.tone}>{band.label}</Badge></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 80 && (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              Exibindo as 80 primeiras. Refine os filtros para reduzir a lista.
            </p>
          )}
        </div>
      </Card>
    </>
  );

  function toggle(k: SortKey) {
    if (k === sortKey) setAsc((s) => !s);
    else {
      setSortKey(k);
      setAsc(false);
    }
  }
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none font-medium"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</th>;
}
function ThSort({ children, active, asc, onClick }: { children: ReactNode; active: boolean; asc: boolean; onClick: () => void }) {
  return (
    <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? "text-primary" : ""}`}>
        {children}
        <ArrowUpDown className="h-3 w-3" />
        {active && <span className="text-[10px]">{asc ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
function Td({ children, right, className = "" }: { children: ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-3 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}
