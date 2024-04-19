import {
  TypeDBDriver,
  TypeDBSession,
  TypeDBTransaction,
  SessionType,
  TransactionType,
} from 'typedb-driver';
import { close } from '../schema/initialize-typedb';

class TypeDBInserter {
  driver: TypeDBDriver;
  database: string;
  // batch_size;
  // num_threads;

  constructor(driver: TypeDBDriver, database: string) {
    this.driver = driver;
    this.database = database;
  }

  async insert(queryList: Set<string>) {
    let session: TypeDBSession | undefined;
    let transaction: TypeDBTransaction | undefined;

    try {
      session = await this.driver.session(this.database, SessionType.DATA);
      transaction = await session.transaction(TransactionType.WRITE);

      for (const query of queryList) {
        transaction.query.insert(query);
      }

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction?.rollback();
    } finally {
      await close(transaction, session);
    }
  }
}

export default TypeDBInserter;
