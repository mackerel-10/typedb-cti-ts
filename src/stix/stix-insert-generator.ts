import { stixAttributesToTypeDB, stixEntityToTypeDB } from './type-mapping';

class StixInsertGenerator {
  stixObjectList: STIXObject[];

  constructor(stixObjectList: STIXObject[]) {
    this.stixObjectList = stixObjectList;
  }

  referencedStixObjects(): {
    processedIds: Set<string>;
    queryList: Set<string>;
  } {
    // Get reference id
    const referencedIds: Set<string> = new Set();
    for (const stixObject of this.stixObjectList) {
      const createdByRef: string | undefined = stixObject.created_by_ref;
      if (createdByRef && !referencedIds.has(createdByRef)) {
        referencedIds.add(createdByRef);
      }
    }

    // Generate insert query of reference STIX object
    const queryList: Set<string> = new Set();
    for (const stixObject of this.stixObjectList) {
      for (const referencedId of referencedIds) {
        if (stixObject.id === referencedId) {
          let entityType: string = stixEntityToTypeDB(stixObject.type).type;
          if (entityType === 'identity') {
            entityType = stixObject.identity_class;
          }
          const query = `insert $x isa ${entityType}, ${this.attribute(stixObject)};`;
          queryList.add(query);
        }
      }
    }

    return {
      processedIds: referencedIds,
      queryList,
    };
  }

  attribute(stixObject: STIXObject): Query {
    let query: Query = '';
    const typeDBAttributes: STIXAttributeMapper = stixAttributesToTypeDB();

    for (const [stixKey, typeQLDefinition] of Object.entries(
      typeDBAttributes,
    )) {
      if (stixKey in stixObject) {
        const typeQLAttributeType = typeQLDefinition.type;
        const stixValueType = typeQLDefinition.value;
        const stixValue: string | string[] = stixObject[stixKey];

        switch (stixValueType) {
          case 'string':
            query += ` has ${typeQLAttributeType} '${stixValue}',`;
            break;
          case 'boolean':
            query += ` has ${typeQLAttributeType} ${stixValue},`;
            break;
          case 'list':
            for (const value of stixValue) {
              query += ` has ${typeQLAttributeType} '${value}',`;
            }
            break;
        }
      }
    }

    return query.slice(1, -1);
  }
}

export default StixInsertGenerator;
