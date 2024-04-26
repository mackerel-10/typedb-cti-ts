type Query = string;
type Id = string;
type Transaction = TypeDBTransaction | undefined;
type Session = TypeDBSession | undefined;
type Driver = TypeDBDriver | undefined;

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

type STIXProperty =
  | boolean
  | string
  | string[]
  | STIXEntity
  | STIXRelation
  | KillChainPhase[]
  | ExternalReference[];
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
type KillChainName = string;
type PhaseName = string;
type KillChainTuple = [KillChainName, PhaseName];

interface KillChainPhase {
  kill_chain_name: KillChainName;
  phase_name: PhaseName;
}

interface KillChainUsage {
  usedId: string;
  killChainPhase: KillChainPhase;
}

// External References
interface ExternalReference {
  /*{
    "source_name": "mitre-attack",
    "url": "https://attack.mitre.org/techniques/T1053/005",
    "external_id": "T1053.005"
  },*/
  source_name: string;
  url: string;
  external_id?: string;
  description?: string;
}

// STIX Objects And Marking Relations
interface ReferencedQueryAndId {
  referencedQueryList: Query[];
  referencedProcessedIds: Id[];
}

interface MarkingQueryAndId {
  markingsQueryList: Query[];
  markingsProcessedIds: Id[];
}

interface EntityQueryAndMarkingRelations {
  STIXEntityQueryList: Query[];
  markingRelations: Query[];
}

interface KillChainPhaseListAndUsages {
  killChainPhaseList: Query[];
  killChainPhaseUsages: Query[];
}

interface ExternalReferenceListAndRelations {
  externalReferenceList: Query[];
  externalReferenceRelations: Query[];
}
