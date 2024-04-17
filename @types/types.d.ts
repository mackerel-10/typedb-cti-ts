type STIXEntity =
  | 'attack-pattern'
  | 'tool'
  | 'identity'
  | 'course-of-action'
  | 'malware'
  | 'intrusion-set'
  | 'marking_definition';
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
  stixType?: string;
}

interface STIXAttributeMapper {
  [K in STIXAttribute]: STIXMap;
}

interface STIXObject extends Record<string, STIXMap> {
  type: STIXEntity;
  id: string;
  created_by_ref: string;
  identity_class: string;
  created: string;
  modified: string;
  spec_version: string;
  description: string;
  name: string;
  aliases: string;
  revoked: string;
  is_family: string;
  source_name: string;
  url: string;
  external_id: string;
}
