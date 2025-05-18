// Navbar.js
import { View, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import NavbarItem from "./NavbarItem";

import { Colors } from "@/constants/Colors";

export default function Navbar() {
  const router = useRouter();
  const ITEMS = [
    { icon: "home", text: "Inicio", route: "/(tabs)/home" },
    { icon: "document-text", text: "Notas", route: "/(tabs)/notes" },
    { icon: "school", text: "Clases", route: "/(tabs)/classes" },
    { icon: "chatbubbles", text: "Chats", route: "/(tabs)/chats" },
    { icon: "person", text: "Perfil", route: "/(tabs)/profile" },
  ];

  const onPressItem = (route) => {
    router.replace(route);
  };

  return (
    <View style={styles.navbar}>
      {ITEMS.map((item, index) => (
        <NavbarItem
          key={index}
          icon={item.icon}
          text={item.text}
          onPress={() => onPressItem(item.route)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    backgroundColor: Colors.light.purple,
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
