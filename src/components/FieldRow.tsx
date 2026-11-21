import { Handle, Position } from '@xyflow/react';
import { KeyRound, Trash2 } from 'lucide-react';
import { FIELD_TYPES, type Field, type FieldType } from '../types/schema';
import { createFieldHandleId } from '../utils/schemaExport';

type FieldRowProps = {
  field: Field;
  isForeignKey: boolean;
  onChange: (fieldId: string, patch: Partial<Field>) => void;
  onDelete: (fieldId: string) => void;
};

/**
 * Affiche une ligne de champ dans une table ainsi que ses deux points de connexion
 * (Handles React Flow à gauche et à droite) pour tirer ou recevoir une relation.
 */
export function FieldRow({
  field,
  isForeignKey,
  onChange,
  onDelete,
}: FieldRowProps) {
  /**
   * Bascule le statut Clé Primaire (PK).
   * Lorsqu'un champ devient PK, on coche automatiquement "Requis" (NOT NULL).
   */
  function handleTogglePrimaryKey() {
    const nextIsPk = !field.isPrimaryKey;
    onChange(field.id, {
      isPrimaryKey: nextIsPk,
      isRequired: nextIsPk ? true : field.isRequired,
    });
  }

  const handleClassName = `!h-2.5 !w-2.5 !border-2 !border-white transition-colors ${
    isForeignKey
      ? '!bg-indigo-600'
      : '!bg-slate-400 hover:!bg-indigo-600'
  }`;

  return (
    <div className="relative grid grid-cols-[44px_1fr_104px_52px_28px] items-center gap-1.5 border-b border-slate-100 px-3 py-1.5 last:border-b-0 hover:bg-slate-50/80">
      {/* Points de connexion React Flow (gauche et droite).
          Avec ConnectionMode.Loose sur le canvas, les deux côtés peuvent initier
          ou recevoir une relation dans n'importe quel sens. */}
      <Handle
        id={createFieldHandleId(field.id, 'left')}
        type="source"
        position={Position.Left}
        className={handleClassName}
      />
      <Handle
        id={createFieldHandleId(field.id, 'right')}
        type="source"
        position={Position.Right}
        className={handleClassName}
      />

      <button
        type="button"
        onClick={handleTogglePrimaryKey}
        title={
          field.isPrimaryKey
            ? 'Retirer la clé primaire (PK)'
            : 'Définir comme clé primaire (PK)'
        }
        aria-pressed={field.isPrimaryKey}
        className={`nodrag nopan flex h-7 items-center justify-center gap-1 rounded border text-[11px] font-semibold transition-colors ${
          field.isPrimaryKey
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
        }`}
      >
        <KeyRound className="h-3 w-3" />
        <span>PK</span>
      </button>

      <div className="flex min-w-0 items-center gap-1">
        <input
          type="text"
          value={field.name}
          onChange={(event) => onChange(field.id, { name: event.target.value })}
          placeholder="nom_champ"
          aria-label="Nom du champ"
          className="nodrag nopan h-7 w-full min-w-0 rounded border border-slate-200 bg-white px-2 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {isForeignKey && (
          <span
            title="Clé étrangère (champ relié à une autre table)"
            className="shrink-0 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700"
          >
            FK
          </span>
        )}
      </div>

      <select
        value={field.type}
        onChange={(event) =>
          onChange(field.id, { type: event.target.value as FieldType })
        }
        aria-label="Type du champ"
        className="nodrag nopan h-7 w-full rounded border border-slate-200 bg-white px-1.5 font-mono text-[11px] font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {FIELD_TYPES.map((fieldType) => (
          <option key={fieldType} value={fieldType}>
            {fieldType}
          </option>
        ))}
      </select>

      <label
        title="Requis (NOT NULL)"
        className="nodrag nopan flex h-7 cursor-pointer items-center justify-center gap-1 rounded text-[11px] text-slate-600 select-none"
      >
        <input
          type="checkbox"
          checked={field.isRequired}
          onChange={(event) =>
            onChange(field.id, { isRequired: event.target.checked })
          }
          aria-label="Champ requis (NOT NULL)"
          className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500"
        />
      </label>

      <button
        type="button"
        onClick={() => onDelete(field.id)}
        title="Supprimer ce champ"
        aria-label={`Supprimer le champ ${field.name || 'sans nom'}`}
        className="nodrag nopan flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
