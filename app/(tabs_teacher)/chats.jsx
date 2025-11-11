import React from "react";
import { View, ScrollView, useWindowDimensions, Platform, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import Head from "expo-router/head";
import { AuraText } from "@/components/AuraText";
import ChatScreen from "@/components/chat/ChatScreen";
import { LandscapeHeader } from "@/components/classes/LandscapeHeader";
import { PortraitHeader } from "@/components/classes/PortraitHeader";
import { styles as classesStyles } from "@/components/classes/styles";

export default function Chats() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <>
      <Head>
        <title>Chats | AURA - Plataforma Educativa</title>
        <meta
          name="description"
          content="Chatea con tus estudiantes en tiempo real. Comunicación directa y efectiva dentro de AURA."
        />
        <meta
          name="keywords"
          content="chat, mensajería, comunicación, profesores, estudiantes, AURA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView 
          style={classesStyles.container} 
          edges={Platform.OS === 'web' ? [] : ["right", "left", "bottom"]}
        >
          {/* ChatScreen controla todo el contenido */}
          <ChatScreen
            userRole="teacher"
            modalUserType="teacher"
            modalTitle="Seleccionar Estudiante"
            screenTitle=""
            hideTitle={true}
            showCustomHeader={true}
            customHeader={
              <>
                {isLandscape ? <LandscapeHeader /> : <PortraitHeader />}
                <View style={headerStyles.headerContainer}>
                  <View style={headerStyles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <Ionicons name="chatbubbles" size={48} color="#CB8D27" />
                      <AuraText
                        text="Mis Chats"
                        style={headerStyles.title}
                      />
                    </View>
                  </View>
                </View>
              </>
            }
          />
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
