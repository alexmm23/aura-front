import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API } from '@/config/api';
import { apiPost, apiGet } from '@/utils/fetchWithAuth';

export const useNotebooks = () => {
  const [notes, setNotes] = useState([]);
  const [noteBooks, setNoteBooks] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState('');
  const [lastPngDataUrl, setLastPngDataUrl] = useState(null);

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      const response = await fetchNotes();
      console.log('Fetched notes:', response);
      setNoteBooks(response);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchNotes = async () => {
    const response = await apiGet(API.ENDPOINTS.STUDENT.NOTEBOOKS);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    return await response.json();
  };

  const loadNotes = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const notebookKeys = keys.filter((key) => key.startsWith('notebook_'));
      const notesData = await AsyncStorage.multiGet(notebookKeys);

      const parsedNotes = notesData.map(([key, value]) => ({
        id: key,
        timestamp: parseInt(key.replace('notebook_', '')),
        data: value,
      }));

      setNotes(parsedNotes.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNotebook = async () => {
    if (!notebookTitle.trim()) {
      console.log('Error: Título vacío');
      try {
        Alert.alert('Error', 'Por favor ingresa un título para el cuaderno');
      } catch (e) {
        console.error('Alert no disponible, usando console:', e);
        alert('Error: Por favor ingresa un título para el cuaderno');
      }
      return;
    }

    try {
      console.log('Creando cuaderno con título:', notebookTitle.trim());

      const response = await apiPost(API.ENDPOINTS.STUDENT.NOTEBOOK_CREATE, {
        title: notebookTitle.trim(),
      });

      const responseData = await response.json();

      console.log('Response status:', response.status);

      if (!response.ok) {
        console.log('Error del servidor:', responseData);
        setShowCreateDialog(false);
        if (response.status === 409) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Ya existe un cuaderno con ese título',
          });
          return;
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: responseData.error || 'Error al crear el cuaderno',
        });
        return;
      }

      console.log('Nuevo cuaderno creado:', responseData);

      // Actualizar la lista de cuadernos
      setNoteBooks((prev) => [responseData, ...prev]);

      // Limpiar el formulario y cerrar el diálogo
      setNotebookTitle('');
      setShowCreateDialog(false);

      try {
        Alert.alert('Éxito', 'Cuaderno creado exitosamente');
      } catch (e) {
        console.error('Alert no disponible, usando console:', e);
        alert('Éxito: Cuaderno creado exitosamente');
      }
    } catch (error) {
      console.error('Error creating notebook:', error);

      try {
        Alert.alert('Error', 'No se pudo crear el cuaderno');
      } catch (e) {
        console.error('Alert no disponible, usando console:', e);
        alert('Error: No se pudo crear el cuaderno');
      }
    }
  };

  const handleCancelCreate = () => {
    console.log('Cerrando modal');
    setNotebookTitle('');
    setShowCreateDialog(false);
  };

  const handleNoteSaved = (dataUrl) => {
    loadNotes();
    setShowCanvas(false);
    setLastPngDataUrl(dataUrl);
  };

  return {
    notes,
    noteBooks,
    showCanvas,
    setShowCanvas,
    showCreateDialog,
    setShowCreateDialog,
    notebookTitle,
    setNotebookTitle,
    lastPngDataUrl,
    setLastPngDataUrl,
    loadNotebooks,
    handleCreateNotebook,
    handleCancelCreate,
    handleNoteSaved,
  };
};
