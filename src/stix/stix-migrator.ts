import fs from 'fs';
import { TypeDBDriver } from 'typedb-driver';
import STIXInsertGenerator from './stix-insert-generator';
import TypeDBInserter from './typedb-inserter';

class STIXMigrator {
  inserter: TypeDBInserter;

  constructor(driver: TypeDBDriver, database: string) {
    this.inserter = new TypeDBInserter(driver, database);
  }

  async migrate() {
    // Parse MITRE ATT&CK JSON files
    const STIXObjectList = this.readSTIXObjectsJson();

    // Generate Insert QueryList & insert to TypeDB
    const insertQueryGenerator: STIXInsertGenerator = new STIXInsertGenerator(
      STIXObjectList,
    );

    // Insert STIX objects To Entity
    await this.migrateSTIXObjects(insertQueryGenerator);
    // this.migrateSTIXRelationships();
    // this.migrateKillChainPhases();
    // this.migrateExternalReferences();
  }

  readSTIXObjectsJson() {
    const mitreVersion: string = process.env.MITRE_ATTACK_VERSION!;
    const enterpriseJSONfile = fs.readFileSync(
      `./mitre/enterprise-attack-${mitreVersion}.json`,
      'utf8',
    );

    return JSON.parse(enterpriseJSONfile).objects;
  }

  async migrateSTIXObjects(insertQueryGenerator: STIXInsertGenerator) {
    // Generate reference STIX object insert queries
    const { referencedQueryList, referencedProcessedIds } =
      insertQueryGenerator.referencedSTIXObjects();
    await this.inserter.insert(referencedQueryList);

    // Generate markings STIX object insert queries
    const { markingsQueryList, markingsProcessedIds } =
      insertQueryGenerator.statementMarkings();
    await this.inserter.insert(markingsQueryList);

    const STIXIdsProcessed =
      referencedProcessedIds.concat(markingsProcessedIds);
    /*const STIXObjectsAndMarkings =
      insertQueryGenerator.STIXObjectsAndMarkingRelations();*/
  }
}

export default STIXMigrator;
