import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuraText } from '@/components/AuraText';

export const NotebookHeader = ({ 
  title = 'Mis Cuadernos',
  onCreatePress, 
  onNewNotePress,
  isLargeScreen = false
}) => {
  return (
    <View style={[styles.header, isLargeScreen && styles.headerLarge]}>
      <AuraText 
        text={title} 
        style={[styles.title, isLargeScreen && styles.titleLarge]} 
      />
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.createNotebookButton}
          onPress={onCreatePress}
        >
          <Ionicons name="add-circle" size={isLargeScreen ? 20 : 16} color="#fff" />
          <AuraText
            text={isLargeScreen ? 'Crear Cuaderno' : 'Crear'}
            style={styles.createButtonText}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newNoteButton}
          onPress={onNewNotePress}
        >
          <AuraText
            text={isLargeScreen ? '+ Nueva Nota' : '+ Nota'}
            style={styles.newNoteText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 48,
    marginLeft: 24,
    marginRight: 24,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLarge: {
    marginTop: 24,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#CB8D27',
  },
  titleLarge: {
    fontSize: 48,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  createNotebookButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#28a745',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  newNoteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  newNoteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
