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
      name: "NoteBookScreen",
      icon: "book",
      text: "Cuaderno",
      route: "/(tabs)/NoteBookScreen",
    },
    {
      name: "profile",
      icon: "person",
      text: "Perfil",
      route: "/(tabs)/profile",
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
        tabBarActiveTintColor: colors.primary, // Color del ícono/texto activo
        tabBarInactiveTintColor: colors.gray, // Color del ícono/texto inactivo
        tabBarStyle: {
          backgroundColor: colors.white, // Color de fondo de la navbar
          borderTopWidth: 1, // Grosor del borde superior
          borderTopColor: "#e0e0e0", // Color del borde superior
          elevation: 8, // Sombra en Android
          shadowOpacity: 0.1, // Opacidad de sombra en iOS
          shadowRadius: 4, // Radio de sombra en iOS
          shadowOffset: { width: 0, height: -2 }, // Offset de sombra en iOS
          height: 65, // Altura de la navbar
          paddingBottom: 8, // Padding inferior
          paddingTop: 8, // Padding superior
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
        },
        tabBarLabelStyle: {
          fontSize: 12, // Tamaño de fuente del texto
          fontWeight: "600", // Peso de fuente
          marginTop: 4, // Margen superior del texto
        },
        tabBarIconStyle: {
          marginBottom: 2, // Margen inferior del ícono
        },
      }}
    >
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
