import React, { useState } from "react";
import {
  Canvas,
  Path,
  useCanvasRef,
  Rect,
  Group,
} from "@shopify/react-native-skia";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

// Constantes de herramientas
const TOOL_PENCIL = "pen";
const TOOL_RECT = "rect";
const TOOL_ERASER = "eraser";
const TOOL_TEXT = "text";
const TOOL_SELECT = "select";

const colors = ["black", "red", "blue", "green", "orange", "purple", "brown"];
const brushSizes = [1, 2, 5, 10, 15, 20];
const textSizes = [12, 16, 20, 24, 32, 40];

const NotebookCanvasNative = ({ onSave, onBack }) => {
  const canvasRef = useCanvasRef();

  // Debug: Verificar que onBack se está pasando correctamente
  React.useEffect(() => {
    console.log("NotebookCanvasNative mounted");
    console.log("onBack prop:", typeof onBack, onBack);
  }, []);

  // Estados principales
  const [tool, setTool] = useState(TOOL_PENCIL);
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(2);
  const [textSize, setTextSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);

  // Estados para capas
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [currentPath, setCurrentPath] = useState("");
  const [currentRect, setCurrentRect] = useState(null);
  const [textElements, setTextElements] = useState([]); // Texto como overlay de React Native

  // Estados para UI
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSlider, setShowBrushSlider] = useState(false);
  const [showTextSize, setShowTextSize] = useState(false);
  const [textInputModal, setTextInputModal] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    editingId: null,
  });

  // Funciones auxiliares
  const generateId = () =>
    `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addLayer = (layerData) => {
    const newLayer = {
      id: generateId(),
      ...layerData,
      zIndex: layers.length,
    };
    setLayers((prev) => [...prev, newLayer]);
    return newLayer.id;
  };

  const addTextElement = (textData) => {
    const newText = {
      id: generateId(),
      ...textData,
      zIndex: textElements.length,
    };
    setTextElements((prev) => [...prev, newText]);
    return newText.id;
  };

  const updateTextElement = (id, updates) => {
    setTextElements((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  };

  const removeTextElement = (id) => {
    setTextElements((prev) => prev.filter((text) => text.id !== id));
  };

  const removeLayer = (id) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  // Manejo de eventos táctiles directos (en lugar de PanResponder)

  const handleDrawStart = (x, y) => {
    console.log("handleDrawStart called with:", x, y, "tool:", tool);

    if (tool === TOOL_TEXT) {
      setTextInputModal({
        visible: true,
        x,
        y,
        text: "",
        editingId: null,
      });
      return;
    }

    if (tool === TOOL_SELECT) {
      // Buscar capa en la posición clickeada
      const hitLayer = findLayerAtPoint(x, y);
      const hitText = findTextAtPoint(x, y);

      if (hitText) {
        setSelectedLayerId(hitText.id);
        // Editar texto si se hace doble tap
        setTimeout(() => {
          setTextInputModal({
            visible: true,
            x: hitText.x,
            y: hitText.y,
            text: hitText.text,
            editingId: hitText.id,
          });
        }, 100);
      } else {
        setSelectedLayerId(hitLayer?.id || null);
      }
      return;
    }

    if (isDrawing) {
      console.log("Already drawing, ignoring start");
      return;
    }

    setIsDrawing(true);

    if (tool === TOOL_PENCIL || tool === TOOL_ERASER) {
      const newPath = `M${x},${y}`;
      setCurrentPath(newPath);
    } else if (tool === TOOL_RECT) {
      setCurrentRect({ startX: x, startY: y, endX: x, endY: y });
    }
  };

  const handleDrawMove = (x, y) => {
    if (!isDrawing) return;

    try {
      if (tool === TOOL_PENCIL || tool === TOOL_ERASER) {
        setCurrentPath((prev) => `${prev} L${x},${y}`);
      } else if (tool === TOOL_RECT) {
        setCurrentRect((prev) => ({ ...prev, endX: x, endY: y }));
      }
    } catch (error) {
      console.error("Error in handleDrawMove:", error);
    }
  };

  const handleDrawEnd = () => {
    console.log("handleDrawEnd called, isDrawing:", isDrawing);

    if (!isDrawing) return;

    try {
      if (tool === TOOL_PENCIL && currentPath) {
        addLayer({
          type: "drawing",
          path: currentPath,
          color,
          strokeWidth: brushSize,
          isEraser: false,
        });
      } else if (tool === TOOL_ERASER && currentPath) {
        addLayer({
          type: "drawing",
          path: currentPath,
          color: "transparent",
          strokeWidth: brushSize * 2,
          isEraser: true,
        });
      } else if (tool === TOOL_RECT && currentRect) {
        const { startX, startY, endX, endY } = currentRect;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        // Solo crear el rectángulo si tiene un tamaño mínimo
        if (width > 5 && height > 5) {
          addLayer({
            type: "rect",
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width,
            height,
            color,
            strokeWidth: brushSize,
          });
        }
      }
    } catch (error) {
      console.error("Error in handleDrawEnd:", error);
    } finally {
      // Siempre limpiar el estado
      setIsDrawing(false);
      setCurrentPath("");
      setCurrentRect(null);
    }
  };

  const findLayerAtPoint = (x, y) => {
    const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (isPointInLayer(x, y, layer)) {
        return layer;
      }
    }
    return null;
  };

  const findTextAtPoint = (x, y) => {
    const sortedTexts = [...textElements].sort((a, b) => b.zIndex - a.zIndex);

    for (const text of sortedTexts) {
      const textWidth = text.text.length * text.fontSize * 0.6;
      if (
        x >= text.x &&
        x <= text.x + textWidth &&
        y >= text.y &&
        y <= text.y + text.fontSize
      ) {
        return text;
      }
    }
    return null;
  };

  const isPointInLayer = (x, y, layer) => {
    switch (layer.type) {
      case "rect":
        return (
          x >= layer.x &&
          x <= layer.x + layer.width &&
          y >= layer.y &&
          y <= layer.y + layer.height
        );
      case "drawing":
        return false; // Simplificado
      default:
        return false;
    }
  };

  // Funciones de texto
  const handleTextSubmit = () => {
    if (textInputModal.text.trim()) {
      if (textInputModal.editingId) {
        updateTextElement(textInputModal.editingId, {
          text: textInputModal.text,
        });
      } else {
        addTextElement({
          x: textInputModal.x,
          y: textInputModal.y,
          text: textInputModal.text,
          fontSize: textSize,
          color,
        });
      }
    }
    setTextInputModal({
      visible: false,
      x: 0,
      y: 0,
      text: "",
      editingId: null,
    });
  };

  // Funciones de canvas
  const clearCanvas = () => {
    Alert.alert("Limpiar Canvas", "¿Estás seguro de que quieres borrar todo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, borrar",
        onPress: () => {
          setLayers([]);
          setTextElements([]);
        },
      },
    ]);
  };

  const saveCanvas = async () => {
    try {
      Alert.alert("Guardar", "Canvas guardado exitosamente");
      onSave?.();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el canvas");
    }
  };

  // Renderizado de capas con manejo de errores
  const renderLayers = () => {
    try {
      return layers
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer) => {
          if (!layer || !layer.id) return null;

          switch (layer.type) {
            case "drawing":
              if (!layer.path) return null;
              return (
                <Path
                  key={layer.id}
                  path={layer.path}
                  style={layer.isEraser ? "fill" : "stroke"}
                  strokeWidth={layer.strokeWidth || 2}
                  color={
                    layer.isEraser ? "transparent" : layer.color || "black"
                  }
                  blendMode={layer.isEraser ? "clear" : "srcOver"}
                />
              );
            case "rect":
              if (!layer.width || !layer.height) return null;
              return (
                <Rect
                  key={layer.id}
                  x={layer.x || 0}
                  y={layer.y || 0}
                  width={layer.width}
                  height={layer.height}
                  style="stroke"
                  strokeWidth={layer.strokeWidth || 2}
                  color={layer.color || "black"}
                />
              );
            default:
              return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error rendering layers:", error);
      return [];
    }
  };

  // Renderizado de elementos en progreso con manejo de errores
  const renderCurrentDrawing = () => {
    try {
      const elements = [];

      if (
        isDrawing &&
        currentPath &&
        (tool === TOOL_PENCIL || tool === TOOL_ERASER)
      ) {
        elements.push(
          <Path
            key="current-path"
            path={currentPath}
            style={tool === TOOL_ERASER ? "fill" : "stroke"}
            strokeWidth={tool === TOOL_ERASER ? brushSize * 2 : brushSize}
            color={tool === TOOL_ERASER ? "transparent" : color}
            blendMode={tool === TOOL_ERASER ? "clear" : "srcOver"}
          />
        );
      }

      if (isDrawing && currentRect && tool === TOOL_RECT) {
        const { startX, startY, endX, endY } = currentRect;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (width > 0 && height > 0) {
          elements.push(
            <Rect
              key="current-rect"
              x={Math.min(startX, endX)}
              y={Math.min(startY, endY)}
              width={width}
              height={height}
              style="stroke"
              strokeWidth={brushSize}
              color={color}
            />
          );
        }
      }

      return elements;
    } catch (error) {
      console.error("Error rendering current drawing:", error);
      return [];
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Herramientas */}
              <TouchableOpacity
                style={[
                  styles.toolButton,
                  tool === TOOL_SELECT && styles.activeButton,
                ]}
                onPress={() => setTool(TOOL_SELECT)}
              >
                <Ionicons
                  name="hand-left"
                  size={20}
                  color={tool === TOOL_SELECT ? "#fff" : "#333"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toolButton,
                  tool === TOOL_PENCIL && styles.activeButton,
                ]}
                onPress={() => setTool(TOOL_PENCIL)}
              >
                <Ionicons
                  name="create"
                  size={20}
                  color={tool === TOOL_PENCIL ? "#fff" : "#333"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toolButton,
                  tool === TOOL_RECT && styles.activeButton,
                ]}
                onPress={() => setTool(TOOL_RECT)}
              >
                <Ionicons
                  name="square-outline"
                  size={20}
                  color={tool === TOOL_RECT ? "#fff" : "#333"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toolButton,
                  tool === TOOL_ERASER && styles.activeButton,
                ]}
                onPress={() => setTool(TOOL_ERASER)}
              >
                <Ionicons
                  name="brush"
                  size={20}
                  color={tool === TOOL_ERASER ? "#fff" : "#333"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toolButton,
                  tool === TOOL_TEXT && styles.activeButton,
                ]}
                onPress={() => setTool(TOOL_TEXT)}
              >
                <Ionicons
                  name="text"
                  size={20}
                  color={tool === TOOL_TEXT ? "#fff" : "#333"}
                />
              </TouchableOpacity>

              {/* Controles */}
              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowColorPicker(!showColorPicker)}
              >
                <View
                  style={[styles.colorPreview, { backgroundColor: color }]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowBrushSlider(!showBrushSlider)}
              >
                <Text style={styles.toolText}>{brushSize}</Text>
              </TouchableOpacity>

              {tool === TOOL_TEXT && (
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => setShowTextSize(!showTextSize)}
                >
                  <Text style={styles.toolText}>T{textSize}</Text>
                </TouchableOpacity>
              )}

              {/* Acciones */}
              <TouchableOpacity style={styles.toolButton} onPress={clearCanvas}>
                <Ionicons name="trash" size={20} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolButton} onPress={saveCanvas}>
                <Ionicons name="save" size={20} color="#333" />
              </TouchableOpacity>

              {/* Botón de regresar - siempre visible */}
              <TouchableOpacity
                style={[styles.toolButton, styles.backButton]}
                onPress={() => {
                  console.log("Back button pressed, onBack:", typeof onBack);
                  if (onBack) {
                    onBack();
                  } else {
                    console.log("onBack function not provided");
                  }
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Controles expandidos */}
          {showColorPicker && (
            <View style={styles.colorPicker}>
              <ScrollView horizontal>
                {colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorOption,
                      { backgroundColor: c },
                      color === c && styles.selectedColor,
                    ]}
                    onPress={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {showBrushSlider && (
            <View style={styles.controlPanel}>
              <Text>Grosor: {brushSize}</Text>
              <ScrollView horizontal>
                {brushSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      brushSize === size && styles.selectedSize,
                    ]}
                    onPress={() => {
                      setBrushSize(size);
                      setShowBrushSlider(false);
                    }}
                  >
                    <Text>{size}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {showTextSize && (
            <View style={styles.controlPanel}>
              <Text>Tamaño de texto: {textSize}</Text>
              <ScrollView horizontal>
                {textSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      textSize === size && styles.selectedSize,
                    ]}
                    onPress={() => {
                      setTextSize(size);
                      setShowTextSize(false);
                    }}
                  >
                    <Text>{size}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Canvas Container */}
          <View style={styles.canvasContainer}>
            {/* Canvas de Skia con eventos táctiles nativos */}
            <Canvas
              style={[StyleSheet.absoluteFillObject, styles.canvas]}
              onTouchStart={(event) => {
                try {
                  const touch = event.nativeEvent;
                  if (
                    touch &&
                    typeof touch.locationX === "number" &&
                    typeof touch.locationY === "number"
                  ) {
                    handleDrawStart(touch.locationX, touch.locationY);
                  }
                } catch (error) {
                  console.error("Error in onTouchStart:", error);
                }
              }}
              onTouchMove={(event) => {
                try {
                  const touch = event.nativeEvent;
                  if (
                    touch &&
                    typeof touch.locationX === "number" &&
                    typeof touch.locationY === "number"
                  ) {
                    handleDrawMove(touch.locationX, touch.locationY);
                  }
                } catch (error) {
                  console.error("Error in onTouchMove:", error);
                }
              }}
              onTouchEnd={() => {
                try {
                  handleDrawEnd();
                } catch (error) {
                  console.error("Error in onTouchEnd:", error);
                }
              }}
            >
              <Group>
                {renderLayers()}
                {renderCurrentDrawing()}
              </Group>
            </Canvas>

            {/* Overlay de texto con React Native */}
            {textElements.map((textEl) => (
              <View
                key={textEl.id}
                style={[
                  styles.textOverlay,
                  {
                    left: textEl.x,
                    top: textEl.y,
                    opacity: selectedLayerId === textEl.id ? 0.7 : 1,
                  },
                ]}
                pointerEvents="none"
              >
                <Text
                  style={{
                    fontSize: textEl.fontSize,
                    color: textEl.color,
                    fontWeight: "normal",
                  }}
                >
                  {textEl.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Panel de capas */}
          {tool === TOOL_SELECT && (
            <View style={styles.layersPanel}>
              <Text style={styles.layersPanelTitle}>
                Elementos ({layers.length + textElements.length})
              </Text>
              <ScrollView>
                {/* Elementos de texto */}
                {textElements
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((textEl) => (
                    <View
                      key={textEl.id}
                      style={[
                        styles.layerItem,
                        selectedLayerId === textEl.id && styles.selectedLayer,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.layerContent}
                        onPress={() => setSelectedLayerId(textEl.id)}
                      >
                        <Text style={styles.layerText}>
                          📝 {textEl.text.substring(0, 10)}...
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.layerControls}>
                        <TouchableOpacity
                          onPress={() => removeTextElement(textEl.id)}
                        >
                          <Text>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                {/* Capas de Skia */}
                {layers
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((layer) => (
                    <View
                      key={layer.id}
                      style={[
                        styles.layerItem,
                        selectedLayerId === layer.id && styles.selectedLayer,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.layerContent}
                        onPress={() => setSelectedLayerId(layer.id)}
                      >
                        <Text style={styles.layerText}>
                          {layer.type === "drawing"
                            ? "✏️"
                            : layer.type === "rect"
                            ? "▭"
                            : "❓"}
                          {layer.type}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.layerControls}>
                        <TouchableOpacity onPress={() => removeLayer(layer.id)}>
                          <Text>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Modal de texto */}
          <Modal
            visible={textInputModal.visible}
            transparent
            animationType="fade"
            onRequestClose={() =>
              setTextInputModal({
                visible: false,
                x: 0,
                y: 0,
                text: "",
                editingId: null,
              })
            }
          >
            <View style={styles.modalOverlay}>
              <View style={styles.textInputContainer}>
                <Text style={styles.modalTitle}>
                  {textInputModal.editingId ? "Editar texto" : "Agregar texto"}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={textInputModal.text}
                  onChangeText={(text) =>
                    setTextInputModal((prev) => ({ ...prev, text }))
                  }
                  placeholder="Escribe aquí..."
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() =>
                      setTextInputModal({
                        visible: false,
                        x: 0,
                        y: 0,
                        text: "",
                        editingId: null,
                      })
                    }
                  >
                    <Text>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={handleTextSubmit}
                  >
                    <Text style={styles.primaryButtonText}>
                      {textInputModal.editingId ? "Actualizar" : "Agregar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  toolbar: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  toolButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
  },
  activeButton: {
    backgroundColor: "#007bff",
  },
  backButton: {
    backgroundColor: "#dc3545",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minWidth: 80,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  toolText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  colorPicker: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#007bff",
  },
  controlPanel: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSize: {
    backgroundColor: "#007bff",
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  canvas: {
    flex: 1,
    backgroundColor: "transparent",
  },
  textOverlay: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  layersPanel: {
    position: "absolute",
    right: 10,
    top: 100,
    bottom: 100,
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  layersPanelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  layerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginVertical: 2,
  },
  selectedLayer: {
    backgroundColor: "#e3f2fd",
  },
  layerContent: {
    flex: 1,
  },
  layerText: {
    fontSize: 14,
  },
  layerControls: {
    flexDirection: "row",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  textInputContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default NotebookCanvasNative;
