/**
 * Script simplificado para cambiar entre entornos de desarrollo y producción
 * Uso: node switch-env-simple.js dev|prod
 */

const fs = require('fs');
const path = require('path');

// Determinar el entorno a cambiar
const targetEnv = process.argv[2] ? process.argv[2].toLowerCase() : null;

if (!targetEnv || (targetEnv !== 'dev' && targetEnv !== 'prod')) {
  console.error('❌ Por favor especifica un entorno: node switch-env-simple.js dev|prod');
  process.exit(1);
}

try {
  // Rutas de los archivos
  const envPath = path.resolve(__dirname, '..', '.env');
  const sourcePath = path.resolve(__dirname, '..', `.env.${targetEnv}`);
  
  console.log(`🔄 Cambiando a entorno: ${targetEnv === 'dev' ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
  
  // Verificar si el archivo origen existe
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ El archivo .env.${targetEnv} no existe`);
    process.exit(1);
  }
  
  // Leer contenido del archivo origen
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Escribir en el archivo .env
  fs.writeFileSync(envPath, sourceContent, 'utf8');
  
  // Mostrar configuración activa
  const content = fs.readFileSync(envPath, 'utf8');
  const apiUrl = content.match(/API_URL=(.+)/);
  
  console.log(`✅ Entorno cambiado a ${targetEnv === 'dev' ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
  console.log(`🔗 API: ${apiUrl ? apiUrl[1] : 'No se encontró la URL'}`);
} catch (error) {
  console.error(`❌ Error al cambiar el entorno: ${error.message}`);
  process.exit(1);
}