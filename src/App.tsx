import { useCallback, useMemo, useState } from 'react';
import {
  addEdge,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react';
import { JsonPreviewPanel } from './components/JsonPreviewPanel';
import { SchemaCanvas } from './components/SchemaCanvas';
import { Toolbar } from './components/Toolbar';
import type { RelationEdge, TableNode } from './types/schema';
import {
  buildDatabaseSchema,
  createDefaultField,
  createDefaultTableNode,
  createId,
  createRelationEdge,
  downloadSchemaJson,
  isValidFieldConnection,
} from './utils/schemaExport';

const INITIAL_NODES: TableNode[] = [
  {
    id: createId('table'),
    type: 'table',
    deletable: false,
    position: { x: 100, y: 100 },
    data: {
      name: 'users',
      fields: [
        createDefaultField({
          name: 'id',
          type: 'INTEGER',
          isPrimaryKey: true,
          isRequired: true,
        }),
        createDefaultField({
          name: 'email',
          type: 'TEXT',
          isPrimaryKey: false,
          isRequired: true,
        }),
        createDefaultField({
          name: 'created_at',
          type: 'DATE',
          isPrimaryKey: false,
          isRequired: true,
        }),
      ],
    },
  },
];

const INITIAL_EDGES: RelationEdge[] = [];

/**
 * Composant principal de l'espace de travail.
 * Centralise l'état des tables (`nodes`), l'état des relations (`edges`)
 * et la dérivation du schéma JSON exportable.
 */
function StudioWorkspace() {
  // useNodesState et useEdgesState sont des wrappers autour de useState :
  // onNodesChange / onEdgesChange appliquent automatiquement les déplacements,
  // sélections et suppressions clavier remontés par React Flow.
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNode>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<RelationEdge>(INITIAL_EDGES);
  const [isJsonOpen, setIsJsonOpen] = useState(true);

  // Recalcule le schéma JSON uniquement lorsque `nodes` ou `edges` change.
  const schema = useMemo(
    () => buildDatabaseSchema(nodes, edges),
    [nodes, edges],
  );

  /** Ajoute une nouvelle table sur le canvas en créant un nouveau tableau (immutabilité React). */
  function handleAddTable() {
    setNodes((currentNodes) => [
      ...currentNodes,
      createDefaultTableNode(currentNodes.length),
    ]);
  }

  /**
   * Validation temps réel appelée par React Flow pendant le tracé d'un lien.
   * Bloque visuellement toute auto-connexion sur le même champ et tout doublon.
   */
  const handleIsValidConnection = useCallback(
    (connection: Connection | RelationEdge) =>
      isValidFieldConnection(connection, edges),
    [edges],
  );

  /**
   * Appelé par React Flow lorsque l'utilisateur relâche un fil sur un Handle valide.
   * Crée un Edge typé "relation" et l'insère dans l'état `edges` via `addEdge`.
   */
  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => {
        if (!isValidFieldConnection(connection, currentEdges)) {
          return currentEdges;
        }

        const newEdge = createRelationEdge(connection);
        if (!newEdge) {
          return currentEdges;
        }

        return addEdge(newEdge, currentEdges);
      });
    },
    [setEdges],
  );

  /** Télécharge le fichier schema.json complet (tables + relations). */
  function handleExportJson() {
    downloadSchemaJson(schema, 'schema.json');
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50">
      <Toolbar
        tableCount={nodes.length}
        relationCount={edges.length}
        isJsonOpen={isJsonOpen}
        onAddTable={handleAddTable}
        onToggleJson={() => setIsJsonOpen((open) => !open)}
        onExportJson={handleExportJson}
      />

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <SchemaCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          isValidConnection={handleIsValidConnection}
          onAddTable={handleAddTable}
        />

        {isJsonOpen && (
          <JsonPreviewPanel
            schema={schema}
            onExportJson={handleExportJson}
            onClose={() => setIsJsonOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

/** Point d'entrée qui fournit le contexte React Flow à toute l'application. */
export function App() {
  return (
    <ReactFlowProvider>
      <StudioWorkspace />
    </ReactFlowProvider>
  );
}
