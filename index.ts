import 'dotenv/config';
import StixMigrator from './src/stix/stix-migrator';

const typeDBUri: string = process.env.TYPEDB_URI!;
const database: string = process.env.TYPEDB_DATABASE!;

const migrator = new StixMigrator(typeDBUri, database);

migrator.migrate();
