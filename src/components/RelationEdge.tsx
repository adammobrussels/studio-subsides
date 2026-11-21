import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';
import type { RelationEdge as RelationEdgeType } from '../types/schema';

/**
 * Composant personnalisé (Custom Edge) représentant une relation (clé étrangère)
 * entre deux champs.
 *
 * React Flow sépare le rendu en deux couches :
 * - <BaseEdge> dessine le trait SVG entre les deux Handles.
 * - <EdgeLabelRenderer> place des éléments HTML interactifs (ici le bouton "×")
 *   au milieu du fil, au-dessus du canvas.
 */
export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
}: EdgeProps<RelationEdgeType>) {
  const { setEdges } = useReactFlow();

  // Calcule le tracé orthogonal à coins arrondis (très lisible pour un schéma BDD)
  // ainsi que les coordonnées (labelX, labelY) du point central du fil.
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  /**
   * Supprime uniquement cette relation dans l'état global des Edges de React Flow.
   * L'état React est mis à jour de manière immuable avec `.filter(...)`.
   */
  function handleDeleteRelation(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== id));
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#4f46e5' : '#6366f1',
          strokeWidth: selected ? 2.5 : 1.75,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            onClick={handleDeleteRelation}
            title="Supprimer cette relation"
            aria-label="Supprimer cette relation"
            className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-xs transition-all ${
              selected
                ? 'border-rose-300 bg-rose-500 text-white scale-110'
                : 'border-indigo-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
