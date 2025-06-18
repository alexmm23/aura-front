import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useLayoutEffect } from "react";

export default function TabsLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const MENU_ITEMS = [
    { name: "home", icon: "home", text: "Inicio", route: "/(tabs)/home" },
    {
      name: "profile",
      icon: "person",
      text: "Perfil",
      route: "/(tabs)/profile",
    },
    {
      name: "NoteBookScreen",
      icon: "book",
      text: "Cuaderno",
      route: "/(tabs)/NoteBookScreen",
    },
  ];

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      {" "}
      {MENU_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.text,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={item.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
      {/* Ocultar rutas anidadas que no queremos en la navegación */}
      <Tabs.Screen
        name="profile/link_moodle"
        options={{
          href: null, // Esto oculta la ruta de la navegación
        }}
      />
      <Tabs.Screen
        name="profile/profile_edit"
        options={{
          href: null, // Esto oculta la ruta de la navegación
        }}
      />
    </Tabs>
  );
}
