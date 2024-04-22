type Query = string;
type STIXEntity =
  | 'attack-pattern'
  | 'tool'
  | 'identity'
  | 'course-of-action'
  | 'malware'
  | 'intrusion-set'
  | 'marking_definition'
  | string;
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

interface STIXMap {
  type: string;
  [key: string]: string | boolean;
  STIXType?: string;
}

interface STIXAttributeMapper {
  [K in STIXAttribute]: STIXMap;
}

interface STIXObject extends Record<string, string | STIXEntity> {
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

  // external_references
  source_name: string;
  url: string;
  external_id: string;

  // markings
  definition_type: string;
  definition: {
    statement: string;
  };
}
