import { MarkerType, type Connection } from '@xyflow/react';
import type {
  DatabaseSchema,
  Field,
  RelationEdge,
  TableNode,
} from '../types/schema';

export type HandleSide = 'left' | 'right';

/**
 * Génère un identifiant unique lisible avec un préfixe métier
 * (ex: "table_a1b2c3d4", "field_e5f6g7h8", "rel_1234abcd").
 */
export function createId(prefix: string): string {
  const shortUuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}_${shortUuid}`;
}

/**
 * Construit l'identifiant d'un Handle React Flow pour un champ et un côté donnés.
 * Format retenu : "<fieldId>:left" ou "<fieldId>:right".
 */
export function createFieldHandleId(fieldId: string, side: HandleSide): string {
  return `${fieldId}:${side}`;
}

/**
 * Extrait l'identifiant du champ à partir de l'identifiant d'un Handle React Flow.
 * Retourne null si le Handle n'a pas le format attendu.
 */
export function extractFieldIdFromHandle(
  handleId: string | null | undefined,
): string | null {
  if (!handleId) {
    return null;
  }

  const separatorIndex = handleId.lastIndexOf(':');
  if (separatorIndex <= 0) {
    return null;
  }

  return handleId.slice(0, separatorIndex);
}

type ConnectionCandidate = {
  source?: string | null;
  target?: string | null;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

/**
 * Vérifie si une connexion entre deux champs est autorisée :
 * 1. Les tables et champs source/cible doivent tous être renseignés.
 * 2. Interdit de relier une table à elle-même sur le même champ.
 * 3. Interdit de créer un doublon exact d'une relation déjà existante.
 */
export function isValidFieldConnection(
  connection: ConnectionCandidate,
  existingEdges: RelationEdge[],
): boolean {
  const sourceFieldId = extractFieldIdFromHandle(connection.sourceHandle);
  const targetFieldId = extractFieldIdFromHandle(connection.targetHandle);

  if (
    !connection.source ||
    !connection.target ||
    !sourceFieldId ||
    !targetFieldId
  ) {
    return false;
  }

  // Règle de sécurité : pas d'auto-lien sur exactement le même champ
  const isSameTableAndField =
    connection.source === connection.target && sourceFieldId === targetFieldId;
  if (isSameTableAndField) {
    return false;
  }

  // Évite de superposer deux liens identiques entre les mêmes champs
  const alreadyExists = existingEdges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.data?.sourceFieldId === sourceFieldId &&
      edge.data?.targetFieldId === targetFieldId,
  );

  return !alreadyExists;
}

/**
 * Crée un nouvel Edge React Flow typé ("relation") à partir d'une Connection validée.
 */
export function createRelationEdge(connection: Connection): RelationEdge | null {
  const sourceFieldId = extractFieldIdFromHandle(connection.sourceHandle);
  const targetFieldId = extractFieldIdFromHandle(connection.targetHandle);

  if (
    !connection.source ||
    !connection.target ||
    !sourceFieldId ||
    !targetFieldId
  ) {
    return null;
  }

  return {
    id: createId('rel'),
    type: 'relation',
    source: connection.source,
    sourceHandle: connection.sourceHandle,
    target: connection.target,
    targetHandle: connection.targetHandle,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#6366f1',
    },
    data: {
      sourceFieldId,
      targetFieldId,
      type: 'MANY_TO_ONE',
    },
  };
}

/** Crée un champ par défaut avec des valeurs personnalisables. */
export function createDefaultField(overrides: Partial<Field> = {}): Field {
  return {
    id: createId('field'),
    name: 'nouveau_champ',
    type: 'TEXT',
    isPrimaryKey: false,
    isRequired: false,
    ...overrides,
  };
}

/**
 * Crée un nouveau nœud Table positionné en grille pour éviter la superposition.
 * `deletable: false` évite la suppression accidentelle d'une table via Backspace/Suppr
 * (qui reste dédié à la suppression des liens sélectionnés).
 */
export function createDefaultTableNode(existingCount: number): TableNode {
  const index = existingCount + 1;
  const col = existingCount % 3;
  const row = Math.floor(existingCount / 3);

  return {
    id: createId('table'),
    type: 'table',
    deletable: false,
    position: {
      x: 100 + col * 480,
      y: 100 + row * 280,
    },
    data: {
      name: `table_${index}`,
      fields: [
        createDefaultField({
          name: 'id',
          type: 'INTEGER',
          isPrimaryKey: true,
          isRequired: true,
        }),
      ],
    },
  };
}

/**
 * Transforme l'état visuel de React Flow (nodes + edges) en objet JSON métier propre.
 * C'est cette fonction pure qui alimente à la fois l'aperçu temps réel et l'export fichier.
 */
export function buildDatabaseSchema(
  nodes: TableNode[],
  edges: RelationEdge[],
): DatabaseSchema {
  return {
    version: 1,
    tables: nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      },
      fields: node.data.fields.map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isPrimaryKey: field.isPrimaryKey,
        isRequired: field.isRequired,
      })),
    })),
    relations: edges.flatMap((edge) => {
      const sourceFieldId =
        edge.data?.sourceFieldId ??
        extractFieldIdFromHandle(edge.sourceHandle);
      const targetFieldId =
        edge.data?.targetFieldId ??
        extractFieldIdFromHandle(edge.targetHandle);

      if (!sourceFieldId || !targetFieldId) {
        return [];
      }

      return [
        {
          id: edge.id,
          sourceTableId: edge.source,
          sourceFieldId,
          targetTableId: edge.target,
          targetFieldId,
          type: edge.data?.type ?? 'MANY_TO_ONE',
        },
      ];
    }),
  };
}

/** Formate le schéma en JSON indenté (2 espaces). */
export function formatSchemaJson(schema: DatabaseSchema): string {
  return JSON.stringify(schema, null, 2);
}

/** Déclenche le téléchargement navigateur du fichier schema.json. */
export function downloadSchemaJson(
  schema: DatabaseSchema,
  filename = 'schema.json',
): void {
  const json = formatSchemaJson(schema);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
