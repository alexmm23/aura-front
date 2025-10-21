import { useState } from 'react';
import { Alert } from 'react-native';

export const useNotebookAI = () => {
  const [showNotebookSelector, setShowNotebookSelector] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiResultType, setAiResultType] = useState(null);
  const [selectedNotebookForAI, setSelectedNotebookForAI] = useState(null);

  const handleAIOptionPress = (noteBooks) => {
    console.log('Opción de IA seleccionada');

    // Verificar que hay cuadernos disponibles
    if (noteBooks.length === 0) {
      Alert.alert(
        'Sin cuadernos',
        'Debes crear un cuaderno primero antes de usar las funciones de IA'
      );
      return;
    }

    // Mostrar el selector de cuadernos
    setShowNotebookSelector(true);
  };

  const handleNotebookSelect = (notebookId) => {
    console.log('Cuaderno seleccionado:', notebookId);
    setSelectedNotebookForAI(notebookId);
    setShowNotebookSelector(false);
    // Abrir el modal de opciones de IA con el cuaderno seleccionado
    setTimeout(() => {
      setShowAIModal(true);
    }, 300);
  };

  const handleNotebookSelectorClose = () => {
    setShowNotebookSelector(false);
  };

  const handleAIModalClose = (result) => {
    console.log('Modal de IA cerrado con resultado:', result);
    setShowAIModal(false);
    setSelectedNotebookForAI(null);

    // Si hay resultado, mostrarlo en el modal de resultados
    if (result) {
      console.log('Resultados de IA:', result);
      setAiResults(result);
      console.log('Resultados de IA seteados:', result.data.results[0]);
      // Determinar el tipo de resultado
      if (result.data.results[0].texto_extraido) {
        setAiResultType('ocr');
      } else if (result.data.results[0].preguntas) {
        setAiResultType('study');
      }

      setShowResultsModal(true);
    }
  };

  const handleResultsModalClose = () => {
    setShowResultsModal(false);
    setAiResults(null);
    setAiResultType(null);
  };

  const handleNotebookLongPress = (notebookId) => {
    setSelectedNotebookForAI(notebookId);
    setShowAIModal(true);
  };

  return {
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
  };
};
