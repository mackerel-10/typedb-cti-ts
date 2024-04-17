import { stixAttributesToTypeDB, stixEntityToTypeDB } from './type-mapping';

class StixInsertGenerator {
  jsonObject: STIXObject[];

  constructor(jsonObject: STIXObject[]) {
    this.jsonObject = jsonObject;
  }

  referencedStixObjects() {
    // Get reference id
    const referencedIds: Set<string> = new Set();
    for (const stixObject of this.jsonObject) {
      const createdByRef: string | undefined = stixObject.created_by_ref;
      if (createdByRef && !referencedIds.has(createdByRef)) {
        referencedIds.add(createdByRef);
      }
    }

    // Generate insert query of reference STIX object
    const queryList: Set<string> = new Set();
    for (const stixObject of this.jsonObject) {
      for (const referencedId of referencedIds) {
        if (stixObject.id === referencedId) {
          let entityType: string = stixEntityToTypeDB(stixObject.type).type;
          if (entityType === 'identity') {
            entityType = stixObject.identity_class;
          }
          let query = `insert $x isa ${entityType}, ${this.attribute(stixObject)};`;
          queryList.add(query);
        }
      }
    }

    return {
      processedIds: referencedIds,
      queryList,
    };
  }

  attribute(stixObject: STIXObject) {
    let query = '';
    const typeDBAttributes = stixAttributesToTypeDB();
    for (let [stixKey, typeQLDefinition] of Object.entries(typeDBAttributes)) {
      if (stixKey in stixObject) {
        let typeQLAttributeType = typeQLDefinition.type;
        let stixValueType = typeQLDefinition.value;
        let stixValue = stixObject[stixKey];
      }
    }
  }
}

export default StixInsertGenerator;
