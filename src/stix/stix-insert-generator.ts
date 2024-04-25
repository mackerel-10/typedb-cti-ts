import {
  STIXAttributesToTypeDB,
  STIXEntityToTypeDB,
  STIXRelationToTypeDB,
} from './type-mapping';
import logger from '../logger';
import STIXMigrator from './stix-migrator';

class STIXInsertGenerator {
  STIXObjectList: STIXObject[];

  constructor(STIXObjectList: STIXObject[]) {
    this.STIXObjectList = STIXObjectList;
  }

  referencedSTIXObjects(): ReferencedQueryAndId {
    // Get reference id
    const referencedIds: Set<Id> = new Set();
    for (const STIXObject of this.STIXObjectList) {
      const createdByRef: string | undefined = STIXObject.created_by_ref;
      if (createdByRef && !referencedIds.has(createdByRef)) {
        referencedIds.add(createdByRef);
      }
    }

    // Generate insert query of reference STIX object
    const queryList: Set<Query> = new Set();
    for (const STIXObject of this.STIXObjectList) {
      for (const referencedId of referencedIds) {
        if (STIXObject.id === referencedId) {
          let entityType: string = STIXEntityToTypeDB(STIXObject.type).type;
          if (entityType === 'identity') {
            entityType = STIXObject.identity_class;
          }
          const query = `insert $x isa ${entityType}, ${this.attributes(STIXObject)};`;
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

  statementMarkings(): MarkingQueryAndId {
    const queryList: Set<Query> = new Set();
    const processedIds: Set<Id> = new Set();

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

  STIXObjectsAndMarkingRelations(
    excludeIds: Id[],
  ): EntityQueryAndMarkingRelations {
    const STIXEntityQueryList: Set<Query> = new Set();
    const STIXObjectsWithMarkingRefs: STIXObject[] = [];
    const ignoreDeprecated: boolean = Boolean(
      JSON.parse(process.env.IGNORE_DEPRECATED!),
    );
    let ignoredObjects: number = 0;

    for (const STIXObject of this.STIXObjectList) {
      // Don't insert the object if it's deprecated(x_mitre_deprecated).
      if (ignoreDeprecated && STIXObject.x_mitre_deprecated) {
        ignoredObjects++;
        continue;
      }

      const STIXObjectType: string = STIXObject.type;
      if (
        STIXObjectType !== 'relationship' &&
        !excludeIds.includes(STIXObject.id)
      ) {
        // type !== relationship && not in excludeIds
        if (STIXObject.object_marking_refs) {
          STIXObjectsWithMarkingRefs.push(STIXObject);
        }

        STIXEntityQueryList.add(
          this.generateSTIXEntityQuery(STIXObject, STIXObjectType),
        );
      }
    }

    const markingRelationsQueryList: Set<Query> = this.markingRelations(
      STIXObjectsWithMarkingRefs,
    );
    logger.info(`Skipped ${ignoredObjects} deprecated objects`);
    logger.info(
      `Generated ${STIXEntityQueryList.size} insert queries for STIXObjects`,
    );
    logger.info(
      `Generated ${markingRelationsQueryList.size} insert queries for marking relations`,
    );
    return {
      STIXEntityQueryList: [...STIXEntityQueryList],
      markingRelations: [...markingRelationsQueryList],
    };
  }

  generateSTIXEntityQuery(
    STIXObject: STIXObject,
    STIXObjectType: string,
  ): Query {
    const STIXMap: STIXMap = STIXEntityToTypeDB(STIXObjectType);
    let query: Query;

    if (STIXMap.customType) {
      query = `$stix isa custom-object, has stix-type '${STIXMap.type}'`;
    } else {
      let entityType: string;

      if (STIXMap.type === 'identity') {
        entityType = STIXObject.identity_class;
      } else {
        entityType = STIXObject.type;
      }
      query = `$stix isa ${entityType}`;
    }
    query = `
      insert
        ${query},
        ${this.attributes(STIXObject)};
    `;

    if (STIXObject.created_by_ref) {
      // We expect creating STIX objects to be inserted before
      query = `
        match
          $creator isa thing, has stix-id '${STIXObject.created_by_ref}';
        ${query}
        (created: $stix, creator: $creator) isa creation;
      `;
    }

    return query;
  }

  markingRelations(STIXObjectsWithMarkingRefs: STIXObject[]): Set<Query> {
    const queryList: Set<Query> = new Set();

    for (const STIXObject of STIXObjectsWithMarkingRefs) {
      queryList.add(`
        match
          $x isa thing, has stix-id '${STIXObject.id}';
          $marking isa marking-definition,
            has stix-id '${STIXObject.object_marking_refs[0]}';
        insert
          (marked: $x, marking: $marking) isa object-marking;
      `);
    }

    return queryList;
  }

  STIXRelationships(): Query[] {
    const relationQueryList: Set<Query> = new Set<Query>();

    for (const STIXObject of this.STIXObjectList) {
      if (STIXObject.type === 'relationship') {
        const relation: STIXMap = STIXRelationToTypeDB(
          STIXObject.relationship_type,
        );
        let insertQuery: Query;

        if (relation.type === 'stix-core-relationship') {
          insertQuery = `(${relation.activeRole}: $source, ${relation.passiveRole}: $target)
            isa ${relation.type},
            has stix-type '${relation.stixType}'`;
        } else {
          insertQuery = `(${relation.activeRole}: $source, ${relation.passiveRole}: $target)
            isa ${relation.type}`;
        }

        relationQueryList.add(`
          match
            $source has stix-id '${STIXObject.source_ref}';
            $target has stix-id '${STIXObject.target_ref}';
          insert
            ${insertQuery},
            ${this.attributes(STIXObject)};
        `);
      }
    }

    logger.info(
      `Generated ${relationQueryList.size} insert queries for relationships`,
    );
    return [...relationQueryList];
  }

  killChainPhases() {
    const killChainUsages = [];
  }

  attributes(STIXObject: STIXObject): Query {
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
            query += ` has ${typeQLAttributeType} '${STIXValue.replace(/'/g, '"').trim()}',`;
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
