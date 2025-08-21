import { View, StyleSheet, Image, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { AuraText } from "@/components/AuraText";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const Background = ({ isLandscape }) => (
  <View style={styles.svgContainer}>
    <Svg
      width="100%"
      height="100%"
      viewBox="0 -10 352 765"
      preserveAspectRatio="xMidYMid slice"
    >
      <Path
        d="M321.139 280.849C197.115 472.07 364.268 882.147 131.999 731.5C305 714.5 -217.061 634.425 185.875 643.307C450.724 707.788 -169.105 -178.467 47.345 15.3111C149.545 229.815 445.163 89.6276 321.139 280.849Z"
        fill="#CDAEC4"
        fillOpacity="0.67"
        transform={isLandscape ? "scale(.6) translate(200,0)" : "scale(1.2)"} 
        // Agregamos translate para mover a la izquierda en modo landscape
      />
    </Svg>
  </View>
);

export default function ClassDetail() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const dynamicStyles = {
    header: {
      marginLeft: isLandscape ? 250 : 20,
      marginRight: isLandscape ? 250 : 20,
    },
    taskCard: {
      marginLeft: isLandscape ? 260 : 20,
      marginRight: isLandscape ? 260 : 20,
    }
  };

  return (
    <View style={styles.container}>
      <Background isLandscape={isLandscape} />
      {/* Header con flecha de regreso */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
        >
            <AuraText text="←" style={styles.backArrow} />
        </TouchableOpacity>

        <Image 
            source={require("../../../assets/images/books.png")}
            style={styles.headerImage}
        />

        <AuraText text="Análisis de Datos" style={styles.className} />
    </View>

      <ScrollView style={styles.content}>
        {/* Card de tarea */}
        <View style={[styles.taskCard, dynamicStyles.taskCard]}>
          <View style={styles.taskHeader}>
            <Image 
              source={require("../../../assets/images/task-icon.png")}
              style={styles.taskIcon}
            />
            <View style={styles.taskInfo}>
              <AuraText text="Visualización de Datos" style={styles.taskTitle} />
              <AuraText text="Profa. Juanita Perez" style={styles.teacherName} />
            </View>
            <AuraText text="25 Abril" style={styles.taskDate} />
          </View>
          
          <AuraText 
            text="Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
            style={styles.taskDescription}
          />

          <TouchableOpacity style={styles.uploadButton}>
            <AuraText text="Subir archivos" style={styles.uploadButtonText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton}>
            <AuraText text="Entregar Tarea" style={styles.submitButtonText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  svgContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
    position: 'relative',
  },
  header: {
    backgroundColor: "#A3B8D7",
    padding: 20,
    borderRadius: 15,
    marginTop: 50,
    height: 290,
    flexDirection: "column", // Changed to column to stack elements
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 35,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#000",
  },
  headerImage: {
    width: 420,
    height: 220,
    alignSelf: "center", // Center the image
  },
  className: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#CB8D27",
    alignSelf: "flex-start", // 🔸 esto la alinea a la izquierda del header
    marginTop: 10,
    marginLeft: 20, // ajusta si quieres separarla del borde
},
  content: {
    flex: 1,
    padding: 10,
    zIndex: 1,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  taskIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  teacherName: {
    fontSize: 14,
    color: "#666",
  },
  taskDate: {
    fontSize: 14,
    color: "#666",
  },
  taskDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#E8E8E8",
    padding: 15,
    height:150,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "#666",
    alignItems: "center",
    marginTop:50,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#F4B266",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});