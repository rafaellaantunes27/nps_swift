
import { useRef, useState } from "react";
import { UploadCloud, RotateCcw, FileSpreadsheet, Info } from "lucide-react";
import { Card, Badge } from "@/components/dashboard/primitives";
import { fmtNum } from "@/lib/format";
import { useNpsData } from "@/lib/npsDataContext";

export function CsvUploadPanel() {
  const { data, loadCsvFile, resetData, sourceName, isUploaded, rowCount, error, modelInfo } = useNpsData();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);


  function downloadInference() {
    const rows = data.inferencia ?? [];
    if (!rows.length) return;
    const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r)))) as string[];
    const escape = (value: unknown) => {
      const s = String(value ?? "");
      return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `base_inferencia_${sourceName.replace(/[^a-z0-9_-]+/gi, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      await loadCsvFile(file);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6 border-primary/20 bg-[linear-gradient(135deg,var(--color-card)_0%,var(--color-primary-soft)_160%)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">CSV dinâmico</Badge>
            <Badge>{isUploaded ? "Base enviada pelo site" : "Base padrão do projeto"}</Badge>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight">
            Upload de CSV com inferência automática
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Ao anexar um CSV, o front identifica nota, comentário, loja, gestão, região e data; aplica os modelos
            incorporados de sentimento e categorização; calcula NPS tradicional, score textual, NPS ajustado e
            atualiza todos os painéis.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium">
              <FileSpreadsheet className="h-3.5 w-3.5" /> {sourceName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium">
              <Info className="h-3.5 w-3.5" /> {fmtNum(rowCount)} comentários processados
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 font-medium">
              Fórmula: {modelInfo.npsFormula}
            </span>
          </div>
          {error && (
            <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60"
          >
            <UploadCloud className="h-4 w-4" />
            {loading ? "Processando..." : "Anexar CSV"}
          </button>
          <button
            type="button"
            onClick={downloadInference}
            disabled={!isUploaded || !data.inferencia?.length}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-soft px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-soft/80 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Baixar inferência
          </button>
          <button
            type="button"
            onClick={resetData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </button>
        </div>
      </div>
    </Card>
  );
}
