import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useLayoutEffect } from "react";
import { Image, View, Text } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TabsLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Usamos useLayoutEffect para la navegación y agregamos un pequeño retraso
  useLayoutEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Si aún estamos cargando o no autenticado, no renderizamos las pestañas
  if (isLoading || !isAuthenticated) {
    return null; // No renderizar nada mientras verificamos autenticación
  }

  return (
    <SafeAreaProvider>
      <TabsContent />
    </SafeAreaProvider>
  );
}

function TabsContent() {
  const insets = useSafeAreaInsets();

  const MENU_ITEMS = [
    {
      name: "home",
      icon: require("../../assets/images/home.png"),
      text: "Inicio",
      route: "/(tabs)/home",
    },
    {
      name: "NoteBookScreen",
      icon: require("../../assets/images/cuaderno.png"),
      text: "Notas",
      route: "/(tabs)/NoteBookScreen",
    },
    {
      name: "classes",
      icon: require("../../assets/images/clases.png"),
      text: "Clases",
      route: "/(tabs)/classes",
    },
    {
      name: "profile",
      icon: require("../../assets/images/perfil.png"),
      text: "Perfil",
      route: "/(tabs)/profile",
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#e0e0e0",
        tabBarStyle: {
          backgroundColor: "#7C3AED",
          borderTopWidth: 0,
          // height: 60 + insets.bottom, // Agregar el espacio del área segura inferior
          // paddingBottom: insets.bottom, // Padding para el área segura
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarIconStyle: {
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
          width: "100%",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
          textAlign: "center",
          width: "100%",
          padding: 0,
        },
      }}
    >
      {MENU_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.text,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Image
                  source={item.icon}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: focused ? "#fff" : "#e0e0e0",
                    marginBottom: 2,
                    marginTop: 10,
                  }}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />
      ))}
      {/* Ocultar rutas anidadas que no queremos en la navegación */}
      <Tabs.Screen
        name="profile/link_moodle"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/profile_edit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notebookPages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="taskDetails"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notebookView"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
