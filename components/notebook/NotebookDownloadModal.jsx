import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuraText } from "../AuraText";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system'; // ✅ Solo este import
import Toast from "react-native-toast-message";
import { apiGet } from "../../utils/fetchWithAuth";

export default function DownloadNotebookModal({ 
  visible, 
  onClose, 
  notebook 
}) {
  const [downloading, setDownloading] = useState(false);

  // ✅ Convertir Uint8Array a Base64
  const uint8ArrayToBase64 = (uint8Array) => {
    let binary = '';
    const len = uint8Array.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };

  // ✅ Convertir imagen URL a base64
  const convertImageToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error convirtiendo imagen:", error);
      throw error;
    }
  };

  // ✅ Generar ZIP con las imágenes
  const generateZIP = async (pages) => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const imagesFolder = zip.folder('imagenes');
      
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        
        if (page.contents && page.contents[0]?.data) {
          let imageData = page.contents[0].data;
          
          // Si es URL, descargar la imagen
          if (imageData.startsWith('http')) {
            try {
              console.log(`📥 Descargando imagen ${index + 1}...`);
              const base64Data = await convertImageToBase64(imageData);
              imageData = base64Data.split(',')[1];
            } catch (error) {
              console.warn(`⚠️ Error descargando imagen ${index + 1}:`, error);
              continue;
            }
          }
          
          // Extraer base64 si es data URL
          if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
          }
          
          // Agregar al ZIP
          imagesFolder.file(
            `pagina_${String(index + 1).padStart(3, '0')}.jpg`, 
            imageData, 
            { base64: true }
          );
        }
      }
      
      console.log(`✅ Generando ZIP con ${pages.length} imágenes...`);
      return await zip.generateAsync({ type: 'uint8array' });
    } catch (error) {
      console.error("Error generando ZIP:", error);
      throw new Error("Error al generar ZIP: " + error.message);
    }
  };

  // ✅ Descargar archivo en WEB
  const downloadFileWeb = (data, filename, mimeType) => {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("✅ Descarga web completada:", filename);
    } catch (error) {
      console.error("Error descargando en web:", error);
      throw new Error("Error al descargar el archivo");
    }
  };

  // ✅ Descargar archivo en MÓVIL (CORREGIDO)
  const downloadFileMobile = async (data, filename) => {
    try {
      console.log("📱 Preparando descarga en móvil...");
      
      // Verificar disponibilidad
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error("La función de compartir no está disponible");
      }
      
      // ✅ CORRECCIÓN: Usar FileSystem legacy (no File class)
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      console.log("📁 URI del archivo:", fileUri);
      
      // Convertir Uint8Array a base64
      let base64Data;
      if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
        const uint8Array = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        base64Data = uint8ArrayToBase64(uint8Array);
      } else if (typeof data === 'string' && data.includes(',')) {
        // Si ya es data URL, extraer solo la parte base64
        base64Data = data.split(',')[1];
      } else {
        base64Data = data;
      }
      
      console.log(`💾 Escribiendo archivo (${base64Data.length} chars base64)...`);
      
      // ✅ USAR LEGACY API (writeAsStringAsync en lugar de File.write)
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: 'base64',
      });
      
      // Verificar que el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log("📊 Info del archivo:", fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error("El archivo no se creó correctamente");
      }
      
      console.log("✅ Archivo creado exitosamente, compartiendo...");
      
      // Compartir archivo
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/zip',
        dialogTitle: `Compartir ${filename}`,
        UTI: 'public.zip-archive',
      });
      
      console.log("✅ Archivo compartido exitosamente");
      
    } catch (error) {
      console.error("❌ Error en móvil:", error);
      console.error("Stack trace:", error.stack);
      throw new Error("No se pudo guardar el archivo: " + error.message);
    }
  };

  // ✅ Descargar Imágenes como ZIP
  const downloadAsImages = async () => {
    console.log("📥 Descargando imágenes:", notebook.title);
    
    try {
      let pages = [];
      
      // Intentar obtener páginas de diferentes formas
      if (notebook.pages && Array.isArray(notebook.pages)) {
        console.log("✅ Usando páginas del objeto notebook");
        pages = notebook.pages;
      } else {
        console.log(`🌐 Consultando API: /notebook/${notebook.id}/pages`);
        const response = await apiGet(`/notebook/${notebook.id}/pages`);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log("📡 Respuesta del servidor:", responseData);
        
        pages = responseData?.data?.pages || responseData?.pages || [];
      }
      
      // Filtrar páginas que tengan contenido de imagen
      const pagesWithImages = pages.filter(page => 
        page.contents && 
        page.contents.length > 0 &&
        page.contents.some(content => content.type === 'image' && content.data)
      );

      if (pagesWithImages.length === 0) {
        throw new Error("El cuaderno no tiene páginas con imágenes para descargar");
      }

      console.log(`🖼️ Se encontraron ${pagesWithImages.length} páginas con imágenes (${pages.length} total)`);

      const filename = `${notebook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_imagenes_${Date.now()}.zip`;
      
      // Generar ZIP
      const zipBytes = await generateZIP(pagesWithImages);
      
      if (Platform.OS === 'web') {
        downloadFileWeb(zipBytes, filename, 'application/zip');
      } else {
        await downloadFileMobile(zipBytes, filename);
      }
    } catch (error) {
      console.error("❌ Error descargando imágenes:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!notebook) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se ha seleccionado ningún cuaderno",
      });
      return;
    }

    try {
      setDownloading(true);
      console.log(`📥 Iniciando descarga de imágenes...`);

      await downloadAsImages();

      Toast.show({
        type: "success",
        text1: "¡Descarga exitosa!",
        text2: `${notebook.title} descargado correctamente`,
      });

      onClose();
    } catch (error) {
      console.error("Error downloading:", error);
      Alert.alert(
        "❌ Error de Descarga",
        error.message || "No se pudo descargar el cuaderno",
        [{ text: "Cerrar" }]
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="download" size={24} color="#007bff" />
              <View style={styles.headerTextContainer}>
                <AuraText text="Descargar Cuaderno" style={styles.title} />
                {notebook && (
                  <AuraText 
                    text={notebook.title} 
                    style={styles.subtitle} 
                    numberOfLines={1}
                  />
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Información principal */}
            <View style={styles.section}>
              <View style={styles.downloadCard}>
                <View style={styles.iconContainer}>
                  <Ionicons name="images" size={48} color="#28a745" />
                </View>
                <AuraText
                  text="📦 Paquete de Imágenes"
                  style={styles.downloadTitle}
                />
                <AuraText
                  text="Se descargarán todas las páginas con imágenes de este cuaderno en formato ZIP"
                  style={styles.downloadDescription}
                />
              </View>
            </View>

            {/* Información adicional */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color="#007bff" />
                <View style={styles.infoTextContainer}>
                  <AuraText 
                    text={Platform.OS === 'web' 
                      ? "• El archivo ZIP se guardará en tu carpeta de Descargas"
                      : "• Podrás abrir o compartir el archivo ZIP con otras aplicaciones"
                    } 
                    style={styles.infoText} 
                  />
                  <AuraText 
                    text="• Las páginas sin imágenes se omitirán automáticamente" 
                    style={styles.infoText} 
                  />
                  <AuraText 
                    text="• Las imágenes estarán en formato JPG dentro del ZIP" 
                    style={styles.infoText} 
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={downloading}
              activeOpacity={0.8}
            >
              <AuraText text="Cancelar" style={styles.cancelButtonText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.downloadButton,
                downloading && styles.buttonDisabled,
              ]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading ? (
                <View style={styles.downloadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <AuraText text="Descargando..." style={styles.downloadButtonText} />
                </View>
              ) : (
                <View style={styles.downloadingContainer}>
                  <Ionicons name="download" size={20} color="#fff" />
                  <AuraText text="Descargar ZIP" style={styles.downloadButtonText} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Platform.OS === 'web' ? "85%" : "90%",
    minHeight: Platform.OS === 'web' ? "auto" : "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  section: {
    padding: 20,
  },
  downloadCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#28a745",
    borderStyle: "dashed",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#28a74515",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  downloadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  downloadDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#e7f3ff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  infoTextContainer: {
    flex: 1,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#0056b3",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 12,
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: "#28a745",
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  downloadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});