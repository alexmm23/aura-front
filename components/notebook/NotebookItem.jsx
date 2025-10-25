import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { AuraText } from '@/components/AuraText';
import { Ionicons } from '@expo/vector-icons';

// Colores pastel mejorados con mejor contraste
const pastelColors = [
  { bg: '#FFE5E5', accent: '#FF6B6B', icon: 'book' }, // Rosa
  { bg: '#E5F3FF', accent: '#4A90E2', icon: 'book-outline' }, // Azul
  { bg: '#E5FFE5', accent: '#51CF66', icon: 'journal' }, // Verde
  { bg: '#FFF5E5', accent: '#FFA94D', icon: 'reader' }, // Naranja
  { bg: '#F3E5FF', accent: '#B197FC', icon: 'library' }, // Morado
  { bg: '#FFFFE5', accent: '#FFD93D', icon: 'book' }, // Amarillo
  { bg: '#E5FFF3', accent: '#63E6BE', icon: 'newspaper' }, // Menta
  { bg: '#FFE5F3', accent: '#FF8FAB', icon: 'albums' }, // Rosa fuerte
  { bg: '#F3FFE5', accent: '#A9E34B', icon: 'journal-outline' }, // Lima
  { bg: '#E5E5FF', accent: '#9775FA', icon: 'library-outline' }, // Lavanda
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
  const colorScheme = useMemo(() => getColorFromId(notebook.id), [notebook.id]);

  return (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: colorScheme.bg }]}
      onPress={() => onPress(notebook)}
      onLongPress={() => onLongPress(notebook.id)}
      activeOpacity={0.7}
    >
      {/* Círculo decorativo superior */}
      <View style={[styles.topCircle, { backgroundColor: colorScheme.accent }]} />
      
      {/* Icono del cuaderno */}
      <View style={[styles.iconContainer, { backgroundColor: colorScheme.accent + '20' }]}>
        <Ionicons 
          name={colorScheme.icon} 
          size={32} 
          color={colorScheme.accent} 
        />
      </View>

      {/* Contenido */}
      <View style={styles.contentContainer}>
        <AuraText
          text={notebook.title}
          style={styles.noteTitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        />
        
        {/* Separador decorativo */}
        <View style={[styles.divider, { backgroundColor: colorScheme.accent + '30' }]} />
        
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <AuraText
            style={styles.noteDate}
            text={new Date(notebook.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          />
        </View>
      </View>

      {/* Efecto de esquina doblada */}
      <View style={[styles.cornerFold, { borderTopColor: colorScheme.accent + '40' }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteItem: {
    flex: 1,
    margin: 8,
    minHeight: 200,
    maxWidth: 160,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  topCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
  divider: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    marginVertical: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  cornerFold: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
