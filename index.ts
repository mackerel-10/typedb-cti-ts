import 'dotenv/config';
import STIXMigrator from './src/stix/stix-migrator';

const typeDBUri: string = process.env.TYPEDB_URI!;
const database: string = process.env.TYPEDB_DATABASE!;

(async () => {
  const migrator: STIXMigrator = await STIXMigrator.build(typeDBUri, database);

  migrator.migrate();
})();
