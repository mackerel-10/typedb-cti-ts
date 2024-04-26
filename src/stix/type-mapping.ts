const STIXEntityToTypeDB = (STIXType: STIXEntity): STIXMap => {
  const mapper: Record<string, STIXMap> = {
    // 4.1 Attack Pattern
    'attack-pattern': {
      type: 'attack-pattern',
      customType: false,
      ignore: false,
    },
    // 4.2 Campaign
    campaign: { type: 'campaign', customType: false, ignore: false },
    // 4.3 Course of Action
    'course-of-action': {
      type: 'course-of-action',
      customType: false,
      ignore: false,
    },
    // 4.5 Identity
    identity: { type: 'identity', customType: false, ignore: false },
    // 4.8 Intrusion Set
    'intrusion-set': {
      type: 'intrusion-set',
      customType: false,
      ignore: false,
    },
    // 4.10 Malware
    malware: { type: 'malware', customType: false, ignore: false },
    // 4.17 Tool
    tool: { type: 'tool', customType: false, ignore: false },

    // Marking Definition
    'marking-definition': {
      type: 'marking-definition',
      customType: false,
      ignore: true,
    },
  };

  let mapping: STIXMap | undefined = mapper[STIXType];
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
      activeRole: 'targeting',
      passiveRole: 'targeted',
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
    id: { type: 'stix-id' },
    created: { type: 'created' },
    modified: { type: 'modified' },
    'spec-version': { type: 'spec-version' },
    description: { type: 'description' },
    name: { type: 'name' },
    aliases: { type: 'alias' },
    revoked: { type: 'revoked' },
    is_family: { type: 'is-family' },
    source_name: { type: 'source-name' },
    url: { type: 'url' },
    external_id: { type: 'external-id' },
  };
};

export { STIXEntityToTypeDB, STIXRelationToTypeDB, STIXAttributesToTypeDB };
