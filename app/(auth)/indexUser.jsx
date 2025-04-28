import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuraText } from "@/components/AuraText"; // Adjust the import path as necessary


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        
        {/* Mis notas */}
        <View style={styles.section}>
          <AuraTex style={styles.title}>Mis notas</AuraTex>
          <View style={styles.noteCard}>
            <AuraText style={styles.noteTitle}>Nota #1</AuraText>
            <AuraText style={styles.noteText}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </AuraText>
          </View>
          <View style={styles.noteCard}>
            <AuraText style={styles.noteTitle}>Nota #2</AuraText>
            <AuraText style={styles.noteText}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </AuraText>
          </View>
        </View>

        {/* Mis Tareas */}
        <View style={styles.section}>
          <AuraText style={styles.title}>Mis Tareas</AuraText>

          <View style={styles.taskCard}>
            <View>
              <Text style={styles.taskSubject}>Matemáticas</Text>
              <Text style={styles.taskDescription}>Descripción</Text>
              <Text style={styles.taskDueDate}>Fecha de entrega</Text>
            </View>
            <Ionicons name="people" size={40} color="#4CAF50" />
          </View>

          <View style={styles.taskCard}>
            <View>
              <Text style={styles.taskSubject}>Inglés</Text>
              <Text style={styles.taskDescription}>Descripción</Text>
              <Text style={styles.taskDueDate}>Fecha de entrega</Text>
            </View>
            <MaterialCommunityIcons name="mortar-board" size={40} color="#FF9800" />
          </View>

          <View style={styles.taskCard}>
            <View>
              <Text style={styles.taskSubject}>Análisis de Datos</Text>
              <Text style={styles.taskDescription}>Descripción</Text>
              <Text style={styles.taskDueDate}>Fecha de entrega</Text>
            </View>
            <MaterialCommunityIcons name="microsoft-teams" size={40} color="#3F51B5" />
          </View>
        </View>
      </ScrollView>

      {/* Menú de Navegación */}
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

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9900',
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noteTitle: {
    fontWeight: 'bold',
    color: '#A64AC9',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#555',
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskSubject: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E91E63',
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#999',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#9C27B0',
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
