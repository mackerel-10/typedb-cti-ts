import {
  TypeDBDriver,
  TypeDBSession,
  TypeDBTransaction,
  SessionType,
  TransactionType,
} from 'typedb-driver';
import logger from '../logger';
import { close } from '../schema/initialize-typedb';

class TypeDBInserter {
  driver: TypeDBDriver;
  database: string;

  constructor(driver: TypeDBDriver, database: string) {
    this.driver = driver;
    this.database = database;
  }

  async insert(queryList: Query[]) {
    const startTime = new Date().getTime();
    const batchSize = parseInt(process.env.BATCH_SIZE!) || 50;

    // Split queryList into batches
    const batchList: Query[][] = [];
    let batch: Query[] = [];
    for (const query of queryList) {
      batch.push(query);
      if (batch.length === batchSize) {
        batchList.push(batch);
        batch = [];
      }
    }
    batchList.push(batch);

    await Promise.all(
      batchList.map((batch: Query[]) => this.insertQueryBatch(batch)),
    );

    logger.info(
      `Inserted ${queryList.length} queries in ${new Date().getTime() - startTime} ms`,
    );
  }

  async insertQueryBatch(queryList: Query[]): Promise<void> {
    // TypeDB insert
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
