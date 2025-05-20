import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth"; // Hook para manejar la autenticación
import { useEffect } from "react";

export default function TabsLayout() {
  const colors = Colors.light;
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); // Verifica si el usuario está autenticado

  const MENU_ITEMS = [
    { name: "home", 
      icon: "home", 
      text: "Inicio", 
      route: "/(tabs)/home",
    },
    {
      name: "notes",
      icon: "document-text",
      text: "Notas",
      route: "/(tabs)/notes",
    },
    {
      name: "classes",
      icon: "school",
      text: "Clases",
      route: "/(tabs)/classes",
    },
    {
      name: "chats",
      icon: "chatbubbles",
      text: "Chats",
      route: "/(tabs)/chats",
    },
    {
      name: "profile",
      icon: "person",
      text: "Perfil",
      route: "/(tabs)/profile",
    },
  ];

  // Redirige al usuario a la pantalla de inicio de sesión si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login"); // Redirige a la pantalla de inicio de sesión
    }
  }, [isAuthenticated, isLoading, router]);

  // Muestra una pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.purple,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "fredoka-regular",
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginBottom: 5,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.white,
      }}
    >
      {MENU_ITEMS.map((item) => (
    <Tabs.Screen
      key={item.name}
      name={item.name}
      options={{
        tabBarLabel: item.text,
        tabBarIcon: ({ color }) => (
          <Ionicons name={item.icon} size={24} color={color} />
        ),
      }}
    />
  ))}

  {/* Oculta la pantalla que no quieres que aparezca en las tabs */}
  <Tabs.Screen
    name="profile/profile_edit"
    options={{
      href: null, // <- esto lo excluye del router de tabs
      //tabBarButton: () => null,
    }}
  />
  <Tabs.Screen
    name="profile/link_moodle"
    options={{
      href: null, // <- esto lo excluye del router de tabs
      //tabBarButton: () => null,
    }}
  />
</Tabs>

  );
}
