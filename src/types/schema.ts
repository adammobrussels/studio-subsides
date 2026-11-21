import type { Edge, Node } from '@xyflow/react';

export const FIELD_TYPES = [
  'TEXT',
  'INTEGER',
  'DECIMAL',
  'DATE',
  'BOOLEAN',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/** Définition d'une colonne dans une table. */
export type Field = {
  id: string;
  name: string;
  type: FieldType;
  isPrimaryKey: boolean;
  isRequired: boolean;
};

/** Données métier embarquées dans chaque nœud (Table) de React Flow. */
export type TableNodeData = {
  name: string;
  fields: Field[];
};

/** Nœud React Flow personnalisé représentant une table. */
export type TableNode = Node<TableNodeData, 'table'>;

/** Cardinalité d'une relation entre deux champs (Brique 2 : MANY_TO_ONE par défaut). */
export type RelationType = 'MANY_TO_ONE';

/** Données métier embarquées dans chaque lien (Edge) de React Flow. */
export type RelationEdgeData = {
  sourceFieldId: string;
  targetFieldId: string;
  type: RelationType;
};

/** Lien React Flow personnalisé représentant une clé étrangère entre deux champs. */
export type RelationEdge = Edge<RelationEdgeData, 'relation'>;

export type TablePosition = {
  x: number;
  y: number;
};

export type TableSchema = {
  id: string;
  name: string;
  position: TablePosition;
  fields: Field[];
};

/** Format d'une relation dans le fichier schema.json exporté. */
export type RelationSchema = {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  type: RelationType;
};

/** Schéma complet exporté dans schema.json. */
export type DatabaseSchema = {
  version: 1;
  tables: TableSchema[];
  relations: RelationSchema[];
};
