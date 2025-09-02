/**
 * Script para cambiar entre entornos de desarrollo y producción
 * Uso: node switch-env.js dev|prod
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno actuales
config();

const ENV_PATH = join(__dirname, '..', '.env');
const ENV_DEV = '# API Configuration\nAPI_URL=http://localhost:3000/api';
const ENV_PROD = '# API Configuration\nAPI_URL=https://back.aurapp.com.mx/api'; // Cambiar por la URL de producción real

// Determinar el entorno a cambiar
const targetEnv = process.argv[2] ? process.argv[2].toLowerCase() : null;

if (!targetEnv || (targetEnv !== 'dev' && targetEnv !== 'prod')) {
  console.error('❌ Por favor especifica un entorno: node switch-env.js dev|prod');
  process.exit(1);
}

try {
  // Verificar si existe el archivo .env
  console.log(`Escribiendo en: ${ENV_PATH}`);
  
  // Escribir el archivo .env con la configuración correspondiente
  if (targetEnv === 'dev') {
    writeFileSync(ENV_PATH, ENV_DEV, { encoding: 'utf8', flag: 'w' });
    
    // Verificar que se haya guardado correctamente
    const savedContent = readFileSync(ENV_PATH, 'utf8');
    console.log('Contenido guardado:', savedContent);
    
    console.log('✅ Entorno cambiado a DESARROLLO');
    console.log(`🔗 API: ${ENV_DEV.split('=')[1]}`);
  } else {
    writeFileSync(ENV_PATH, ENV_PROD, { encoding: 'utf8', flag: 'w' });
    
    // Verificar que se haya guardado correctamente
    const savedContent = readFileSync(ENV_PATH, 'utf8');
    console.log('Contenido guardado:', savedContent);
    
    console.log('✅ Entorno cambiado a PRODUCCIÓN');
    console.log(`🔗 API: ${ENV_PROD.split('=')[1]}`);
  }
} catch (error) {
  console.error(`❌ Error al cambiar el entorno: ${error.message}`);
  process.exit(1);
}
