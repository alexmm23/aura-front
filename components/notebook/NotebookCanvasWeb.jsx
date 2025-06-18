import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";

// Este componente usa Canvas HTML5 nativo para web
const TOOL_PENCIL = "pen";
const TOOL_RECT = "rect";
const TOOL_ERASER = "eraser";
const TOOL_TEXT = "text";
const TOOL_IMAGE = "image";

const colors = ["black", "red", "blue", "green", "orange"];
const brushSizes = [1, 2, 5, 10, 15];
const textSizes = [12, 16, 20, 24, 32];

const NotebookCanvasWeb = ({ onSave, onBack }) => {
  const canvasRef = useRef();
  const fileInputRef = useRef();
  const [tool, setTool] = useState(TOOL_PENCIL);
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(2);
  const [textSize, setTextSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
  const [rectStart, setRectStart] = useState(null);
  const [canvasState, setCanvasState] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  }); // Para guardar el estado del canvas

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
      setTextInput({
        visible: true,
        x: pos.x,
        y: pos.y,
        text: "",
      });
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

    setIsDrawing(true);
    setLastPoint(pos);
    if (tool === TOOL_RECT) {
      setRectStart(pos);
      // Guardar el estado actual del canvas
      setCanvasState(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } else if (tool === TOOL_PENCIL) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
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
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getCanvasPos(e);

    if (tool === TOOL_PENCIL || tool === TOOL_ERASER) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === TOOL_RECT && rectStart && canvasState) {
      // Restaurar el estado original del canvas
      ctx.putImageData(canvasState, 0, 0);

      // Dibujar el rectángulo preview
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        rectStart.x,
        rectStart.y,
        pos.x - rectStart.x,
        pos.y - rectStart.y
      );
    }

    setLastPoint(pos);
  };
  const stopDrawing = () => {
    setIsDrawing(false);
    setRectStart(null);
    setCanvasState(null); // Limpiar el estado guardado

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
    setTextInput({ visible: false, x: 0, y: 0, text: "" });
  };
  const handleTextKeyPress = (e) => {
    if (e.key === "Enter") {
      addTextToCanvas(textInput.text);
    } else if (e.key === "Escape") {
      setTextInput({ visible: false, x: 0, y: 0, text: "" });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
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

  const handleToolChange = (newTool) => {
    // Si hay una imagen pendiente y se cambia de herramienta, cancelarla
    if (tool === TOOL_IMAGE && newTool !== TOOL_IMAGE && pendingImage) {
      setPendingImage(null);
    }
    setTool(newTool);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");

    // Crear un enlace para descargar
    const link = document.createElement("a");
    link.download = `notebook-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    onSave?.(dataURL);
  }; // Toolbar UI
  const Toolbar = () => (
    <View style={styles.toolbar}>
      <button
        onClick={() => handleToolChange(TOOL_PENCIL)}
        style={{
          ...styles.toolButton,
          ...(tool === TOOL_PENCIL ? styles.activeBtn : {}),
        }}
      >
        ✏️ Lápiz
      </button>
      <button
        onClick={() => handleToolChange(TOOL_RECT)}
        style={{
          ...styles.toolButton,
          ...(tool === TOOL_RECT ? styles.activeBtn : {}),
        }}
      >
        ⬛ Rectángulo
      </button>
      <button
        onClick={() => handleToolChange(TOOL_ERASER)}
        style={{
          ...styles.toolButton,
          ...(tool === TOOL_ERASER ? styles.activeBtn : {}),
        }}
      >
        🧽 Borrador
      </button>
      <button
        onClick={() => handleToolChange(TOOL_TEXT)}
        style={{
          ...styles.toolButton,
          ...(tool === TOOL_TEXT ? styles.activeBtn : {}),
        }}
      >
        📝 Texto
      </button>
      <button
        onClick={() => handleToolChange(TOOL_IMAGE)}
        style={{
          ...styles.toolButton,
          ...(tool === TOOL_IMAGE ? styles.activeBtn : {}),
        }}
      >
        🖼️ Imagen
      </button>
      <View style={styles.separator} />
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Color:</Text>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={styles.selectInput}
        >
          {colors.map((c) => (
            <option
              key={c}
              value={c}
              style={{
                backgroundColor: c,
                color: c === "black" ? "white" : "black",
              }}
            >
              {c === "black"
                ? "● Negro"
                : c === "red"
                ? "● Rojo"
                : c === "blue"
                ? "● Azul"
                : c === "green"
                ? "● Verde"
                : c === "orange"
                ? "● Naranja"
                : c}
            </option>
          ))}
        </select>
      </View>
      <View style={styles.separator} />
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Grosor:</Text>
        <select
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          style={styles.selectInput}
        >
          {brushSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </View>
      <View style={styles.separator} />
      {tool === TOOL_TEXT && (
        <View>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Tamaño:</Text>
            <select
              value={textSize}
              onChange={(e) => setTextSize(parseInt(e.target.value))}
              style={styles.selectInput}
            >
              {textSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </View>

          <View style={styles.separator} />
        </View>
      )}
      {tool === TOOL_IMAGE && pendingImage && (
        <View>
          <View style={styles.separator} />
          <Text style={styles.pendingImageText}>
            📷 Imagen cargada - Haz clic en el canvas para colocarla
          </Text>
        </View>
      )}
      <button onClick={clearCanvas} style={styles.actionButton}>
        🗑️ Limpiar
      </button>
      <button onClick={saveCanvas} style={styles.actionButton}>
        💾 Guardar
      </button>
      {onBack && (
        <button onClick={onBack} style={styles.actionButton}>
          ← Volver
        </button>
      )}
    </View>
  );
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
      <Toolbar />
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
            onChange={(e) =>
              setTextInput({ ...textInput, text: e.target.value })
            }
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    flexWrap: "wrap",
    gap: 8,
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
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
});

export default NotebookCanvasWeb;
