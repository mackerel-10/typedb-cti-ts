import 'dotenv/config';
import { TypeDBDriver } from 'typedb-driver';
import STIXMigrator from './stix/stix-migrator';
import initializeTypedb from './schema/initialize-typedb';

(async (): Promise<void> => {
  // Initialize the TypeDB
  const typeDBUri: string = process.env.TYPEDB_URI!;
  const database: string = process.env.TYPEDB_DATABASE!;
  const driver: TypeDBDriver = await initializeTypedb(typeDBUri, database);

  // Migrate STIX objects to TypeDB
  const migrator: STIXMigrator = new STIXMigrator(driver, database);
  migrator.migrate();
})();
