# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Configuración de URLs de la API

Este proyecto utiliza un sistema de URLs dinámicas que permite cambiar fácilmente entre entornos de desarrollo y producción.

### Uso del sistema de URLs dinámicas

Para usar las URLs dinámicas en cualquier componente o archivo, importa las utilidades `API` y `buildApiUrl` desde el archivo de configuración:

```javascript
import { API, buildApiUrl } from '@/config/api';

// Uso de una URL completa
const apiUrl = buildApiUrl(API.ENDPOINTS.AUTH.LOGIN);
// Resultado: http://localhost:3000/api/auth/login (en desarrollo)

// Otra forma de uso para endpoints específicos
fetch(buildApiUrl(API.ENDPOINTS.STUDENT.HOMEWORK));
```

### Configuración de entornos

Las URLs se pueden configurar de las siguientes maneras:

1. **Scripts para cambiar entre entornos**:
   ```bash
   # Cambiar a entorno de desarrollo
   npm run env:dev
   
   # Cambiar a entorno de producción
   npm run env:prod
   ```

2. **Variables de entorno**: Crea o modifica el archivo `.env` en la raíz del proyecto:
   ```
   API_URL=http://tu-api-url.com/api
   ```

3. **Configuración en app.config.js**: El archivo `app.config.js` contiene configuraciones para diferentes entornos:
   ```javascript
   extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000/api",
      apiProduction: "https://api.aura-app.com/api",
    },
   ```

4. **Configuración según la plataforma**: Para emuladores Android, se usa automáticamente la URL correcta (`10.0.2.2` en lugar de `localhost`).

### Ambiente de desarrollo vs producción

- En desarrollo (`__DEV__` = true), se usa la URL del entorno de desarrollo.
- En producción, se usa automáticamente la URL de producción.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
