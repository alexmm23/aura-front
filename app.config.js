const getEnvironment=() => {
  // Leer variables de entorno del sistema
  const isProduction=process.env.NODE_ENV==='production'||process.env.APP_ENV==='production';
  const customApiUrl=process.env.API_URL;
  return {
    name: isProduction? "AURA":"AURA Dev",
    apiUrl: customApiUrl||(isProduction
      ? "https://back.aurapp.com.mx/api"
      :"https://back.aurapp.com.mx/api"),
    environment: isProduction? 'production':'development',
    webUrl: isProduction
      ? "https://my.aurapp.com.mx"
      :"https://my.aurapp.com.mx"
  };
};

const env=getEnvironment();

module.exports={
  expo: {
    entryPoint: "node_modules/expo-router/entry.js",
    name: env.name,
    slug: "aura-front",
    owner: "alexmm23",
    version: "1.4.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "aura", // ✅ Cambiado de "myapp" a "aura" para consistencia
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      // ✅ Configuración para iOS deep links
      associatedDomains: [
        `applinks:${env.webUrl.replace('http://', '').replace('https://', '')}`
      ],
      bundleIdentifier: "com.alexmm23.aurafront"
    },
    android: {
      versionCode: 6, // <-- INCREMENTA este número en cada build nueva
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alexmm23.aurafront",
      permissions: [
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ],
      // ✅ Configuración para Android deep links
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: env.webUrl.replace('http://', '').replace('https://', '').split(':')[0],
              ...(env.webUrl.includes(':3000')&&{ port: "3000" })
            },
            {
              scheme: "http",
              host: env.webUrl.replace('http://', '').replace('https://', '').split(':')[0],
              ...(env.webUrl.includes(':3000')&&{ port: "3000" })
            },
            {
              scheme: "aura"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      name: "AURA - Organiza, Estudia y Aprende",
      shortName: "AURA",
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon_small.png"
    },
    plugins: [
      [
        "expo-router",
        {
          // ✅ Configuración para expo-router con deep links
          origin: env.webUrl
        }
      ],
      "expo-dev-client",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 500,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-font",
      "expo-head"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "c3118355-cc9b-41fd-9ce0-4ea410d8128c"
      },
      // Configuraciones de entorno
      apiUrl: env.apiUrl,
      webUrl: env.webUrl, // ✅ Agregamos webUrl para usar en el frontend
      environment: env.environment,
      // Pasar variables de entorno adicionales si existen
      customConfig: {
        debugMode: process.env.DEBUG_MODE==='true',
        logLevel: process.env.LOG_LEVEL||'info',
        apiTimeout: parseInt(process.env.API_TIMEOUT||'5000')
      }
    }
  }
};