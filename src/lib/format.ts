export const fmtNum = (v: number | null | undefined, digits = 0) =>
  v == null || isNaN(v as number)
    ? "—"
    : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v == null || isNaN(v as number) ? "—" : `${fmtNum(v, digits)}%`;

export const npsBand = (v: number) => {
  if (v >= 75) return { label: "Excelente", tone: "success" as const };
  if (v >= 50) return { label: "Bom", tone: "primary" as const };
  if (v >= 0) return { label: "Atenção", tone: "warning" as const };
  return { label: "Crítico", tone: "destructive" as const };
};

export const fmtMes = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
};
