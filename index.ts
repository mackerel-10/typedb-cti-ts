import fs from 'fs';
import StixMigrator from './stix/stix-migrator';

const readStixObjectsJson = () => {
  const mitreVersion: string = '14.1';
  const enterpriseJSONfile = fs.readFileSync(
    `./mitre/enterprise-attack-${mitreVersion}.json`,
    'utf8',
  );
  /*const mobileJSONfile = fs.readFileSync(
    `./mitre/mobile-attack-${mitreVersion}.json`,
    'utf8',
  );
  const ICSJSONfile = fs.readFileSync(
    `./mitre/ics-attack-${mitreVersion}.json`,
    'utf8',
  );*/

  const parsedEnterpriseJSONData = JSON.parse(enterpriseJSONfile).objects;
  // const parsedMobileJSONData = JSON.parse(mobileJSONfile).objects;
  // const parsedICSJSONData = JSON.parse(ICSJSONfile).objects;

  return parsedEnterpriseJSONData;
};

const parsedMitreJSONData = readStixObjectsJson();
const migrator = new StixMigrator(parsedMitreJSONData);

migrator.migrateStixObjects();
