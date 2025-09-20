const getEnvironment=() => {
  // Leer variables de entorno del sistema
  const isProduction=process.env.NODE_ENV==='production'||process.env.APP_ENV==='production';
  const customApiUrl=process.env.API_URL; // Variable de entorno personalizada

  return {
    name: isProduction? "AURA":"AURA Dev",
    apiUrl: customApiUrl||(isProduction
      ? "https://back.aurapp.com.mx/api"
      :"http://localhost:3000/api"),
    environment: isProduction? 'production':'development'
  };
};

const env=getEnvironment();

module.exports={
  expo: {
    entryPoint: "node_modules/expo-router/entry.js",
    name: env.name,
    slug: "aura-front",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alexmm23.aurafront"
    },
    web: {
      name: "AURA - Organiza, Estudia y Aprende",
      shortName: "AURA",
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-dev-client",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
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