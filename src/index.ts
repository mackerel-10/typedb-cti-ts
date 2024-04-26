import 'dotenv/config';
import { TypeDBDriver } from 'typedb-driver';
import STIXMigrator from './stix/stix-migrator';
import { initializeTypeDB } from './schema/initialize-typedb';
import logger from './logger';

(async (): Promise<void> => {
  try {
    // Initialize the TypeDB
    const typeDBUri: string = process.env.TYPEDB_URI!;
    const database: string = process.env.TYPEDB_DATABASE!;
    const driver: TypeDBDriver = await initializeTypeDB(typeDBUri, database);

    const migrator: STIXMigrator = new STIXMigrator(driver, database);
    await migrator.migrate();
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`${error.message}`, { stack: error.stack });
    }
  }
})();
