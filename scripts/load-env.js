#!/usr/bin/env node
/**
 * Script para cargar variables de entorno desde .env.local
 * Uso: node scripts/load-env.js [comando]
 * Ejemplo: node scripts/load-env.js npm start
 */

const fs=require('fs');
const path=require('path');
const { spawn }=require('child_process');

// Función para cargar archivo .env
function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const content=fs.readFileSync(envPath, 'utf8');
    const env={};

    content.split('\n').forEach(line => {
        const trimmed=line.trim();
        if (trimmed&&!trimmed.startsWith('#')) {
            const [key, ...valueParts]=trimmed.split('=');
            if (key&&valueParts.length>0) {
                const value=valueParts.join('=').replace(/^["']|["']$/g, '');
                env[key.trim()]=value;
            }
        }
    });

    return env;
}

// Cargar variables de entorno
const envLocalPath=path.resolve(__dirname, '..', '.env.local');
const envVars=loadEnvFile(envLocalPath);

// Aplicar variables al proceso actual
Object.assign(process.env, envVars);

if (Object.keys(envVars).length>0) {
    console.log('📦 Variables de entorno cargadas desde .env.local:');
    Object.keys(envVars).forEach(key => {
        console.log(`   ${key}=${envVars[key]}`);
    });
    console.log('');
}

// Si se pasaron argumentos, ejecutar el comando
if (process.argv.length>2) {
    const [, , command, ...args]=process.argv;
    console.log(`🚀 Ejecutando: ${command} ${args.join(' ')}`);

    const child=spawn(command, args, {
        stdio: 'inherit',
        env: process.env,
        shell: true
    });

    child.on('close', (code) => {
        process.exit(code);
    });

    child.on('error', (error) => {
        console.error('❌ Error ejecutando comando:', error.message);
        process.exit(1);
    });
} else {
    console.log('💡 Variables de entorno establecidas. Ahora puedes ejecutar tu comando.');
}