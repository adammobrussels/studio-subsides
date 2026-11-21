import { Braces, Database, Download, Plus } from 'lucide-react';

type ToolbarProps = {
  tableCount: number;
  relationCount: number;
  isJsonOpen: boolean;
  onAddTable: () => void;
  onToggleJson: () => void;
  onExportJson: () => void;
};

/** Barre d'actions supérieure : ajout de table, aperçu JSON et export schema.json. */
export function Toolbar({
  tableCount,
  relationCount,
  isJsonOpen,
  onAddTable,
  onToggleJson,
  onExportJson,
}: ToolbarProps) {
  return (
    <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900">
              Studio — Base de données
            </h1>
            <span className="whitespace-nowrap rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
              Brique 2
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {tableCount} {tableCount > 1 ? 'tables' : 'table'} · {relationCount}{' '}
            {relationCount > 1 ? 'relations' : 'relation'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onAddTable}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 active:bg-indigo-800"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter une Table (Box)</span>
        </button>

        <button
          type="button"
          onClick={onToggleJson}
          aria-pressed={isJsonOpen}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            isJsonOpen
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Braces className="h-4 w-4" />
          <span>Aperçu JSON</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          <span>Exporter JSON</span>
        </button>
      </div>
    </header>
  );
}
