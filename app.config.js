const getEnvironment = () => {
    // Detectar si es una build de producción
    const isProduction = process.env.APP_ENV === 'production';

    return {
        name: isProduction ? "AURA" : "AURA Dev",
        apiUrl: isProduction
            ? "https://api.aura-production.com/api"
            : "https://dev-api.aura-app.com/api",
        // Otras variables específicas del entorno
    };
};

const env = getEnvironment();

export default {
    expo: {
        name: env.name,
        slug: "aura-front",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        owner: "alexmm23",

        // El resto de tu configuración actual...

        // Añade las variables de entorno a extra
        extra: {
            apiUrl: env.apiUrl,
            // Otras variables de configuración
            router: {},
            eas: {
                projectId: "c3118355-cc9b-41fd-9ce0-4ea410d8128c"
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#FFFFFF"
            },
            package: "com.aura.app",
            versionCode: 1,
            permissions: [
                "CAMERA",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE",
                "INTERNET",
            ],
            softwareKeyboardLayoutMode: "pan"
        },
    }
};