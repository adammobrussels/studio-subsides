import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  type EdgeTypes,
  type IsValidConnection,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { Plus } from 'lucide-react';
import type {
  RelationEdge as RelationEdgeType,
  TableNode as TableNodeType,
} from '../types/schema';
import { RelationEdge } from './RelationEdge';
import { TableNode } from './TableNode';

// Déclarés en dehors du composant afin que React Flow ne recrée pas les types
// (et ne démonte pas les nœuds/liens) à chaque re-rendu React.
const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relation: RelationEdge,
};

type SchemaCanvasProps = {
  nodes: TableNodeType[];
  edges: RelationEdgeType[];
  onNodesChange: OnNodesChange<TableNodeType>;
  onEdgesChange: OnEdgesChange<RelationEdgeType>;
  onConnect: OnConnect;
  isValidConnection: IsValidConnection<RelationEdgeType>;
  onAddTable: () => void;
};

/**
 * Espace de travail interactif React Flow qui affiche les Tables (Nodes)
 * et les Relations (Edges) avec grille, zoom, minimap et création de liens.
 */
export function SchemaCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
  onAddTable,
}: SchemaCanvasProps) {
  return (
    <div className="relative h-full flex-1 bg-slate-50">
      <ReactFlow<TableNodeType, RelationEdgeType>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        // Loose autorise de relier n'importe quel Handle (gauche ou droite)
        // vers n'importe quel autre Handle, quel que soit le placement des tables.
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        className="light"
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.75}
        // Supprime un lien sélectionné avec Suppr ou Backspace
        // (les tables ont `deletable: false` pour éviter toute suppression involontaire).
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#cbd5e1"
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor="#6366f1"
          maskColor="rgba(248, 250, 252, 0.7)"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto flex max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-sm backdrop-blur-xs">
            <p className="text-sm font-semibold text-slate-800">
              Votre canvas est vide
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajoutez votre première table pour commencer à modéliser votre
              schéma de base de données.
            </p>
            <button
              type="button"
              onClick={onAddTable}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une Table (Box)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
