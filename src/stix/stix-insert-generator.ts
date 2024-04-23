import { STIXAttributesToTypeDB, STIXEntityToTypeDB } from './type-mapping';
import logger from '../logger';

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

    logger.info(
      `Generated ${queryList.size} insert queries for referenced STIX entities`,
    );
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

    logger.info(`Generated ${queryList.size} insert queries for markings`);
    return {
      markingsQueryList: [...queryList],
      markingsProcessedIds: [...processedIds],
    };
  }

  STIXObjectsAndMarkingRelations(excludeIds: string[]) {
    const STIXEntityQueryList = new Set();
    const STIXObjectsWithMarkingReferences: STIXObject[] = [];
    const ignoreDeprecated: boolean = Boolean(
      JSON.parse(process.env.IGNORE_DEPRECATED!),
    );
    let ignoredObjects: number = 0;

    for (const STIXObject of this.STIXObjectList) {
      const STIXObjectType: string = STIXObject.type;

      // Don't insert the object if it's deprecated.
      // Default behaviour is that deprecated objects get loaded.
      // x_mitre_deprecated === true, we will skip this objects when ignoreDeprecated is true
      if (ignoreDeprecated && STIXObject.x_mitre_deprecated) {
        ignoredObjects++;
        continue;
      }

      // type !== relationship && not in excludeIds
      if (
        STIXObjectType !== 'relationship' &&
        !excludeIds.includes(STIXObject.id)
      ) {
        const STIXMap = STIXEntityToTypeDB(STIXObjectType);
        let query: Query = '';

        if (
          STIXObject.object_marking_refs &&
          STIXObject.object_marking_refs.length > 0
        ) {
          STIXObjectsWithMarkingReferences.push(STIXObject);
        }

        if (STIXMap.cutsomType) {
          // If customType
          query = `$stix isa custom-object, has stix-type ${STIXMap.type}`;
        } else {
          let entityType: string;
          if (STIXMap.type === 'identity') {
            entityType = STIXObject.identity_class;
          } else {
            entityType = STIXObject.type;
          }
          query = `$stix isa ${entityType}`;
        }
        query = `insert ${query}, ${this.attribute(STIXObject)};`;

        if (STIXObject.created_by_ref) {
          const insertCreatedByReferenceRelation: string =
            '(created: $stix, creator: $creator) isa creation;';
          // We expect creating STIX objects to be inserted before
          const matchCreator: string = `$creator isa thing, has stix-id ${STIXObject.created_by_ref};`;
          query = `match ${matchCreator}\n${query}\n${insertCreatedByReferenceRelation}`;
        }
        STIXEntityQueryList.add(query);
      }
    }

    // const markingRelationsQueryList = this.markingRelations(STIXObjectsWithMarkingReferences);
    logger.info(`Skipped ${ignoredObjects} deprecated objects`);
    return {
      STIXEntityQueryList,
      // markingRelations: markingRelationsQueryList,
    };
  }

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
