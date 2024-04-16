import StixInsertGenerator from './stix-insert-generator';

class StixMigrator {
  inserter: StixInsertGenerator;

  constructor(parsedMitreJSONData: STIXObject[]) {
    this.inserter = new StixInsertGenerator(parsedMitreJSONData);
  }

  migrateStixObjects() {
    const referenced = this.inserter.referencedStixObjects();
  }
}

export default StixMigrator;
