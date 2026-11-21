import { useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import type { DatabaseSchema } from '../types/schema';
import { formatSchemaJson } from '../utils/schemaExport';

type JsonPreviewPanelProps = {
  schema: DatabaseSchema;
  onExportJson: () => void;
  onClose: () => void;
};

export function JsonPreviewPanel({
  schema,
  onExportJson,
  onClose,
}: JsonPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const formattedJson = formatSchemaJson(schema);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-l border-slate-200 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="font-mono text-xs font-semibold text-slate-100">
            schema.json
          </h2>
          <p className="text-[11px] text-slate-400">
            Aperçu en temps réel du schéma
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            title="Copier le JSON"
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportJson}
            title="Télécharger schema.json"
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Télécharger</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Fermer l'aperçu JSON"
            aria-label="Fermer l'aperçu JSON"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-xs leading-relaxed text-slate-200">
          <code>{formattedJson}</code>
        </pre>
      </div>
    </aside>
  );
}
