import fs from 'fs';
import { TypeDBDriver } from 'typedb-driver';
import STIXInsertGenerator from './stix-insert-generator';
import TypeDBInserter from './typedb-inserter';
import logger from '../logger';

class STIXMigrator {
  inserter: TypeDBInserter;

  constructor(driver: TypeDBDriver, databaseName: string) {
    this.inserter = new TypeDBInserter(driver, databaseName);
  }

  async migrate(): Promise<void> {
    logger.info('🏁Start Inserting MITRE ATT&CK Enterprise Attack Data...');

    // Parse MITRE ATT&CK JSON files
    const STIXObjectList = this.readSTIXMitreAttackJSON();

    // Get TypeList of MITRE ATT&CK Enterprise version
    // const typeList: string[] = this.getTypeListOfMitreAttack(STIXObjectList);

    // Generate Insert QueryList & insert to TypeDB
    const insertQueryGenerator: STIXInsertGenerator = new STIXInsertGenerator(
      STIXObjectList,
    );

    // Insert STIX objects To Entity
    logger.info('1️⃣Inserting STIX Objects...');
    // await this.migrateSTIXObjects(insertQueryGenerator);
    logger.info('2️⃣Inserting STIX Relationships...');
    // await this.migrateSTIXRelationships(insertQueryGenerator);
    logger.info('3️⃣Inserting STIX Kill Chain Phases...');
    await this.migrateKillChainPhases(insertQueryGenerator);
    logger.info('4️⃣Inserting STIX External References...');
    // this.migrateExternalReferences();

    logger.info('👏Successfully inserted data');
  }

  readSTIXMitreAttackJSON(): STIXObject[] {
    const mitreVersion: string = process.env.MITRE_ATTACK_VERSION!;
    const enterpriseAttack = fs.readFileSync(
      `./mitre/enterprise-attack-${mitreVersion}.json`,
      'utf8',
    );

    return JSON.parse(enterpriseAttack).objects;
  }

  async migrateSTIXObjects(
    insertQueryGenerator: STIXInsertGenerator,
  ): Promise<void> {
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

  async migrateSTIXRelationships(
    insertQueryGenerator: STIXInsertGenerator,
  ): Promise<void> {
    const relations = insertQueryGenerator.STIXRelationships();

    await this.inserter.insert(relations);
  }

  async migrateKillChainPhases(
    insertQueryGenerator: STIXInsertGenerator,
  ): Promise<void> {
    const { killChainPhaseList, killChainPhaseUsages } =
      insertQueryGenerator.killChainPhases();

    await this.inserter.insert(killChainPhaseList);
    await this.inserter.insert(killChainPhaseUsages);
  }

  /*async migrateExternalReferences(insertQueryGenerator: STIXInsertGenerator): Promise<void> {
    const externalReferences = insertQueryGenerator.externalReferences();

    await this.inserter.insert(externalReferences.externalReferences);
    await this.inserter.insert(externalReferences.externalReferencesRelations);
  }*/

  getTypeListOfMitreAttack(STIXObjectList: STIXObject[]): string[] {
    const type = new Set<string>();

    STIXObjectList.forEach((STIXObject: STIXObject) => {
      type.add(STIXObject.type);
    });

    return [...type];
  }
}

export default STIXMigrator;
