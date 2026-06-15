import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { data as defaultData } from "@/data/nps";
import { modelInfo } from "@/lib/npsModel";

export type AnyRow = Record<string, string | number | boolean | null | undefined>;
type DashboardData = Omit<
  typeof defaultData,
  "resumo" | "gestao" | "regiao" | "lojas" | "tendencia" | "problemas" | "elogios" | "problemas_gestao" | "matriz" | "exemplos"
> & {
  resumo: AnyRow;
  gestao: AnyRow[];
  regiao: AnyRow[];
  lojas: AnyRow[];
  tendencia: AnyRow[];
  problemas: AnyRow[];
  elogios: AnyRow[];
  problemas_gestao: AnyRow[];
  matriz?: AnyRow[];
  inferencia?: AnyRow[];
  exemplos?: AnyRow[];
  qualidade_dados?: AnyRow[];
  termos_detratores?: AnyRow[];
  termos_promotores?: AnyRow[];
  bigramas_detratores?: AnyRow[];
  bigramas_promotores?: AnyRow[];
  diagnostico_eda?: AnyRow;
  sourceName?: string;
};

type NpsContextValue = {
  data: DashboardData;
  sourceName: string;
  isUploaded: boolean;
  rowCount: number;
  modelInfo: typeof modelInfo;
  loadCsvFile: (file: File) => Promise<void>;
  resetData: () => void;
  error?: string;
};

type PythonApiResponse =
  | { ok: true; data: DashboardData }
  | { ok: false; error?: string; debug?: string };

const NpsDataContext = createContext<NpsContextValue | null>(null);
const DEFAULT_SOURCE_NAME = "Base inferida padrão";

async function processCsvWithPython(file: File): Promise<DashboardData> {
  const csvText = await file.text();
  const response = await fetch("/api/process_nps", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceName: file.name,
      csvText,
    }),
  });

  let payload: PythonApiResponse | undefined;
  try {
    payload = (await response.json()) as PythonApiResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok || !payload?.ok) {
    const apiError = payload && "error" in payload ? payload.error : undefined;
    throw new Error(apiError || "Não consegui processar o CSV pela API Python da Vercel.");
  }

  return {
    ...defaultData,
    ...payload.data,
    sourceName: file.name,
  } as DashboardData;
}

export function NpsDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>({ ...defaultData, sourceName: DEFAULT_SOURCE_NAME });
  const [sourceName, setSourceName] = useState(DEFAULT_SOURCE_NAME);
  const [error, setError] = useState<string | undefined>();

  const value = useMemo<NpsContextValue>(() => ({
    data,
    sourceName,
    isUploaded: sourceName !== DEFAULT_SOURCE_NAME,
    rowCount: Number(data.resumo?.comentarios ?? 0),
    modelInfo,
    error,
    async loadCsvFile(file: File) {
      setError(undefined);
      try {
        const built = await processCsvWithPython(file);
        setData(built);
        setSourceName(file.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado ao processar o CSV.";
        setError(message);
        throw err;
      }
    },
    resetData() {
      setData({ ...defaultData, sourceName: DEFAULT_SOURCE_NAME });
      setSourceName(DEFAULT_SOURCE_NAME);
      setError(undefined);
    }
  }), [data, sourceName, error]);

  return <NpsDataContext.Provider value={value}>{children}</NpsDataContext.Provider>;
}

export function useNpsData() {
  const ctx = useContext(NpsDataContext);
  if (!ctx) throw new Error("useNpsData must be used inside NpsDataProvider");
  return ctx;
}
