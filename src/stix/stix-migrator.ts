import fs from 'fs';
import { TypeDBDriver } from 'typedb-driver';
import STIXInsertGenerator from './stix-insert-generator';
import TypeDBInserter from './typedb-inserter';
import logger from '../logger';

class STIXMigrator {
  inserter: TypeDBInserter;

  constructor(driver: TypeDBDriver, database: string) {
    this.inserter = new TypeDBInserter(driver, database);
  }

  async migrate() {
    logger.info('Inserting Data...');

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

    logger.info('Successfully inserted data');
  }

  readSTIXObjectsJson() {
    const mitreVersion: string = process.env.MITRE_ATTACK_VERSION!;
    const enterpriseAttack = fs.readFileSync(
      `./mitre/enterprise-attack-${mitreVersion}.json`,
      'utf8',
    );

    return JSON.parse(enterpriseAttack).objects;
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

    const STIXIdsProcessed: Id[] =
      referencedProcessedIds.concat(markingsProcessedIds);
    const { STIXEntityQueryList, markingRelations } =
      insertQueryGenerator.STIXObjectsAndMarkingRelations(STIXIdsProcessed); // Exclude processed STIX objects
    await this.inserter.insert(STIXEntityQueryList);
    await this.inserter.insert(markingRelations);
  }
}

export default STIXMigrator;
