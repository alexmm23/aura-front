import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuraText } from "@/components/AuraText"; 
import Navbar from "@/components/Navbar"; 
import Svg, { Path } from 'react-native-svg';
import { Colors } from "@/constants/Colors";




export default function HomeScreen() {
  const { height, width } = useWindowDimensions();
  const colors = Colors.light;
  const isLandscape = width > height;


  return (
    <View style={styles.container}>
      {/* Header con SVG */}
      {isLandscape ? (
          <LandscapeHeader colors={colors} styles={styles} />
        ) : (
          <PortraitHeader colors={colors} styles={styles} />
        )}
      <ScrollView style={styles.content}>

        
        
        {/* Mis notas */}
        <View style={styles.card}>
          <AuraText style={styles.title} text = "Mis Notas"></AuraText>
          <View style={styles.noteCard}>
            <AuraText style={styles.noteTitle} text = "Nota #1"></AuraText>
            <AuraText 
              style={styles.noteText} 
              text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            ></AuraText>
          </View>
          <View style={styles.noteCard}>
          <AuraText style={styles.noteTitle} text = "Nota #2"></AuraText>
            <AuraText 
              style={styles.noteText} 
              text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            ></AuraText>
          </View>
        </View>

        {/* Mis Tareas */}
        <View style={styles.card}>
          <AuraText style={styles.title} text = "Mis Tareas"></AuraText>

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
        <Navbar />

      </View>
  );
}


const LandscapeHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
      fill={"#D1A8D2"}
      />
    </Svg>
  </View>
);

const PortraitHeader = ({ colors, styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 349 371"
      style={styles.svg}
    >
      <Path
        d="M378.433 23.1915C10.4329 96.1914 276.5 123 113 264C14.4172 264 -55.5672 389.527 -55.5672 296.191C-55.5672 202.855 -287.15 -61.8085 -188.567 -61.8085C-89.9844 -61.8085 378.433 -70.1446 378.433 23.1915Z"
        fill={"#D1A8D2"}
      />
    </Svg>

  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E2D2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    width: '97%',
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 7,
    marginTop: "4%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9900',
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: '#E4E3DD',
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
    backgroundColor: '#E4E3DD',
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
  // Estilos para modo vertical
  backgroundContainer: {
    height: 350,   // o 400 si quieres más altura
    width: "100%",
    position: "absolute",   // <-- posición absoluta
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,              // <-- para que esté detrás del contenido
  },
  // Estilos para modo horizontal
  backgroundContainerLandscape: {
    position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  width: "40%",
  height: "100%",
  zIndex: -1,              // <-- también para que esté detrás
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,              // igual que el contenedor
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,          //mas espacio arriba
  },
  headerContentLandscape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30             // mas espacio al rededor
  },
});
