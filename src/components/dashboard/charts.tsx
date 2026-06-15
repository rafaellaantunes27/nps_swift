import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { fmtNum, fmtPct, fmtMes } from "@/lib/format";

const COLORS = {
  primary: "var(--color-primary)",
  primaryGlow: "var(--color-primary-glow)",
  muted: "var(--color-muted-foreground)",
  axis: "var(--color-muted-foreground)",
  grid: "var(--color-border)",
  foreground: "var(--color-foreground)",
};

const TOOLTIP_STYLE = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  boxShadow: "var(--shadow-elevated)",
  padding: "8px 12px",
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

export function NpsDonut({
  promotores,
  neutros,
  detratores,
  centerValue,
  centerLabel = "NPS",
}: {
  promotores: number;
  neutros: number;
  detratores: number;
  centerValue: string;
  centerLabel?: string;
}) {
  const data = [
    { name: "Promotores", value: promotores, color: "var(--color-primary)" },
    { name: "Neutros", value: neutros, color: "oklch(0.82 0.04 60)" },
    { name: "Detratores", value: detratores, color: "oklch(0.45 0.04 40)" },
  ];
  return (
    <div className="relative h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={75}
            outerRadius={108}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number, n) => [`${fmtNum(v as number, 1)}%`, n as string]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {centerLabel}
        </span>
        <span className="font-display text-4xl font-bold tracking-tight">
          {centerValue}
        </span>
      </div>
    </div>
  );
}

export function TrendChart({
  data,
}: {
  data: Array<{ mes_ano: string; nps_tradicional: number; nps_ajustado: number; comentarios: number }>;
}) {
  const formatted = data.map((d) => ({
    mes: fmtMes(d.mes_ano),
    "NPS Tradicional": Number(d.nps_tradicional.toFixed(1)),
    "NPS Ajustado": Number(d.nps_ajustado.toFixed(1)),
    Comentários: d.comentarios,
  }));
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="ajustado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tradicional" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.05 45)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="oklch(0.55 0.05 45)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="NPS Tradicional"
            stroke="oklch(0.45 0.05 45)"
            strokeWidth={2}
            fill="url(#tradicional)"
          />
          <Area
            type="monotone"
            dataKey="NPS Ajustado"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fill="url(#ajustado)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VolumeChart({
  data,
}: {
  data: Array<{ mes_ano: string; comentarios: number }>;
}) {
  const formatted = data.map((d) => ({
    mes: fmtMes(d.mes_ano),
    Comentários: d.comentarios,
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v as number)} />
          <Bar dataKey="Comentários" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBar({
  data,
  color = "var(--color-primary)",
}: {
  data: Array<{ categoria_modelo: string; qtd: number }>;
  color?: string;
}) {
  const formatted = [...data]
    .sort((a, b) => a.qtd - b.qtd)
    .map((d) => ({ name: d.categoria_modelo, value: d.qtd }));
  return (
    <div style={{ height: Math.max(260, formatted.length * 38) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={formatted} margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: COLORS.foreground, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={180}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v as number)} />
          <Bar dataKey="value" fill={color} radius={[0, 8, 8, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupCompareBar({
  data,
  keys,
}: {
  data: Array<Record<string, any>>;
  keys: { dataKey: string; label: string; color: string }[];
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="grupo" tick={{ fill: COLORS.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v as number, 1)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          {keys.map((k) => (
            <Bar key={k.dataKey} dataKey={k.dataKey} name={k.label} fill={k.color} radius={[8, 8, 0, 0]} barSize={28} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
