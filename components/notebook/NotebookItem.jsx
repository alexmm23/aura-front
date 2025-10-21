import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { AuraText } from '@/components/AuraText';

// Colores pastel para los cuadernos
const pastelColors = [
  '#FFE5E5', // Rosa pastel
  '#E5F3FF', // Azul pastel
  '#E5FFE5', // Verde pastel
  '#FFF5E5', // Naranja pastel
  '#F3E5FF', // Morado pastel
  '#FFFFE5', // Amarillo pastel
  '#E5FFF3', // Menta pastel
  '#FFE5F3', // Rosa fuerte pastel
  '#F3FFE5', // Lima pastel
  '#E5E5FF', // Lavanda pastel
];

// Función para generar un color basado en el ID del cuaderno
const getColorFromId = (id) => {
  const strId = String(id);
  const hash = strId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return pastelColors[Math.abs(hash) % pastelColors.length];
};

export const NotebookItem = ({ 
  notebook, 
  onPress, 
  onLongPress 
}) => {
  // Memorizar el color para que no cambie en cada render
  const backgroundColor = useMemo(() => getColorFromId(notebook.id), [notebook.id]);

  return (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor }]}
      onPress={() => onPress(notebook)}
      onLongPress={() => onLongPress(notebook.id)}
    >
      <AuraText
        text={notebook.title}
        style={styles.noteTitle}
      />
      <AuraText
        style={styles.noteDate}
        text={new Date(notebook.created_at).toLocaleDateString()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteItem: {
    flex: 1,
    margin: 8,
    minHeight: 180,
    maxWidth: 160,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  noteDate: {
    marginTop: 'auto',
    fontSize: 11,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    opacity: 0.7,
  },
});
