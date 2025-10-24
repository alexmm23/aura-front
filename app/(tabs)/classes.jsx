import { View, ScrollView, useWindowDimensions } from "react-native";
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

export default function HomeTeacher() {
  const { classes, loading } = useClasses();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const router = useRouter();

  const handleConnectGoogleClassroom = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <>
      <Head>
        <title>Mis Clases - AURA | Plataforma Educativa</title>
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
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Header con SVG */}
            {isLandscape ? <LandscapeHeader /> : <PortraitHeader />}

            {/* Título responsive */}
            <View style={styles.contentWrapper}>
              <View style={styles.headerTitle}>
                <AuraText
                  text={"Mis Clases"}
                  style={isLandscape ? styles.titleLandscape : styles.title}
                />
              </View>
            </View>

            {/* Contenido */}
            <View style={styles.contentContainer}>
              {loading ? (
                <LoadingState />
              ) : classes.length === 0 ? (
                <EmptyState onConnect={handleConnectGoogleClassroom} />
              ) : (
                <View style={styles.classesGrid}>
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
