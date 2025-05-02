import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function TabsLayout() {
  const colors = Colors.light;
  const MENU_ITEMS = [
    { name: "home", icon: "home", text: "Inicio", route: "/(tabs)/home" },
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
      route: "/(auth)/profile",
    },
  ];

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
    </Tabs>
  );
}
