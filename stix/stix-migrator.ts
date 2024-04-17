import StixInsertGenerator from './stix-insert-generator';

class StixMigrator {
  inserter: StixInsertGenerator;

  constructor(parsedMitreJSONData: STIXObject[]) {
    this.inserter = new StixInsertGenerator(parsedMitreJSONData);
  }

  migrateStixObjects() {
    // Make refence stix object insert queries
    const referencedObject = this.inserter.referencedStixObjects();
  }
}

export default StixMigrator;
