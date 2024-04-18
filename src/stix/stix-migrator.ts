import fs from 'fs';
import STIXInsertGenerator from './stix-insert-generator';
import TypeDBInserter from './typedb-inserter';
import { TypeDBDriver } from 'typedb-driver';

class STIXMigrator {
  inserter: TypeDBInserter; // TypeDBInserter

  constructor(driver: TypeDBDriver, database: string) {
    this.inserter = new TypeDBInserter(driver, database);
  }

  migrate() {
    // Parse MITRE ATT&CK JSON files
    const STIXObjectList = this.readSTIXObjectsJson();

    // Generate Insert QueryList & insert to TypeDB
    const insertQueryGenerator: STIXInsertGenerator = new STIXInsertGenerator(
      STIXObjectList,
    );

    // Insert STIX objects To Entity
    this.migrateSTIXObjects(insertQueryGenerator);
    // this.migrateSTIXRelationships();
    // this.migrateKillChainPhases();
    // this.migrateExternalReferences();
  }

  readSTIXObjectsJson = () => {
    const mitreVersion: string = '14.1';
    const enterpriseJSONfile = fs.readFileSync(
      `./mitre/enterprise-attack-${mitreVersion}.json`,
      'utf8',
    );
    /*const mobileJSONfile = fs.readFileSync(
      `./mitre/mobile-attack-${mitreVersion}.json`,
      'utf8',
    );
    const ICSJSONfile = fs.readFileSync(
      `./mitre/ics-attack-${mitreVersion}.json`,
      'utf8',
    );*/

    // const parsedMobileJSONData = JSON.parse(mobileJSONfile).objects;
    // const parsedICSJSONData = JSON.parse(ICSJSONfile).objects;

    return JSON.parse(enterpriseJSONfile).objects;
  };

  migrateSTIXObjects(insertQueryGenerator: STIXInsertGenerator) {
    // Make reference STIX object insert queries
    const referenced: Referenced = insertQueryGenerator.referencedSTIXObjects();
    // this.inserter.insert(referenced.queryList);
  }
}

export default STIXMigrator;
