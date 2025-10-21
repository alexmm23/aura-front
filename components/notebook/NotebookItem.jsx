import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { AuraText } from '@/components/AuraText';

export const NotebookItem = ({ 
  notebook, 
  onPress, 
  onLongPress 
}) => {
  return (
    <TouchableOpacity
      style={styles.noteItem}
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noteDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
});
