from __future__ import annotations

import json
import traceback
from http.server import BaseHTTPRequestHandler

from api.nps_engine import dashboard_from_csv_text

MAX_BODY_BYTES = 10 * 1024 * 1024


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("content-length") or "0")
            if length <= 0:
                self._send_json(400, {"ok": False, "error": "Nenhum arquivo foi enviado."})
                return
            if length > MAX_BODY_BYTES:
                self._send_json(413, {"ok": False, "error": "CSV muito grande para processar pela API Python. Reduza a base ou gere o JSON localmente."})
                return

            raw = self.rfile.read(length).decode("utf-8", errors="replace")
            payload = json.loads(raw)
            csv_text = payload.get("csvText") or payload.get("csv") or ""
            source_name = payload.get("sourceName") or payload.get("filename") or "Base enviada"
            data = dashboard_from_csv_text(csv_text, source_name)
            self._send_json(200, {"ok": True, "data": data})
        except ValueError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Erro no processamento Python: {exc}", "debug": traceback.format_exc(limit=2)})
