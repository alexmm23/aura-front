import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { API, buildApiUrl } from "@/config/api";
import { apiGet, apiPostMultipart } from "../../utils/fetchWithAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import CanvaLiteBoard from "./CanvaLiteBoard";

// Este componente usa Canvas HTML5 nativo para web
const TOOL_PENCIL = "pen";
const TOOL_RECT = "rect";
const TOOL_ERASER = "eraser";
const TOOL_TEXT = "text";
const TOOL_IMAGE = "image";

const colors = ["black", "red", "blue", "green", "orange"];
const brushSizes = [1, 2, 5, 10, 15];
const textSizes = [12, 16, 20, 24, 32];

// Pre-cargar assets como constantes para evitar re-carga
const ASSETS = {
  PENCIL: require("../../assets/images/lapiz.png"),
  RECTANGLE: require("../../assets/images/rectangulo.png"),
  ERASER: require("../../assets/images/borrador.png"),
  TEXT: require("../../assets/images/fuente.png"),
  IMAGE: require("../../assets/images/agregarImagen.png"),
  BRUSH_SIZE: require("../../assets/images/anchura.png"),
  COLOR: require("../../assets/images/color.png"),
  CLEAR: require("../../assets/images/limpiar.png"),
  SAVE: require("../../assets/images/salvar.png"),
  BACK: require("../../assets/images/volver.png"),
  TEXTURE: require("../../assets/images/textura_lapiz.jpg"),
};

// Estilo constante para imágenes
const IMAGE_STYLE = { width: 24, height: 24 };

const NotebookCanvasWeb = ({ onSave, onBack }) => {
  // return (
  //   <CanvaLiteBoard
  //     onSave={onSave}
  //     onBack={onBack}
  //   />
  // );
  const canvasRef = useRef();
  const fileInputRef = useRef();
  const [tool, setTool] = useState(TOOL_PENCIL);
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(2);
  const [textSize, setTextSize] = useState(16);
  const [pencilTexture, setPencilTexture] = useState(false);
  // Usar useRef para estados que no afectan el render del UI
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const rectStartRef = useRef(null);
  const canvasStateRef = useRef(null);
  const textInputRef = useRef({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const [pendingImage, setPendingImage] = useState(null);
  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  }); // Solo para el render del input visual
  const [showBrushSlider, setShowBrushSlider] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Estados para el modal de selección de cuaderno
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [canvasDataToSave, setCanvasDataToSave] = useState(null);
  const texturePatternRef = useRef(null);

  // Callbacks memoizados para evitar re-renders del Toolbar
  const setBrushSizeCallback = useCallback((value) => {
    if (typeof value === "function") {
      setBrushSize(value);
    } else {
      setBrushSize(value);
    }
  }, []);

  const setColorCallback = useCallback((value) => {
    if (typeof value === "function") {
      setColor(value);
    } else {
      setColor(value);
    }
  }, []);

  const setTextSizeCallback = useCallback((value) => {
    if (typeof value === "function") {
      setTextSize(value);
    } else {
      setTextSize(value);
    }
  }, []);

  const setShowBrushSliderCallback = useCallback((value) => {
    if (typeof value === "function") {
      setShowBrushSlider(value);
    } else {
      setShowBrushSlider(value);
    }
  }, []);

  const setShowColorPickerCallback = useCallback((value) => {
    if (typeof value === "function") {
      setShowColorPicker(value);
    } else {
      setShowColorPicker(value);
    }
  }, []);

  const setPencilTextureCallback = useCallback((value) => {
    if (typeof value === "function") {
      setPencilTexture(value);
    } else {
      setPencilTexture(value);
    }
  }, []);

  // Callback para manejar cambios en el texto sin causar re-renders del toolbar
  const handleTextInputChange = useCallback((e) => {
    const newText = e.target.value;
    textInputRef.current = { ...textInputRef.current, text: newText };
    setTextInput((prev) => ({ ...prev, text: newText }));
  }, []);

  // Configuración inicial del canvas (solo una vez)
  useEffect(() => {
    if (Platform.OS === "web" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Configurar canvas inicial
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;

      // Limpiar canvas solo al inicio
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pre-cargar la textura de lápiz
      const textureImg = new window.Image();
      textureImg.onload = () => {
        texturePatternRef.current = ctx.createPattern(textureImg, "repeat");
      };
      textureImg.src = ASSETS.TEXTURE;
      console.log("Texture image loading initiated", ASSETS.TEXTURE);
      console.log("Canvas initialized", canvas, textureImg);
    }
  }, []); // Solo ejecutar una vez al montar el componente

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getCanvasPos(e);

    if (tool === TOOL_TEXT) {
      // Mostrar input de texto en la posición clickeada
      textInputRef.current = {
        visible: true,
        x: pos.x,
        y: pos.y,
        text: "",
      };
      // Forzar re-render solo para mostrar el input de texto
      setTextInput({ ...textInputRef.current });
      return;
    }

    if (tool === TOOL_IMAGE) {
      if (pendingImage) {
        // Si hay una imagen pendiente, colocarla en la posición clickeada
        addImageToCanvas(pendingImage, pos.x, pos.y);
        setPendingImage(null);
      } else {
        // Si no hay imagen, abrir el selector de archivos
        fileInputRef.current?.click();
      }
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = pos;
    if (tool === TOOL_RECT) {
      rectStartRef.current = pos;
      // Guardar el estado actual del canvas
      canvasStateRef.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else if (tool === TOOL_PENCIL) {
      ctx.globalCompositeOperation = "source-over";

      // Aplicar textura si está activada y disponible
      if (pencilTexture && texturePatternRef.current) {
        console.log("Applying pencil texture");
        ctx.strokeStyle = texturePatternRef.current;
      } else {
        ctx.strokeStyle = color;
      }

      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === TOOL_ERASER) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 2; // El borrador es más grande
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getCanvasPos(e);

    if (tool === TOOL_PENCIL || tool === TOOL_ERASER) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (
      tool === TOOL_RECT &&
      rectStartRef.current &&
      canvasStateRef.current
    ) {
      // Restaurar el estado original del canvas
      ctx.putImageData(canvasStateRef.current, 0, 0);

      // Dibujar el rectángulo preview
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        rectStartRef.current.x,
        rectStartRef.current.y,
        pos.x - rectStartRef.current.x,
        pos.y - rectStartRef.current.y
      );
    }

    lastPointRef.current = pos;
  };
  const stopDrawing = () => {
    isDrawingRef.current = false;
    rectStartRef.current = null;
    canvasStateRef.current = null; // Limpiar el estado guardado

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
    }
  };

  const addTextToCanvas = (text) => {
    if (!text.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.font = `${textSize}px Arial`;
    ctx.textBaseline = "top";

    ctx.fillText(text, textInput.x, textInput.y);

    // Ocultar el input de texto
    textInputRef.current = { visible: false, x: 0, y: 0, text: "" };
    setTextInput({ visible: false, x: 0, y: 0, text: "" });
  };
  const handleTextKeyPress = (e) => {
    if (e.key === "Enter") {
      addTextToCanvas(textInput.text);
    } else if (e.key === "Escape") {
      textInputRef.current = { visible: false, x: 0, y: 0, text: "" };
      setTextInput({ visible: false, x: 0, y: 0, text: "" });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Usar HTMLImageElement específicamente para evitar conflictos con React Native
        const img = new window.Image();
        img.onload = () => {
          setPendingImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    e.target.value = "";
  };
  const addImageToCanvas = (img, x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calcular el tamaño de la imagen para que quepa en el canvas
    const maxWidth = 200;
    const maxHeight = 200;
    let { width, height } = img;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    // Dibujar la imagen en la posición especificada
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, x, y, width, height);
  };
  const getCanvasCursor = () => {
    if (tool === TOOL_IMAGE && pendingImage) {
      return "copy";
    } else if (tool === TOOL_TEXT) {
      return "text";
    } else if (tool === TOOL_ERASER) {
      return "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNi45OTY3QzMgNi40NDc3IDMuNDQ3NzEgNiAzLjk5OTk5IDZIMjBDMjAuNTUyMyA2IDIxIDYuNDQ3NzEgMjEgN1YxN0MyMSAxNy41NTIzIDIwLjU1MjMgMTggMjAgMThIMTMuNDEyMkMxMy4xNDkgMTggMTIuODk3NSAxNy44OTQ2IDEyLjcwNzEgMTcuNzA3MUw5IDEzLjk5OTlMNS4yOTI4OSAxNy43MDcxQzUuMTAyNTMgMTcuODk0NiA0Ljg1MDk5IDE4IDQuNTg3NzggMThIMy45OTk5OUMzLjQ0NzcxIDE4IDMgMTcuNTUyMyAzIDE3VjYuOTk2N1oiIGZpbGw9IiMzMzMiLz4KPC9zdmc+Cg==') 12 12, auto";
    }
    return "crosshair";
  };

  const handleToolChange = useCallback(
    (newTool) => {
      // Si hay una imagen pendiente y se cambia de herramienta, cancelarla
      if (tool === TOOL_IMAGE && newTool !== TOOL_IMAGE && pendingImage) {
        setPendingImage(null);
      }
      setTool(newTool);
    },
    [tool, pendingImage]
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Guardar el contenido actual
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Rellenar fondo blanco
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Descargar imagen
    const dataURL = canvas.toDataURL("image/png");

    // Restaurar el contenido original
    ctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // Crear un enlace para descargar
    const link = document.createElement("a");
    link.download = `notebook-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    onSave?.(dataURL);
  }, [onSave]);

  // Función para obtener los cuadernos del usuario
  const fetchUserNotebooks = async () => {
    setLoadingNotebooks(true);
    try {
      const response = await apiGet(API.ENDPOINTS.STUDENT.NOTEBOOKS);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched notebooks:", data);
        setNotebooks(data);
      } else {
        console.error("Error fetching notebooks:", response.status);
        alert("Error al cargar los cuadernos");
      }
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      alert("Error de conexión al cargar los cuadernos");
    } finally {
      setLoadingNotebooks(false);
    }
  };

  // Función para guardar la nota en un cuaderno específico
  const saveNoteToNotebook = async (notebookId) => {
    if (!canvasDataToSave) return;

    setSavingNote(true);
    try {
      // Convertir la imagen base64 a un blob para enviarla
      const response = await fetch(canvasDataToSave);
      const blob = await response.blob();

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append("image", blob, `canvas-note-${Date.now()}.png`);
      formData.append("notebook_id", notebookId.toString());
      formData.append("title", `Nota del ${new Date().toLocaleDateString()}`);

      const saveResponse = await apiPostMultipart(
        API.ENDPOINTS.STUDENT.NOTE_CREATE,
        formData
      );

      if (saveResponse.ok) {
        alert("Nota guardada exitosamente en el cuaderno");
        setShowNotebookModal(false);
        setCanvasDataToSave(null);
        onSave?.(canvasDataToSave);
      } else {
        console.error("Error saving note:", saveResponse.status);
        alert("Error al guardar la nota en el cuaderno");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error de conexión al guardar la nota");
    } finally {
      setSavingNote(false);
    }
  };

  // Función modificada para abrir el modal de selección
  const openNotebookSelector = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Guardar el contenido actual
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Rellenar fondo blanco
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obtener la imagen
    const dataURL = canvas.toDataURL("image/png");

    // Restaurar el contenido original
    ctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // Guardar la data del canvas y mostrar el modal
    setCanvasDataToSave(dataURL);
    setShowNotebookModal(true);
    fetchUserNotebooks();
  }, []);

  // Componente del modal para seleccionar cuaderno
  const NotebookSelectorModal = () => (
    <Modal
      visible={showNotebookModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNotebookModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Cuaderno</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotebookModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Selecciona en qué cuaderno quieres guardar tu nota:
          </Text>

          {loadingNotebooks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Cargando cuadernos...</Text>
            </View>
          ) : (
            <FlatList
              data={notebooks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.notebookItem}
                  onPress={() => saveNoteToNotebook(item.id)}
                  disabled={savingNote}
                >
                  <View style={styles.notebookInfo}>
                    <Text style={styles.notebookName}>{item.title}</Text>
                    <Text style={styles.notebookSubject}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {savingNote && (
                    <ActivityIndicator size="small" color="#007bff" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.notebookList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No tienes cuadernos disponibles.{"\n"}
                    Crea un cuaderno primero para guardar tus notas.
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.downloadButton]}
              onPress={saveCanvas}
            >
              <Text style={styles.downloadButtonText}>
                Descargar en su lugar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Componentes individuales memoizados para el toolbar
  const ToolButtons = memo(
    ({ tool, onToolChange }) => (
      <>
        <button
          onClick={() => onToolChange(TOOL_PENCIL)}
          style={{
            ...styles.toolButton,
            ...(tool === TOOL_PENCIL ? styles.activeBtn : {}),
          }}
        >
          <Image source={ASSETS.PENCIL} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={() => onToolChange(TOOL_RECT)}
          style={{
            ...styles.toolButton,
            ...(tool === TOOL_RECT ? styles.activeBtn : {}),
          }}
        >
          <Image source={ASSETS.RECTANGLE} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={() => onToolChange(TOOL_ERASER)}
          style={{
            ...styles.toolButton,
            ...(tool === TOOL_ERASER ? styles.activeBtn : {}),
          }}
        >
          <Image source={ASSETS.ERASER} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={() => onToolChange(TOOL_TEXT)}
          style={{
            ...styles.toolButton,
            ...(tool === TOOL_TEXT ? styles.activeBtn : {}),
          }}
        >
          <Image source={ASSETS.TEXT} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={() => onToolChange(TOOL_IMAGE)}
          style={{
            ...styles.toolButton,
            ...(tool === TOOL_IMAGE ? styles.activeBtn : {}),
          }}
        >
          <Image source={ASSETS.IMAGE} style={IMAGE_STYLE} />
        </button>
      </>
    ),
    [tool]
  );

  const BrushControls = memo(
    ({ showBrushSlider, setShowBrushSlider, brushSize, setBrushSize }) => {
      const handleToggle = useCallback(() => {
        setShowBrushSlider((prev) => !prev);
      }, [setShowBrushSlider]);

      const handleChange = useCallback(
        (e) => {
          setBrushSize(parseInt(e.target.value));
        },
        [setBrushSize]
      );

      return (
        <>
          <button onClick={handleToggle} style={styles.toolButton}>
            <Image source={ASSETS.BRUSH_SIZE} style={IMAGE_STYLE} />
          </button>
          {showBrushSlider && (
            <View style={styles.brushSliderPopover}>
              <Text style={styles.controlLabel}>Grosor: {brushSize}px</Text>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={brushSize}
                onChange={handleChange}
                style={{
                  width: 120,
                  marginLeft: 8,
                  cursor: "pointer",
                }}
              />
            </View>
          )}
        </>
      );
    },
    [showBrushSlider, brushSize]
  );

  const ColorControls = memo(
    ({ showColorPicker, setShowColorPicker, color, setColor }) => {
      const handleToggle = useCallback(() => {
        setShowColorPicker((prev) => !prev);
      }, [setShowColorPicker]);

      const handleChange = useCallback(
        (e) => {
          setColor(e.target.value);
        },
        [setColor]
      );

      const handleBlur = useCallback(() => {
        setShowColorPicker(false);
      }, [setShowColorPicker]);

      return (
        <>
          {showColorPicker && (
            <div style={styles.colorPickerPopover}>
              <input
                type="color"
                value={color}
                onChange={handleChange}
                style={{
                  width: 40,
                  height: 40,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                autoFocus
                onBlur={handleBlur}
              />
            </div>
          )}
          <button onClick={handleToggle} style={styles.toolButton}>
            <Image source={ASSETS.COLOR} style={IMAGE_STYLE} />
          </button>
        </>
      );
    },
    [showColorPicker, color]
  );

  const TextureControls = memo(
    ({ pencilTexture, setPencilTexture }) => {
      const handleToggle = useCallback(() => {
        setPencilTexture((prev) => !prev);
      }, [setPencilTexture]);

      return (
        <button
          onClick={handleToggle}
          style={{
            ...styles.toolButton,
            ...(pencilTexture ? styles.activeBtn : {}),
          }}
          title="Textura de lápiz"
        >
          <div
            style={{
              width: 24,
              height: 24,
              background: `url(${ASSETS.TEXTURE})`,
              backgroundSize: "cover",
              borderRadius: 3,
              border: pencilTexture ? "2px solid #007bff" : "1px solid #ccc",
            }}
          />
        </button>
      );
    },
    [pencilTexture]
  );

  const TextControls = memo(
    ({ tool, textSize, setTextSize }) => {
      const handleChange = useCallback(
        (e) => {
          setTextSize(parseInt(e.target.value));
        },
        [setTextSize]
      );

      if (tool !== TOOL_TEXT) return null;

      return (
        <View style={styles.textSizePopover}>
          <Text style={styles.controlLabel}>Tamaño:</Text>
          <select
            value={textSize}
            onChange={handleChange}
            style={styles.selectInput}
          >
            {textSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </View>
      );
    },
    [tool, textSize]
  );

  const ImageControls = memo(
    ({ tool, pendingImage }) => {
      if (tool !== TOOL_IMAGE || !pendingImage) return null;

      return (
        <View>
          <View style={styles.separator} />
          <Text style={styles.pendingImageText}>
            📷 Imagen cargada - Haz clic en el canvas para colocarla
          </Text>
        </View>
      );
    },
    [tool, pendingImage]
  );

  const ActionButtons = memo(
    ({ onClearCanvas, onSaveCanvas, onOpenNotebookSelector, onBack }) => (
      <>
        <button onClick={onClearCanvas} style={styles.actionButton}>
          <Image source={ASSETS.CLEAR} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={onSaveCanvas}
          style={{ ...styles.actionButton, ...styles.downloadBtn }}
          title="Descargar imagen"
        >
          <Image source={ASSETS.SAVE} style={IMAGE_STYLE} />
        </button>
        <button
          onClick={onOpenNotebookSelector}
          style={{ ...styles.actionButton, ...styles.saveToNotebookBtn }}
          title="Guardar en cuaderno"
        >
          <Image source={ASSETS.SAVE} style={IMAGE_STYLE} />
        </button>
        {onBack && (
          <button onClick={onBack} style={styles.actionButton}>
            <Image source={ASSETS.BACK} style={IMAGE_STYLE} />
          </button>
        )}
      </>
    ),
    []
  );

  // Toolbar dividido en componentes granulares
  const Toolbar = memo(
    () => (
      <View style={styles.toolbar}>
        <ToolButtons tool={tool} onToolChange={handleToolChange} />
        <BrushControls
          showBrushSlider={showBrushSlider}
          setShowBrushSlider={setShowBrushSliderCallback}
          brushSize={brushSize}
          setBrushSize={setBrushSizeCallback}
        />
        <ColorControls
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPickerCallback}
          color={color}
          setColor={setColorCallback}
        />
        <TextureControls
          pencilTexture={pencilTexture}
          setPencilTexture={setPencilTextureCallback}
        />
        <TextControls
          tool={tool}
          textSize={textSize}
          setTextSize={setTextSizeCallback}
        />
        <ImageControls tool={tool} pendingImage={pendingImage} />
        <ActionButtons
          onClearCanvas={clearCanvas}
          onSaveCanvas={saveCanvas}
          onOpenNotebookSelector={openNotebookSelector}
          onBack={onBack}
        />
      </View>
    ),
    []
  );

  // Componente Toolbar memoizado para evitar re-renders
  const MemoizedToolbar = memo(() => <Toolbar />, []);
  if (Platform.OS !== "web") {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Este componente solo funciona en web
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.toolbarContainer}>
          <MemoizedToolbar />
        </View>
        <View style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              ...styles.canvas,
              cursor: getCanvasCursor(),
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          {textInput.visible && (
            <input
              type="text"
              value={textInput.text}
              onChange={handleTextInputChange}
              onKeyDown={handleTextKeyPress}
              onBlur={() => addTextToCanvas(textInput.text)}
              autoFocus
              style={{
                position: "absolute",
                left: textInput.x + 16, // offset para que no se superponga con el canvas
                top: textInput.y + 16,
                fontSize: `${textSize}px`,
                color: color,
                border: "2px solid #007bff",
                borderRadius: 4,
                padding: "4px 8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                outline: "none",
                zIndex: 10,
              }}
              placeholder="Escribe aquí (Enter para confirmar, Esc para cancelar)"
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </View>
      </View>

      {/* Modal para seleccionar cuaderno */}
      <NotebookSelectorModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  toolbarContainer: {
    position: "sticky",
    top: 40,
    left: 0,
    zIndex: 100,
    minWidth: 80,
    maxWidth: 120,
    marginRight: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: 12,
    height: "fit-content",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative", // <-- Asegúrate de tener esto
  },
  toolbar: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  toolButton: {
    padding: "8px",
    border: "1px solid #dee2e6",
    borderRadius: 6,
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    padding: "8px",
    border: "1px solid #dee2e6",
    borderRadius: 6,
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
  },
  downloadBtn: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  saveToNotebookBtn: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  activeBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff",
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: "#dee2e6",
    margin: 0,
  },
  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlLabel: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
    minWidth: 50,
  },
  selectInput: {
    padding: "6px",
    border: "1px solid #dee2e6",
    borderRadius: 4,
    backgroundColor: "#fff",
    fontSize: 14,
    cursor: "pointer",
    minWidth: 100,
  },
  canvasContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 16,
    minHeight: 600,
  },
  canvas: {
    border: "2px solid #dee2e6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  fallbackText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  pendingImageText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
    padding: "4px 8px",
    backgroundColor: "#d4edda",
    borderRadius: 4,
    border: "1px solid #c3e6cb",
  },
  brushSliderPopover: {
    position: "absolute",
    left: "120%", // Justo a la derecha de la barra
    top: 260, // <-- Ajusta este valor según la altura de tus botones
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 12,
    zIndex: 200,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 180,
  },
  colorPickerPopover: {
    position: "absolute",
    left: "180%",
    top: 310, // Ajusta este valor para la altura deseada
    transform: "translateX(-50%)",
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 12,
    zIndex: 300,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  textSizePopover: {
    position: "absolute",
    left: "120%", // Justo a la derecha de la barra
    top: 155, // Ajusta este valor para alinearlo con el botón de texto
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 12,
    zIndex: 250,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 140,
  },

  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6c757d",
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  notebookList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  notebookItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  notebookInfo: {
    flex: 1,
  },
  notebookName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notebookSubject: {
    fontSize: 14,
    color: "#6c757d",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 22,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#28a745",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotebookCanvasWeb;
