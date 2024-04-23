import 'dotenv/config';
import { TypeDBDriver } from 'typedb-driver';
import STIXMigrator from './stix/stix-migrator';
import { initializeTypeDB } from './schema/initialize-typedb';

(async (): Promise<void> => {
  // Initialize the TypeDB
  const typeDBUri: string = process.env.TYPEDB_URI!;
  const database: string = process.env.TYPEDB_DATABASE!;
  const driver: TypeDBDriver = await initializeTypeDB(typeDBUri, database);

  const migrator: STIXMigrator = new STIXMigrator(driver, database);
  await migrator.migrate();
})();
