import { STIXAttributesToTypeDB, STIXEntityToTypeDB } from './type-mapping';

class STIXInsertGenerator {
  STIXObjectList: STIXObject[];

  constructor(STIXObjectList: STIXObject[]) {
    this.STIXObjectList = STIXObjectList;
  }

  referencedSTIXObjects() {
    // Get reference id
    const referencedIds: Set<string> = new Set();
    for (const STIXObject of this.STIXObjectList) {
      const createdByRef: string | undefined = STIXObject.created_by_ref;
      if (createdByRef && !referencedIds.has(createdByRef)) {
        referencedIds.add(createdByRef);
      }
    }

    // Generate insert query of reference STIX object
    const queryList: Set<string> = new Set();
    for (const STIXObject of this.STIXObjectList) {
      for (const referencedId of referencedIds) {
        if (STIXObject.id === referencedId) {
          let entityType: string = STIXEntityToTypeDB(STIXObject.type).type;
          if (entityType === 'identity') {
            entityType = STIXObject.identity_class;
          }
          const query = `insert $x isa ${entityType}, ${this.attribute(STIXObject)};`;
          queryList.add(query);
        }
      }
    }

    return {
      referencedQueryList: [...queryList],
      referencedProcessedIds: [...referencedIds],
    };
  }

  statementMarkings() {
    const queryList: Set<string> = new Set();
    const processedIds: Set<string> = new Set();

    for (const STIXObject of this.STIXObjectList) {
      if (
        STIXObject.type === 'marking-definition' &&
        STIXObject.definition_type === 'statement'
      ) {
        processedIds.add(STIXObject.id);
        queryList.add(`
          insert $x isa statement-marking,
            has stix-id '${STIXObject.id}',
            has statement '${STIXObject.definition.statement}',
            has created '${STIXObject.created}',
            has spec-version '${STIXObject.spec_version}';
        `);
      }
    }

    return {
      markingsQueryList: [...queryList],
      markingsProcessedIds: [...processedIds],
    };
  }

  STIXObjectsAndMarkingRelations() {}

  attribute(STIXObject: STIXObject): Query {
    let query: Query = '';
    const typeDBAttributes: STIXAttributeMapper = STIXAttributesToTypeDB();

    for (const [STIXKey, typeQLDefinition] of Object.entries(
      typeDBAttributes,
    )) {
      if (STIXKey in STIXObject) {
        const typeQLAttributeType = typeQLDefinition.type;
        const STIXValueType = typeQLDefinition.value;
        const STIXValue: string | string[] = STIXObject[STIXKey];

        switch (STIXValueType) {
          case 'string':
            query += ` has ${typeQLAttributeType} '${STIXValue}',`;
            break;
          case 'boolean':
            query += ` has ${typeQLAttributeType} ${STIXValue},`;
            break;
          case 'list':
            for (const value of STIXValue) {
              query += ` has ${typeQLAttributeType} '${value}',`;
            }
            break;
        }
      }
    }

    return query.slice(1, -1);
  }
}

export default STIXInsertGenerator;
