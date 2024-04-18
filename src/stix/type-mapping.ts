const STIXEntityToTypeDB = (STIXType: STIXEntity): STIXMap => {
  const mapper = {
    'attack-pattern': {
      type: 'attack-pattern',
      customType: false,
      ignore: false,
    },
    tool: { type: 'tool', customType: false, ignore: false },
    identity: { type: 'identity', customType: false, ignore: false },
    'course-of-action': {
      type: 'course-of-action',
      customType: false,
      ignore: false,
    },
    malware: { type: 'malware', customType: false, ignore: false },
    'intrusion-set': {
      type: 'intrusion-set',
      customType: false,
      ignore: false,
    },
    marking_definition: {
      type: 'marking-definition',
      customType: false,
      ignore: true,
    },
  };

  let mapping: STIXMap = mapper[STIXType];
  if (mapping === undefined) {
    mapping = { type: STIXType, customType: true, ignore: false };
  }

  return mapping;
};

const STIXRelationToTypeDB = (STIXRelationType: STIXRelation): STIXMap => {
  const mapper = {
    uses: { type: 'use', activeRole: 'used-by', passiveRole: 'used' },
    mitigates: {
      type: 'mitigation',
      activeRole: 'mitigating',
      passiveRole: 'mitigated',
    },
    delivers: {
      type: 'delivery',
      activeRole: 'delivering',
      passiveRole: 'delivered',
    },
    targets: {
      type: 'target',
      activeRole: 'targetting',
      passiveRole: 'targetted',
    },
    'attributed-to': {
      type: 'attribution',
      activeRole: 'attributing',
      passiveRole: 'attributed',
    },
    indicates: {
      type: 'indication',
      activeRole: 'indicating',
      passiveRole: 'indicated',
    },
    derives: {
      type: 'derivation',
      activeRole: 'deriving',
      passiveRole: 'derived-from',
    },
    'duplicate-of': {
      type: 'duplicate',
      activeRole: 'duplicate-object',
      passiveRole: 'duplicate-object',
    },
    'related-to': {
      type: 'relatedness',
      activeRole: 'related-to',
      passiveRole: 'related-to',
    },
  };
  let mapping: STIXMap = mapper[STIXRelationType];

  if (mapping === undefined) {
    mapping = {
      type: 'stix-core-relationship',
      activeRole: 'active-role',
      passiveRole: 'passive-role',
      STIXType: STIXRelationType,
    };
  }

  return mapping;
};

const STIXAttributesToTypeDB = (): STIXAttributeMapper => {
  return {
    id: { type: 'stix-id', value: 'string' },
    created: { type: 'created', value: 'string' },
    modified: { type: 'modified', value: 'string' },
    spec_version: { type: 'spec-version', value: 'string' },
    description: { type: 'description', value: 'string' },
    name: { type: 'name', value: 'string' },
    aliases: { type: 'alias', value: 'list' },
    revoked: { type: 'revoked', value: 'boolean' },
    is_family: { type: 'is-family', value: 'boolean' },
    source_name: { type: 'source-name', value: 'string' },
    url: { type: 'url', value: 'string' },
    external_id: { type: 'external-id', value: 'string' },
  };
};

export { STIXEntityToTypeDB, STIXRelationToTypeDB, STIXAttributesToTypeDB };
