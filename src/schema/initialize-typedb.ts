import {
  SessionType,
  TransactionType,
  TypeDB,
  TypeDBDriver,
  TypeDBSession,
  TypeDBTransaction,
} from 'typedb-driver';
import fs from 'fs';

const close = async (
  transaction: TypeDBTransaction | undefined,
  session: TypeDBSession | undefined,
): Promise<void> => {
  if (transaction?.isOpen()) {
    await transaction.close();
  }
  session?.close();
};

const defineRole = async (
  driver: TypeDBDriver,
  database: string,
): Promise<void> => {
  let session: TypeDBSession | undefined;
  let transaction: TypeDBTransaction | undefined;

  try {
    const ctiRules: string = fs.readFileSync(
      './src/schema/cti-rules.tql',
      'utf8',
    );

    session = await driver.session(database, SessionType.SCHEMA);
    transaction = await session.transaction(TransactionType.WRITE);

    // Cti Rules
    await transaction.query.define(ctiRules);
    await transaction.commit();
  } catch (error) {
    console.error(error);
    await transaction?.rollback();
  } finally {
    await close(transaction, session);
  }
};

const defineSchema = async (
  driver: TypeDBDriver,
  database: string,
): Promise<void> => {
  let session: TypeDBSession | undefined;
  let transaction: TypeDBTransaction | undefined;

  try {
    const ctiSchema: string = fs.readFileSync(
      './src/schema/cti-schema.tql',
      'utf8',
    );

    session = await driver.session(database, SessionType.SCHEMA);
    transaction = await session.transaction(TransactionType.WRITE);

    // Cti Schema
    await transaction.query.define(ctiSchema);
    await transaction.commit();
  } catch (error) {
    console.error(error);
    await transaction?.rollback();
  } finally {
    await close(transaction, session);
  }
};

const initializeTypedb = async (
  typeDBUri: string,
  database: string,
): Promise<TypeDBDriver> => {
  let driver: TypeDBDriver | undefined;

  try {
    // #1 Make driver
    driver = await TypeDB.coreDriver(typeDBUri);

    const isDatabaseExist: boolean = await driver.databases.contains(database);
    if (!isDatabaseExist) {
      await driver.databases.create(database);
    }

    // #2 Define schema and role
    // await defineSchema(driver, database);
    // await defineRole(driver, database);
  } catch (error) {
    console.error(error);
  }

  if (!driver) {
    throw new Error('TypeDB driver is not initialized');
  }

  return driver;
};

export { initializeTypedb, close };
