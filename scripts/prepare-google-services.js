const { copyFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const sourcePath = process.env.GOOGLE_SERVICES_JSON_FILE;
const destinationPath = resolve(process.cwd(), process.env.GOOGLE_SERVICES_DEST || './google-services.json');

if (!sourcePath) {
  console.log('GOOGLE_SERVICES_JSON_FILE not set; skipping google-services.json materialization.');
  process.exit(0);
}

const resolvedSource = resolve(sourcePath);

if (!existsSync(resolvedSource)) {
  console.warn(`google-services.json source not found at ${resolvedSource}; skipping copy.`);
  process.exit(0);
}

copyFileSync(resolvedSource, destinationPath);
console.log(`google-services.json copied to ${destinationPath}`);
