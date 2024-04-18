import { TypeDB, TypeDBDriver } from 'typedb-driver';

const initializeTypedb = async (
  typeDBUri: string,
  database: string,
): Promise<TypeDBDriver> => {
  // #1 Make driver
  const driver: TypeDBDriver = await TypeDB.coreDriver(typeDBUri);

  const isDatabaseExist: boolean = await driver.databases.contains(database);
  if (!isDatabaseExist) {
    await driver.databases.create(database);
  }

  // #2 Define cti-schema.tql

  return driver;
};

export default initializeTypedb;
