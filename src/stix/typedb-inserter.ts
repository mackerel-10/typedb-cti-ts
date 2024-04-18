import { TypeDB, TypeDBDriver } from 'typedb-driver';

class TypeDBInserter {
  driver: TypeDBDriver;
  database: string;
  // batch_size;
  // num_threads;

  constructor(driver: TypeDBDriver, database: string) {
    this.driver = driver;
    this.database = database;
  }

  static async build(
    typeDBUri: string,
    database: string,
  ): Promise<TypeDBInserter> {
    let driver: TypeDBDriver | undefined = undefined;
    try {
      driver = await TypeDB.coreDriver(typeDBUri);
    } catch (error) {
      console.error(error);
    }

    if (!driver) {
      throw new Error('TypeDB driver not initialized');
    }
    return new TypeDBInserter(driver, database);
  }
}

export default TypeDBInserter;
