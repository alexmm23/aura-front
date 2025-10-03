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

export default function Privacy() {
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
        <Text style={styles.title}>Política de Privacidad</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
        <Text style={styles.text}>
          Recopilamos información que usted nos proporciona directamente, como
          cuando crea una cuenta, actualiza su perfil o se comunica con
          nosotros.
        </Text>

        <Text style={styles.sectionTitle}>
          2. Cómo Utilizamos su Información
        </Text>
        <Text style={styles.text}>
          Utilizamos la información recopilada para:
          {"\n"}• Proporcionar y mantener nuestros servicios
          {"\n"}• Mejorar y personalizar su experiencia
          {"\n"}• Comunicarnos con usted
          {"\n"}• Proteger la seguridad de nuestros servicios
        </Text>

        <Text style={styles.sectionTitle}>3. Compartir Información</Text>
        <Text style={styles.text}>
          No vendemos, comercializamos ni transferimos su información personal a
          terceros sin su consentimiento, excepto en las circunstancias
          descritas en esta política.
        </Text>

        <Text style={styles.sectionTitle}>4. Seguridad de los Datos</Text>
        <Text style={styles.text}>
          Implementamos medidas de seguridad técnicas y organizativas apropiadas
          para proteger su información personal contra el acceso no autorizado,
          la alteración, la divulgación o la destrucción.
        </Text>

        <Text style={styles.sectionTitle}>5. Sus Derechos</Text>
        <Text style={styles.text}>
          Usted tiene derecho a:
          {"\n"}• Acceder a su información personal
          {"\n"}• Corregir información inexacta
          {"\n"}• Solicitar la eliminación de su información
          {"\n"}• Objetar el procesamiento de su información
        </Text>

        <Text style={styles.sectionTitle}>6. Cambios a esta Política</Text>
        <Text style={styles.text}>
          Podemos actualizar esta política de privacidad de vez en cuando. Le
          notificaremos cualquier cambio publicando la nueva política en esta
          página.
        </Text>

        <Text style={styles.sectionTitle}>7. Contacto</Text>
        <Text style={styles.text}>
          Si tiene preguntas sobre esta política de privacidad, puede
          contactarnos a través de la aplicación.
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
