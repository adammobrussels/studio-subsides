import { useMemo } from 'react';
import { useEdges, useReactFlow, type NodeProps } from '@xyflow/react';
import { GripVertical, Plus, Table2, Trash2 } from 'lucide-react';
import type {
  Field,
  RelationEdge,
  TableNode as TableNodeType,
} from '../types/schema';
import {
  createDefaultField,
  extractFieldIdFromHandle,
} from '../utils/schemaExport';
import { FieldRow } from './FieldRow';

/**
 * Composant personnalisé (Custom Node) React Flow représentant une table.
 *
 * Il lit ses propres données via les props (`id`, `data`, `selected`) et met à jour
 * l'état global du canvas grâce au hook `useReactFlow()` (sans passer de callbacks
 * dans `node.data`, qui reste ainsi 100 % sérialisable en JSON).
 */
export function TableNode({ id, data, selected }: NodeProps<TableNodeType>) {
  const { updateNodeData, setNodes, setEdges } = useReactFlow<
    TableNodeType,
    RelationEdge
  >();

  // Lit en direct la liste des liens (Edges) du canvas pour déduire quels champs
  // de cette table sont sources d'une relation (affichage automatique du badge FK).
  const edges = useEdges<RelationEdge>();

  const foreignKeyFieldIds = useMemo(() => {
    const fieldIds = new Set<string>();

    for (const edge of edges) {
      if (edge.source !== id) {
        continue;
      }
      const sourceFieldId =
        edge.data?.sourceFieldId ??
        extractFieldIdFromHandle(edge.sourceHandle);
      if (sourceFieldId) {
        fieldIds.add(sourceFieldId);
      }
    }

    return fieldIds;
  }, [edges, id]);

  /** Met à jour le nom de la table dans le Node React Flow correspondant. */
  function handleTableNameChange(nextName: string) {
    updateNodeData(id, { name: nextName });
  }

  /** Ajoute un nouveau champ à la fin du tableau `fields` (mise à jour immuable). */
  function handleAddField() {
    const nextField = createDefaultField({
      name: `champ_${data.fields.length + 1}`,
    });
    updateNodeData(id, {
      fields: [...data.fields, nextField],
    });
  }

  /** Fusionne un changement partiel (`patch`) sur un champ précis de la table. */
  function handleUpdateField(fieldId: string, patch: Partial<Field>) {
    updateNodeData(id, {
      fields: data.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    });
  }

  /**
   * Supprime un champ de la table et nettoie immédiatement les relations (Edges)
   * qui pointaient vers ou depuis ce champ pour éviter tout lien orphelin.
   */
  function handleDeleteField(fieldId: string) {
    updateNodeData(id, {
      fields: data.fields.filter((field) => field.id !== fieldId),
    });

    setEdges((currentEdges) =>
      currentEdges.filter((edge) => {
        const sourceFieldId =
          edge.data?.sourceFieldId ??
          extractFieldIdFromHandle(edge.sourceHandle);
        const targetFieldId =
          edge.data?.targetFieldId ??
          extractFieldIdFromHandle(edge.targetHandle);

        const usesDeletedSource =
          edge.source === id && sourceFieldId === fieldId;
        const usesDeletedTarget =
          edge.target === id && targetFieldId === fieldId;

        return !usesDeletedSource && !usesDeletedTarget;
      }),
    );
  }

  /**
   * Supprime la table entière dans `nodes` ainsi que toutes ses relations dans `edges`.
   */
  function handleDeleteTable() {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  }

  return (
    <div
      className={`w-[404px] rounded-xl border bg-white shadow-md transition-shadow ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* En-tête de la table (zone de drag) */}
      <div className="flex cursor-grab items-center gap-2 rounded-t-xl border-b border-slate-200 bg-slate-900 px-3 py-2.5 text-white active:cursor-grabbing">
        <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
        <Table2 className="h-4 w-4 shrink-0 text-indigo-400" />

        <input
          type="text"
          value={data.name}
          onChange={(event) => handleTableNameChange(event.target.value)}
          placeholder="nom_table"
          aria-label="Nom de la table"
          className="nodrag nopan min-w-0 flex-1 rounded bg-slate-800/80 px-2 py-0.5 font-mono text-sm font-semibold text-white placeholder:text-slate-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />

        <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-300">
          {data.fields.length}
        </span>

        <button
          type="button"
          onClick={handleDeleteTable}
          title="Supprimer cette table"
          aria-label={`Supprimer la table ${data.name || 'sans nom'}`}
          className="nodrag nopan flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* En-têtes des colonnes */}
      <div className="grid grid-cols-[44px_1fr_104px_52px_28px] items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-center">Clé</span>
        <span>Champ</span>
        <span>Type</span>
        <span className="text-center">Requis</span>
        <span className="sr-only">Actions</span>
      </div>

      {/* Liste des champs */}
      <div className="bg-white">
        {data.fields.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-slate-400">
            Aucun champ dans cette table.
          </p>
        ) : (
          data.fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              isForeignKey={foreignKeyFieldIds.has(field.id)}
              onChange={handleUpdateField}
              onDelete={handleDeleteField}
            />
          ))
        )}
      </div>

      {/* Pied de box : ajout de champ */}
      <div className="rounded-b-xl border-t border-slate-100 bg-slate-50/70 p-2">
        <button
          type="button"
          onClick={handleAddField}
          className="nodrag nopan flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Ajouter un champ</span>
        </button>
      </div>
    </div>
  );
}
