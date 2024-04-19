import {
  SessionType,
  TransactionType,
  TypeDB,
  TypeDBDriver,
  TypeDBSession,
  TypeDBTransaction,
} from 'typedb-driver';
import fs from 'fs';

const initializeTypedb = async (
  typeDBUri: string,
  database: string,
): Promise<TypeDBDriver> => {
  let driver: TypeDBDriver | undefined;
  let session: TypeDBSession | undefined;
  let transaction: TypeDBTransaction | undefined;

  try {
    // #1 Make driver
    driver = await TypeDB.coreDriver(typeDBUri);

    const isDatabaseExist: boolean = await driver.databases.contains(database);
    if (!isDatabaseExist) {
      await driver.databases.create(database);
    }

    // #2 Define cti-schema.tql
    const ctiSchema: string = fs.readFileSync(
      './src/schema/cti-schema.tql',
      'utf8',
    );
    /*const ctiRules: string = fs.readFileSync(
      './src/schema/cti-rules.tql',
      'utf8',
    );*/

    session = await driver.session(database, SessionType.SCHEMA);
    transaction = await session.transaction(TransactionType.WRITE);

    // Cti Schema
    await transaction.query.define(ctiSchema);
    await transaction.commit();

    // Cti Rules
    /*await transaction.query.define(ctiRules);
    await transaction.commit();*/
  } catch (error) {
    console.error(error);
  } finally {
    if (transaction?.isOpen()) await transaction.close();
    await session?.close();
  }

  if (!driver) {
    throw new Error('TypeDB driver is not initialized');
  }

  return driver;
};

export default initializeTypedb;
