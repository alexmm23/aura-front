import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function Terms() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Términos y Condiciones</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
        <Text style={styles.text}>
          Al acceder y utilizar la aplicación AURA, usted acepta estar sujeto a
          estos términos y condiciones de uso.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso de la Aplicación</Text>
        <Text style={styles.text}>
          Esta aplicación está destinada para uso educativo. Los usuarios deben
          utilizar la aplicación de manera responsable y conforme a las leyes
          aplicables.
        </Text>

        <Text style={styles.sectionTitle}>3. Privacidad</Text>
        <Text style={styles.text}>
          Su privacidad es importante para nosotros. Consulte nuestra Política
          de Privacidad para obtener información sobre cómo recopilamos y
          utilizamos su información.
        </Text>

        <Text style={styles.sectionTitle}>
          4. Limitación de Responsabilidad
        </Text>
        <Text style={styles.text}>
          La aplicación se proporciona "tal como está" sin garantías de ningún
          tipo. No seremos responsables de ningún daño directo, indirecto,
          incidental o consecuente.
        </Text>

        <Text style={styles.sectionTitle}>5. Modificaciones</Text>
        <Text style={styles.text}>
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Los cambios entrarán en vigor inmediatamente después de su
          publicación.
        </Text>

        <Text style={styles.sectionTitle}>6. Contacto</Text>
        <Text style={styles.text}>
          Si tiene preguntas sobre estos términos, puede contactarnos a través
          de la aplicación.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.textSecondary,
    marginBottom: 15,
  },
});
