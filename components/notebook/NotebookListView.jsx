import React from 'react';
import { View, Image, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NotebookItem } from './NotebookItem';
import { NotebookHeader } from './NotebookHeader';
import FloatingAIMenu from '@/components/FloatingAIMenu';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const NotebookListView = ({
  notebooks,
  isLargeScreen,
  onNotebookPress,
  onNotebookLongPress,
  onCreatePress,
  onNewNotePress,
  onSharePress,
  onAIOptionPress,
  lastPngDataUrl,
}) => {
  const handleShare = async () => {
    try {
      const dataUrl = lastPngDataUrl;
      if (!dataUrl) {
        alert('No hay notas para compartir.');
        return;
      }

      const filename = `nota-${Date.now()}.png`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      await FileSystem.writeAsStringAsync(path, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir nota',
        });
      } else {
        alert('La función de compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir nota: ' + error.message);
    }
  };

  const containerStyle = isLargeScreen 
    ? styles.landscapeContainer 
    : styles.container;

  const contentWrapperStyle = isLargeScreen 
    ? styles.contentWrapper 
    : null;

  return (
    <View style={containerStyle}>
      <Image
        source={require('@/assets/images/fondonotas.png')}
        style={isLargeScreen ? styles.landscapeImage : styles.backgroundImage}
        resizeMode="contain"
        pointerEvents="none"
      />

      <View style={contentWrapperStyle}>
        <NotebookHeader
          onCreatePress={onCreatePress}
          onNewNotePress={onNewNotePress}
          isLargeScreen={isLargeScreen}
        />

        <FlatList
          data={notebooks}
          renderItem={({ item }) => (
            <NotebookItem
              notebook={item}
              onPress={onNotebookPress}
              onLongPress={onNotebookLongPress}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          style={styles.floatingHelpButton} 
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>⇪</Text>
        </TouchableOpacity>

        <FloatingAIMenu onAIOptionPress={onAIOptionPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E2D2',
    position: 'relative',
  },
  landscapeContainer: {
    flex: 1,
    backgroundColor: '#E6E2D2',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    transform: [{ rotate: '-45deg' }, { scale: 1.5 }],
  },
  landscapeImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '90%',
    height: '100%',
    marginLeft: '5%',
    zIndex: 0,
  },
  contentWrapper: {
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
    flex: 1,
  },
  notesList: {
    padding: 16,
  },
  floatingHelpButton: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
});
