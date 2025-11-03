import React, { useEffect, useState } from "react";
import { useWindowDimensions, Alert, TouchableOpacity, Text, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import NotebookCanvas from "@/components/notebook/NotebookCanvas";
import {
  NotebookListView,
  CreateNotebookModal,
  NotebookAIModals,
} from "@/components/notebook";
import NotebookDownloadModal from "@/components/notebook/NotebookDownloadModal";
import { useNotebooks, useNotebookAI } from "@/hooks";
import { API } from "@/config/api";
import { apiGet } from "@/utils/fetchWithAuth";

const NotebookScreen = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 928;
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  // Estado para verificar suscripción
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Estado para el modal de descarga
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedNotebookForDownload, setSelectedNotebookForDownload] = useState(null);

  // Custom hooks para separar la lógica
  const {
    noteBooks,
    showCanvas,
    setShowCanvas,
    showCreateDialog,
    setShowCreateDialog,
    notebookTitle,
    setNotebookTitle,
    lastPngDataUrl,
    handleCreateNotebook,
    handleCancelCreate,
    handleNoteSaved,
  } = useNotebooks();

  const {
    showNotebookSelector,
    showAIModal,
    showResultsModal,
    aiResults,
    aiResultType,
    selectedNotebookForAI,
    handleAIOptionPress,
    handleNotebookSelect,
    handleNotebookSelectorClose,
    handleAIModalClose,
    handleResultsModalClose,
    handleNotebookLongPress,
  } = useNotebookAI();

  // Verificar estado de suscripción cada vez que la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      checkSubscriptionStatus();
    }, [])
  );

  const checkSubscriptionStatus = async () => {
    try {
      setCheckingSubscription(true);
      console.log('🔍 Verificando estado de suscripción en NotebookScreen...');
      
      const response = await apiGet(API.ENDPOINTS.PAYMENT.SUBSCRIPTION_STATUS);
      
      if (response.status === 401) {
        console.log('❌ Sesión expirada');
        setHasActiveSubscription(false);
        setCheckingSubscription(false);
        return;
      }

      const data = await response.json();
      console.log('📊 Estado de suscripción:', data);
      
      if (data.success && data.hasActiveSubscription) {
        setHasActiveSubscription(true);
        console.log('✅ Usuario con suscripción activa - Funciones IA habilitadas');
      } else {
        setHasActiveSubscription(false);
        console.log('❌ Usuario sin suscripción - Funciones IA deshabilitadas');
      }
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleAIOptionPressWithCheck = (notebooks) => {
    if (!hasActiveSubscription) {
      Alert.alert(
        '🔒 Suscripción Requerida',
        'Las funciones de IA están disponibles solo para usuarios con suscripción activa.\n\n¿Deseas suscribirte ahora?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Ver Planes',
            onPress: () => router.push('/(tabs)/profile/payment')
          }
        ]
      );
      return;
    }

    // Si tiene suscripción, proceder normalmente
    handleAIOptionPress(notebooks);
  };

  const handleNotebookPress = (notebook) => {
    router.push({
      pathname: "/(tabs)/notebookpages",
      params: { notebookId: notebook.id },
    });
  };

  // Nueva función para manejar la descarga (solo en web)
  const handleDownloadPress = (notebook) => {
    console.log('📥 Seleccionado para descarga:', notebook);
    setSelectedNotebookForDownload(notebook);
    setShowDownloadModal(true);
  };

  const handleDownloadModalClose = () => {
    setShowDownloadModal(false);
    setSelectedNotebookForDownload(null);
  };

  if (showCanvas) {
    return (
      <NotebookCanvas
        onSave={handleNoteSaved}
        onBack={() => setShowCanvas(false)}
      />
    );
  }

  return (
    <>
      <NotebookListView
        notebooks={noteBooks}
        isLargeScreen={isLargeScreen}
        onNotebookPress={handleNotebookPress}
        onNotebookLongPress={handleNotebookLongPress}
        onCreatePress={() => setShowCreateDialog(true)}
        onNewNotePress={() => setShowCanvas(true)}
        onAIOptionPress={hasActiveSubscription ? () => handleAIOptionPressWithCheck(noteBooks) : undefined}
        onDownloadPress={isWeb ? handleDownloadPress : undefined} // ✅ Solo pasar si es web
        lastPngDataUrl={lastPngDataUrl}
        hasActiveSubscription={hasActiveSubscription}
        checkingSubscription={checkingSubscription}
        isWeb={isWeb} // ✅ Pasar la prop isWeb
      />

      <CreateNotebookModal
        visible={showCreateDialog}
        title={notebookTitle}
        onTitleChange={setNotebookTitle}
        onCreate={handleCreateNotebook}
        onCancel={handleCancelCreate}
      />

      {/* Modal de descarga - solo en web */}
      {isWeb && (
        <NotebookDownloadModal
          visible={showDownloadModal}
          onClose={handleDownloadModalClose}
          notebook={selectedNotebookForDownload}
        />
      )}

      {/* Solo mostrar modales de IA si tiene suscripción activa */}
      {hasActiveSubscription && (
        <NotebookAIModals
          showNotebookSelector={showNotebookSelector}
          showAIModal={showAIModal}
          showResultsModal={showResultsModal}
          notebooks={noteBooks}
          selectedNotebookForAI={selectedNotebookForAI}
          aiResults={aiResults}
          aiResultType={aiResultType}
          onNotebookSelectorClose={handleNotebookSelectorClose}
          onNotebookSelect={handleNotebookSelect}
          onAIModalClose={handleAIModalClose}
          onResultsModalClose={handleResultsModalClose}
        />
      )}

      <Toast />
    </>
  );
};

export default NotebookScreen;