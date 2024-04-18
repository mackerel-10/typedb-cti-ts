import { TypeDBDriver } from 'typedb-driver';

class TypeDBInserter {
  driver: TypeDBDriver;
  database: string;
  // batch_size;
  // num_threads;

  constructor(driver: TypeDBDriver, database: string) {
    this.driver = driver;
    this.database = database;
  }
}

export default TypeDBInserter;
