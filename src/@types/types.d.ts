type Query = string;
type Id = string;
type Transaction = TypeDBTransaction | undefined;
type Session = TypeDBSession | undefined;
type Driver = TypeDBDriver | undefined;
type KillChainName = string;
type PhaseName = string;
type KillChainTuple = [KillChainName, PhaseName];

// TypeDB Keywords
type STIXEntity =
  | 'attack-pattern'
  | 'tool'
  | 'identity'
  | 'course-of-action'
  | 'malware'
  | 'intrusion-set'
  | 'marking-definition'
  | string; // For custom STIX entity
type STIXRelation =
  | 'uses'
  | 'mitigates'
  | 'delivers'
  | 'targets'
  | 'attributed-to'
  | 'indicates'
  | 'derives'
  | 'duplicate-of'
  | 'related-to';
type STIXAttribute =
  | 'id'
  | 'created'
  | 'modified'
  | 'spec_version'
  | 'description'
  | 'name'
  | 'aliases'
  | 'revoked'
  | 'is_family'
  | 'source_name'
  | 'url'
  | 'external_id';
type STIXProperty =
  | boolean
  | string
  | string[]
  | STIXEntity
  | STIXRelation
  | KillChainPhase[]
  | ExternalReference[];

// Type Mapping Interface
interface STIXMap {
  /*
   * Entity: type, customType, ignore
   * Relation: type, activeRole, passiveRole, STIXType
   * Attribute: type, value
   */
  type: string;
  [key: string]: string | boolean;
  STIXType?: string;
}

interface STIXAttributeMapper extends Record<string, STIXMap> {
  [K in STIXAttribute]: STIXMap;
}

interface STIXObject extends Record<string, STIXProperty> {
  id: string;
  type: STIXEntity;
  created: string;
  created_by_ref: string;
  modified: string;
  name: string;
  description: string;
  spec_version: string;
  is_family: boolean;
  aliases: string[];
  revoked: boolean;
  identity_class: string;

  // markings
  definition_type: string;
  definition: {
    statement: string;
  };

  // deprecated
  x_mitre_deprecated: boolean;

  // marking-definition
  object_marking_refs: string[];

  // relation
  source_ref: string;
  target_ref: string;
  relationship_type: STIXRelation;

  // kill chain phases
  kill_chain_phases: KillChainPhase[];

  // external_references
  external_references: ExternalReference[];
}

// Kill Chain Phases
interface KillChainPhase {
  kill_chain_name: KillChainName;
  phase_name: PhaseName;
}

interface KillChainUsage {
  usedId: string;
  killChainPhase: KillChainPhase;
}

// External References
interface ExternalReference extends Record<string, string> {
  source_name: string;
  url: string;
  external_id?: string;
  description?: string;
}

/*
 * Return Interfaces
 */
// STIX Objects And Marking Relations
interface ReferencedQueryAndProcessedId {
  referencedQueryList: Query[];
  referencedProcessedIds: Id[];
}

interface MarkingQueryAndProcessedId {
  markingQueryList: Query[];
  markingProcessedIds: Id[];
}

interface STIXEntitiesAndMarkingRelations {
  STIXEntities: Query[];
  markingRelations: Query[];
}

interface KillChainPhasesAndUsages {
  killChainPhases: Query[];
  killChainPhaseUsages: Query[];
}

interface ExternalReferenceEntitiesAndRelations {
  externalReferenceEntities: Query[];
  externalReferenceRelations: Query[];
}
