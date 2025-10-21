import React from 'react';
import NotebookSelectorModal from '@/components/NotebookSelectorModal';
import AIOptionsModal from '@/components/AIOptionsModal';
import AIResultsModal from '@/components/AIResultsModal';

export const NotebookAIModals = ({
  showNotebookSelector,
  showAIModal,
  showResultsModal,
  notebooks,
  selectedNotebookForAI,
  aiResults,
  aiResultType,
  onNotebookSelectorClose,
  onNotebookSelect,
  onAIModalClose,
  onResultsModalClose,
}) => {
  return (
    <>
      {/* Modal de Selección de Cuaderno */}
      <NotebookSelectorModal
        visible={showNotebookSelector}
        onClose={onNotebookSelectorClose}
        notebooks={notebooks}
        onSelectNotebook={onNotebookSelect}
      />

      {/* Modal de IA */}
      <AIOptionsModal
        visible={showAIModal}
        onClose={onAIModalClose}
        notebookId={selectedNotebookForAI}
      />

      {/* Modal de Resultados de IA */}
      <AIResultsModal
        visible={showResultsModal}
        onClose={onResultsModalClose}
        results={aiResults}
        type={aiResultType}
      />
    </>
  );
};
