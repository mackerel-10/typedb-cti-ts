import StixInsertGenerator from './stix-insert-generator';

class StixMigrator {
  inserter: StixInsertGenerator;

  constructor(parsedMitreJSONData: STIXObject[]) {
    this.inserter = new StixInsertGenerator(parsedMitreJSONData);
  }

  migrateStixObjects() {
    // Make refence stix object insert queries
    const referenced: Referenced = this.inserter.referencedStixObjects();
    this.inserter;
  }
}

export default StixMigrator;
