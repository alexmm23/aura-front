import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NavbarItem({ icon, text, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color="white" />
      <Text style={styles.navText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
});
