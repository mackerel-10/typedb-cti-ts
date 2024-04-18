import fs from 'fs';
import StixInsertGenerator from './stix-insert-generator';

class StixMigrator {
  // inserter; // TypeDBInserter

  constructor() {
    // typeDBUri: string, database: string
    // this.inserter = new TypeDBInserter(typeDBUri, database);
  }

  migrate() {
    // Parse MITRE ATT&CK JSON files
    const stixObjectList = this.readStixObjectsJson();

    // Generate Insert QueryList & insert to TypeDB
    const insertQueryGenerator: StixInsertGenerator = new StixInsertGenerator(
      stixObjectList,
    );
    this.migrateStixObjects(insertQueryGenerator);
    // this.migrateStixRelationships();
    // this.migrateKillChainPhases();
    // this.migrateExternalReferences();
  }

  readStixObjectsJson = () => {
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

  migrateStixObjects(insertQueryGenerator: StixInsertGenerator) {
    // Make reference STIX object insert queries
    const referenced: Referenced = insertQueryGenerator.referencedStixObjects();
    // this.inserter.insert(referenced.queryList);
  }
}

export default StixMigrator;
