/**
 * Script simplificado para cambiar entre entornos de desarrollo y producción
 * Ahora establece la variable APP_ENV que usa app.config.js
 * Uso: node switch-env-simple.js dev|prod
 */

// Determinar el entorno a cambiar
const targetEnv=process.argv[2]? process.argv[2].toLowerCase():null;

if (!targetEnv||(targetEnv!=='dev'&&targetEnv!=='prod')) {
  console.error('❌ Por favor especifica un entorno: node switch-env-simple.js dev|prod');
  process.exit(1);
}

try {
  // Establecer la variable de entorno APP_ENV
  const envValue=targetEnv==='prod'? 'production':'development';
  console.log(`🔄 Cambiando al entorno: ${envValue}`);

  // Establecer la variable de entorno para el proceso actual
  process.env.APP_ENV=envValue;

  console.log(`✅ Entorno cambiado a: ${envValue}`);
  console.log(`📝 Configuración de API se manejará desde app.config.js`);
  console.log(`� API URL: ${envValue==='production'? 'https://back.aurapp.com.mx/api':'http://localhost:3000/api'}`);

} catch (error) {
  console.error('❌ Error al cambiar el entorno:', error.message);
  process.exit(1);
}