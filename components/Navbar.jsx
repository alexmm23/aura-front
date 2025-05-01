// Navbar.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";


export default function Navbar() {
  const router = useRouter();
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="home" size={24} color="white" />
        <Text style={styles.navText}>Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="document-text" size={24} color="white" />
        <Text style={styles.navText}>Notas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="school" size={24} color="white" />
        <Text style={styles.navText}>Clases</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="chatbubbles" size={24} color="white" />
        <Text style={styles.navText}>Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(auth)/profile")}>
        <Ionicons name="person" size={24} color="white" />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#7752CC',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});
