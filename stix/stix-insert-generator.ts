class StixInsertGenerator {
  jsonObject: STIXObject[];

  constructor(jsonObject: STIXObject[]) {
    this.jsonObject = jsonObject;
  }

  referencedStixObjects() {
    const referencedIds = [];

    for (const stixObject of this.jsonObject) {
      if (stixObject.created_by_ref) {
        referencedIds.push(stixObject.created_by_ref);
      }
    }

    return referencedIds;
  }
}

export default StixInsertGenerator;
