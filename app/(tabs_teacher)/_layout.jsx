import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import RoleProtectedTabs from "@/components/RoleProtectedTabs";

export default function TabsLayout() {
  return (
    <RoleProtectedTabs requiredRole={3}>
      <SafeAreaProvider>
        <TabsContent />
      </SafeAreaProvider>
    </RoleProtectedTabs>
  );
}

function TabsContent() {
  const insets = useSafeAreaInsets();

  // ...existing code...
  const MENU_ITEMS = [
    {
      name: "HomeTeacher",
      icon: require("../../assets/images/home.png"),
      text: "Inicio",
      route: "(tabs_teacher)/HomeTeacher", // Remove the leading slash
    },
    {
      name: "reminders",
      icon: require("../../assets/images/recordatorio.png"),
      text: "Recordatorios",
      route: "(tabs_teacher)/reminders", // Remove the leading slash
    },
    {
      name: "classes",
      icon: require("../../assets/images/clases.png"),
      text: "Clases",
      route: "(tabs_teacher)/classes", // Remove the leading slash
    },
    {
      name: "Chats",
      icon: require("../../assets/images/chat.png"),
      text: "Chats",
      route: "(tabs_teacher)/chats", // Remove the leading slash
    },
    {
      name: "profile",
      icon: require("../../assets/images/perfil.png"),
      text: "Perfil",
      route: "(tabs_teacher)/profile", // Remove the leading slash
    },
  ];
  // ...existing code...

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#e0e0e0",
        tabBarStyle: {
          backgroundColor: "#7C3AED",
          borderTopWidth: 0,
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
        name="classes_teacher/createresourse"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
