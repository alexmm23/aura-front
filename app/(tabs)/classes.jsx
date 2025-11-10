import { View, ScrollView, useWindowDimensions, Platform } from "react-native";
import React from "react";
import { AuraText } from "@/components/AuraText";
import Head from "expo-router/head";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useClasses } from "@/hooks/useClasses";
import { ClassCard } from "@/components/classes/ClassCard";
import { LandscapeHeader } from "@/components/classes/LandscapeHeader";
import { PortraitHeader } from "@/components/classes/PortraitHeader";
import { EmptyState } from "@/components/classes/EmptyState";
import { LoadingState } from "@/components/classes/LoadingState";
import { styles } from "@/components/classes/styles";
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from "react-native";

export default function HomeTeacher() {
  const { classes, loading } = useClasses();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const handleConnectGoogleClassroom = () => {
    router.push("/(tabs)/profile");
  };

  // Calcular el ancho máximo de las cards - ahora ocupará todo el ancho con padding
  const maxContentWidth = '100%';

  return (
    <>
      <Head>
        <title>Clases | AURA - Plataforma Educativa</title>
        <meta
          name="description"
          content="Visualiza y gestiona todas tus clases de Google Classroom y Microsoft Teams en un solo lugar. Accede fácilmente a tus cursos académicos."
        />
        <meta
          name="keywords"
          content="clases, cursos, educación, Google Classroom, Microsoft Teams, AURA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "bottom"]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* SVG de fondo en todas las plataformas */}
            {isLandscape ? <LandscapeHeader /> : <PortraitHeader />}

            {/* Header con recuadro en todas las plataformas */}
            <View style={headerStyles.headerContainer}>
              <View style={headerStyles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <Ionicons name="school" size={48} color="#CB8D27" />
                  <AuraText
                    text="Mis Clases"
                    style={headerStyles.title}
                  />
                </View>
              </View>
            </View>

            {/* Contenido */}
            <View style={styles.contentContainer}>
              {loading ? (
                <LoadingState />
              ) : classes.length === 0 ? (
                <EmptyState onConnect={handleConnectGoogleClassroom} />
              ) : (
                <View style={[styles.classesGrid, {
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }]}>
                  {classes.map((classItem) => (
                    <ClassCard
                      key={classItem.id}
                      classItem={classItem}
                      width={width}
                    />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const headerStyles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#CB8D27',
  },
});