from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api.nps_engine import build_dashboard, read_csv_path, to_typescript_module


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera src/data/nps.ts usando o motor Python do dashboard.")
    parser.add_argument(
        "--input",
        default="public/models/base_inferida_swift.csv.gz",
        help="CSV/CSV.GZ de entrada. Padrão: public/models/base_inferida_swift.csv.gz",
    )
    parser.add_argument(
        "--output",
        default="src/data/nps.ts",
        help="Arquivo TypeScript de saída. Padrão: src/data/nps.ts",
    )
    args = parser.parse_args()

    input_path = ROOT / args.input
    output_path = ROOT / args.output
    rows = read_csv_path(input_path)
    data = build_dashboard(rows, "Base inferida padrão")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(to_typescript_module(data), encoding="utf-8")
    print(f"Gerado: {output_path.relative_to(ROOT)}")
    print(f"Linhas processadas: {len(rows):,}".replace(",", "."))


if __name__ == "__main__":
    main()
