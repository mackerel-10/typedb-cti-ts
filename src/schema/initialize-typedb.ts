import {
  SessionType,
  TransactionType,
  TypeDB,
  TypeDBDriver,
} from 'typedb-driver';
import fs from 'fs';
import logger from '../logger';

const close = async (
  session: Session,
  transaction: Transaction,
): Promise<void> => {
  if (transaction?.isOpen()) {
    await transaction.close();
  }
  session?.close();
};

const defineRole = async (
  driver: TypeDBDriver,
  databaseName: string,
): Promise<void> => {
  let session: Session;
  let transaction: Transaction;

  try {
    const ctiRules: string = fs.readFileSync(
      './src/schema/cti-rules.tql',
      'utf8',
    );

    session = await driver.session(databaseName, SessionType.SCHEMA);
    transaction = await session.transaction(TransactionType.WRITE);

    await transaction.query.define(ctiRules);
    await transaction.commit();
  } catch (error) {
    console.error(error);
    await transaction?.rollback();
  } finally {
    await close(session, transaction);
  }
};

const defineSchema = async (
  driver: TypeDBDriver,
  databaseName: string,
): Promise<void> => {
  let session: Session;
  let transaction: Transaction;

  try {
    const ctiSchema: string = fs.readFileSync(
      './src/schema/cti-schema.tql',
      'utf8',
    );

    session = await driver.session(databaseName, SessionType.SCHEMA);
    transaction = await session.transaction(TransactionType.WRITE);

    // Cti Schema
    await transaction.query.define(ctiSchema);
    await transaction.commit();
  } catch (error) {
    console.error(error);
    await transaction?.rollback();
  } finally {
    await close(session, transaction);
  }
};

const initializeTypeDB = async (
  typeDBUri: string,
  databaseName: string,
): Promise<TypeDBDriver> => {
  let driver: Driver;

  try {
    // #1 Make driver
    driver = await TypeDB.coreDriver(typeDBUri);

    const isDatabaseExist: boolean =
      await driver.databases.contains(databaseName);
    if (!isDatabaseExist) {
      await driver.databases.create(databaseName);
    }

    // #2 Define schema and role
    const define = Boolean(JSON.parse(process.env.DEFINE!));
    if (define) {
      logger.info('Inserting Schema and Rules...');
      await defineSchema(driver, databaseName);
      await defineRole(driver, databaseName);
      logger.info('Successfully committed Schema and Rules.');
    }
  } catch (error) {
    console.error(error);
  }

  if (!driver) {
    throw new Error('TypeDB driver is not initialized');
  }

  return driver;
};

export { initializeTypeDB, close };
