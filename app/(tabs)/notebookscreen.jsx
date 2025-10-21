import React from "react";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import NotebookCanvas from "@/components/notebook/NotebookCanvas";
import {
  NotebookListView,
  CreateNotebookModal,
  NotebookAIModals,
} from "@/components/notebook";
import { useNotebooks, useNotebookAI } from "@/hooks";

const NotebookScreen = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 928;
  const router = useRouter();

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

  const handleNotebookPress = (notebook) => {
    router.push({
      pathname: "/(tabs)/notebookpages",
      params: { notebookId: notebook.id },
    });
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
        onAIOptionPress={() => handleAIOptionPress(noteBooks)}
        lastPngDataUrl={lastPngDataUrl}
      />

      <CreateNotebookModal
        visible={showCreateDialog}
        title={notebookTitle}
        onTitleChange={setNotebookTitle}
        onCreate={handleCreateNotebook}
        onCancel={handleCancelCreate}
      />

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

      <Toast />
    </>
  );
};

export default NotebookScreen;
