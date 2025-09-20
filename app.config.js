const getEnvironment = () => {
  const isProduction = process.env.APP_ENV === 'production';
  return {
    name: isProduction ? "AURA" : "AURA Dev",
    apiUrl: isProduction
      ? "https://back.aurapp.com.mx/api"
      : "http://localhost:3000/api",
  };
};

const env = getEnvironment();

module.exports = {
  expo: {
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
      apiUrl: env.apiUrl
    }
  }
};