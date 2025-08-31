// Canva‑style Board for React Native (no third‑party dependencies)
// Drop this file into your RN project as CanvaLiteBoard.js and import it in App.js
// Works on Android/iOS. Uses only React Native core APIs (Views, Images, Text, PanResponder).
// Features:
// - Scene graph of objects (rect, text, image) with z‑order
// - Select, drag, multi‑touch scale & rotate (pinch + rotate gesture)
// - Tap to select, tap empty space to deselect
// - Bring forward/backward, duplicate, delete
// - Serialize/deserialize scene to JSON
// Notes:
// - Hit test is axis‑aligned bbox (ignores rotation for simplicity)
// - Image loading uses a sample URI; plug your own URIs or an ImagePicker later

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  TextInput,
} from 'react-native';

const DEFAULTS = {
  rect: { width: 160, height: 100, color: '#5B9BD5' },
  text: { text: 'Mantén presionado para editar', fontSize: 20, color: '#111' },
  image: {
    uri: 'https://picsum.photos/seed/canva-lite/400/300',
    width: 220,
    height: 160,
  },
};

let _id = 1;
const newId = () => String(_id++);

// ---- Types (JSDoc) ----
/**
 * @typedef {'rect'|'text'|'image'} ObjType
 * @typedef {Object} Obj
 * @property {string} id
 * @property {ObjType} type
 * @property {number} x
 * @property {number} y
 * @property {number} rotation // radians
 * @property {number} scale // uniform
 * @property {number} width
 * @property {number} height
 * @property {string=} color
 * @property {string=} text
 * @property {number=} fontSize
 * @property {string=} uri
 */

function createObject(type /** @type {ObjType} */) {
  const id = newId();
  const base = { id, type, x: 80, y: 120, rotation: 0, scale: 1 };
  if (type === 'rect') return { ...base, ...DEFAULTS.rect };
  if (type === 'text') return {
    ...base,
    width: 260,
    height: 60,
    text: DEFAULTS.text.text,
    fontSize: DEFAULTS.text.fontSize,
    color: DEFAULTS.text.color,
  };
  // image
  return { ...base, ...DEFAULTS.image };
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function distance(p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}
function angle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getTouchesFromNative(evt) {
  const t = evt.nativeEvent.touches || [];
  return Array.from(t).map(ti => ({ id: ti.identifier ?? ti.target, x: ti.pageX, y: ti.pageY }));
}

export default function CanvaLiteBoard() {
  /** @type {React.MutableRefObject<Obj|null>} */
  const selectedRef = useRef(null);
  const [objects, setObjects] = useState(() => [
    createObject('rect'),
    { ...createObject('text'), x: 140, y: 300, text: '¡Hola, Canva‑Lite!' },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);

  const selectedIndex = useMemo(() => objects.findIndex(o => o.id === selectedId), [objects, selectedId]);
  const selected = selectedIndex >= 0 ? objects[selectedIndex] : null;
  selectedRef.current = selected;

  // Gesture state refs
  const gesture = useRef({
    mode: /** @type{'none'|'dragScaleRotate'} */('none'),
    startObj: /** @type{Obj|null} */(null),
    startTouches: [],
    startCentroid: { x: 0, y: 0 },
    startDist: 0,
    startAngle: 0,
    lastAngle: 0,
  });

  const updateObject = (id, updater) => {
    setObjects(prev => prev.map(o => (o.id === id ? (typeof updater === 'function' ? updater(o) : { ...o, ...updater }) : o)));
  };

  const bringForward = () => {
    if (!selected) return;
    setObjects(prev => {
      const i = prev.findIndex(o => o.id === selected.id);
      if (i < 0 || i === prev.length - 1) return prev;
      const arr = prev.slice();
      const [item] = arr.splice(i, 1);
      arr.splice(i + 1, 0, item);
      return arr;
    });
  };
  const sendBackward = () => {
    if (!selected) return;
    setObjects(prev => {
      const i = prev.findIndex(o => o.id === selected.id);
      if (i <= 0) return prev;
      const arr = prev.slice();
      const [item] = arr.splice(i, 1);
      arr.splice(i - 1, 0, item);
      return arr;
    });
  };
  const duplicate = () => {
    if (!selected) return;
    const copy = { ...selected, id: newId(), x: selected.x + 20, y: selected.y + 20 };
    setObjects(prev => [...prev, copy]);
    setSelectedId(copy.id);
  };
  const remove = () => {
    if (!selected) return;
    setObjects(prev => prev.filter(o => o.id !== selected.id));
    setSelectedId(null);
  };

  // Serialize / Deserialize
  const toJSON = () => JSON.stringify({ objects }, null, 2);
  const fromJSON = (json) => {
    try {
      const data = JSON.parse(json);
      if (data && Array.isArray(data.objects)) setObjects(data.objects);
    } catch (e) { /* ignore */ }
  };

  // Hit testing simplificado y más preciso
  const hitTest = (objects, x, y) => {
    // Buscar desde el objeto más arriba hacia abajo (z-order)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Calcular las dimensiones escaladas
      const w = obj.width * obj.scale;
      const h = obj.height * obj.scale;
      
      // Hit test básico sin considerar rotación para simplicidad
      // (para la mayoría de casos de uso esto es suficiente)
      if (x >= obj.x && x <= obj.x + w && 
          y >= obj.y && y <= obj.y + h) {
        return obj;
      }
    }
    return null;
  };

  const boardPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gs) => {
      // Solo responder si el toque es en un área vacía o en un objeto
      return true;
    },
    onMoveShouldSetPanResponder: (evt, gs) => {
      // Solo permitir el movimiento si hay un objeto seleccionado y se está moviendo
      return gesture.current.mode === 'dragScaleRotate' && Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2;
    },
    onPanResponderGrant: (evt, gs) => {
      const touches = getTouchesFromNative(evt);
      // Usar coordenadas relativas al contenedor, no a la página
      const { locationX, locationY } = evt.nativeEvent;

      console.log('Touch at:', locationX, locationY); // Debug

      // Usar la función de hit testing con coordenadas locales
      const hit = hitTest(objects, locationX, locationY);
      
      if (hit) {
        console.log('Hit object:', hit.type, hit.id); // Debug
        setSelectedId(hit.id);
        gesture.current.mode = 'dragScaleRotate';
        gesture.current.startObj = { ...hit };
        gesture.current.startTouches = touches;
        if (touches.length >= 2) {
          const c = centroid(touches);
          gesture.current.startCentroid = c;
          gesture.current.startDist = pinchDist(touches);
          gesture.current.startAngle = pinchAngle(touches);
          gesture.current.lastAngle = gesture.current.startAngle;
        } else {
          gesture.current.startCentroid = { x: locationX, y: locationY };
        }
      } else {
        console.log('No hit, deselecting'); // Debug
        setSelectedId(null);
        gesture.current.mode = 'none';
      }
    },
    onPanResponderMove: (evt, gs) => {
      if (gesture.current.mode !== 'dragScaleRotate') return;
      
      const touches = getTouchesFromNative(evt);
      const start = gesture.current.startObj;
      if (!start) return;

      // Obtener el objeto actual por ID para asegurar que estamos moviendo el correcto
      const currentObj = objects.find(o => o.id === start.id);
      if (!currentObj) return;

      console.log('Moving object:', start.id, 'dx:', gs.dx, 'dy:', gs.dy); // Debug

      if (touches.length >= 2) {
        // Pinch scale + rotate around centroid
        const c = centroid(touches);
        const dist = pinchDist(touches);
        const ang = pinchAngle(touches);
        const scaleDelta = dist / (gesture.current.startDist || 1);
        let newScale = clamp(start.scale * scaleDelta, 0.2, 5);
        
        // rotation delta
        const dAng = ang - gesture.current.startAngle;
        const newRot = start.rotation + dAng;
        
        // translate based on centroid movement
        const dx = c.x - gesture.current.startCentroid.x;
        const dy = c.y - gesture.current.startCentroid.y;
        const newX = start.x + dx;
        const newY = start.y + dy;
        
        updateObject(start.id, { x: newX, y: newY, scale: newScale, rotation: newRot });
      } else {
        // Drag simple - mover basado en el desplazamiento total
        const { dx, dy } = gs;
        const newX = start.x + dx;
        const newY = start.y + dy;
        
        console.log('New position:', newX, newY); // Debug
        
        // Limitar el movimiento dentro del tablero (relajar los límites por ahora)
        const constrainedX = Math.max(-50, Math.min(newX, 400));
        const constrainedY = Math.max(-50, Math.min(newY, 400));
        
        updateObject(start.id, { x: constrainedX, y: constrainedY });
      }
    },
    onPanResponderRelease: () => {
      gesture.current.mode = 'none';
    },
  }), [objects]);

  function centroid(ts) {
    const n = ts.length || 1;
    const sx = ts.reduce((a, t) => a + t.x, 0);
    const sy = ts.reduce((a, t) => a + t.y, 0);
    return { x: sx / n, y: sy / n };
  }
  function pinchDist(ts) {
    if (ts.length < 2) return 1;
    return distance(ts[0], ts[1]);
  }
  function pinchAngle(ts) {
    if (ts.length < 2) return 0;
    return angle(ts[0], ts[1]);
  }

  // -- UI helpers --
  const ToolbarButton = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.toolBtn}>
      <Text style={styles.toolBtnText}>{label}</Text>
    </TouchableOpacity>
  );

  const addRect = () => setObjects(prev => [...prev, createObject('rect')]);
  const addText = () => setObjects(prev => [...prev, createObject('text')]);
  const addImage = () => setObjects(prev => [...prev, createObject('image')]);

  const onDoubleTapText = (obj) => {
    if (obj.type !== 'text') return;
    setEditingTextId(obj.id);
  };

  // Simple double‑tap detector per renderable view
  const lastTapRef = useRef({});
  const handleTap = (obj) => () => {
    const now = Date.now();
    const last = lastTapRef.current[obj.id] || 0;
    if (now - last < 280) {
      onDoubleTapText(obj);
    }
    lastTapRef.current[obj.id] = now;
  };

  const EditableText = ({ obj }) => {
    const [buffer, setBuffer] = useState(obj.text || '');
    const [fontSize, setFontSize] = useState(obj.fontSize || 20);
    
    return (
      <View style={styles.editOverlay}>
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Editar texto</Text>
          
          <TextInput
            style={styles.textInput}
            value={buffer}
            onChangeText={setBuffer}
            multiline={true}
            placeholder="Ingresa tu texto aquí..."
            placeholderTextColor="#9CA3AF"
            autoFocus={true}
          />
          
          <View style={styles.row}>
            <Text style={styles.sizeLabel}>Tamaño: {fontSize}px</Text>
            <View style={styles.sizeButtons}>
              <TouchableOpacity 
                style={styles.sizeBtn} 
                onPress={() => setFontSize(Math.max(8, fontSize - 2))}
              >
                <Text style={styles.sizeBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sizeBtn} 
                onPress={() => setFontSize(Math.min(48, fontSize + 2))}
              >
                <Text style={styles.sizeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.row}>
            <ToolbarButton label="Texto de ejemplo" onPress={() => setBuffer('Lorem ipsum dolor sit amet')} />
            <ToolbarButton label="Hola 👋" onPress={() => setBuffer('¡Hola, mundo!')} />
          </View>
          
          <View style={styles.row}>
            <ToolbarButton label="Cancelar" onPress={() => setEditingTextId(null)} />
            <ToolbarButton label="Guardar" onPress={() => { 
              updateObject(obj.id, { text: buffer, fontSize: fontSize }); 
              setEditingTextId(null); 
            }} />
          </View>
        </View>
      </View>
    );
  };

  const RenderObject = ({ obj }) => {
    const isSelected = obj.id === selectedId;
    const w = obj.width * obj.scale;
    const h = obj.height * obj.scale;
    const transform = [
      { translateX: obj.x + w / 2 },
      { translateY: obj.y + h / 2 },
      { rotate: `${obj.rotation}rad` },
      { translateX: -w / 2 },
      { translateY: -h / 2 },
    ];

    return (
      <View
        style={[styles.objectContainer, { left: obj.x, top: obj.y, width: w, height: h, transform }]}
      >
        <View style={{ width: '100%', height: '100%' }}>
          {obj.type === 'rect' && (
            <TouchableOpacity
              style={[styles.rect, { backgroundColor: obj.color, width: '100%', height: '100%' }]}
              onPress={() => setSelectedId(obj.id)}
              onLongPress={() => {
                if (obj.type === 'text') {
                  onDoubleTapText(obj);
                }
              }}
              activeOpacity={0.8}
            />
          )}
          {obj.type === 'image' && (
            <TouchableOpacity
              style={{ width: '100%', height: '100%' }}
              onPress={() => setSelectedId(obj.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: obj.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </TouchableOpacity>
          )}
          {obj.type === 'text' && (
            <TouchableOpacity
              style={[styles.textBox, { width: '100%', height: '100%' }]}
              onPress={() => setSelectedId(obj.id)}
              onLongPress={() => onDoubleTapText(obj)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: obj.fontSize, color: obj.color }} numberOfLines={3}>
                {obj.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isSelected && (
          <View pointerEvents="none" style={[styles.selection, { width: w, height: h }]}> 
            <View style={[styles.handle, styles.handleTL]} />
            <View style={[styles.handle, styles.handleTR]} />
            <View style={[styles.handle, styles.handleBL]} />
            <View style={[styles.handle, styles.handleBR]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbarTop}>
        <ToolbarButton label="Rect" onPress={addRect} />
        <ToolbarButton label="Texto" onPress={addText} />
        <ToolbarButton label="Imagen" onPress={addImage} />
        <View style={styles.divider} />
        {selected && selected.type === 'text' && (
          <ToolbarButton label="Editar texto" onPress={() => setEditingTextId(selected.id)} />
        )}
        <ToolbarButton label="Arriba" onPress={bringForward} />
        <ToolbarButton label="Abajo" onPress={sendBackward} />
        <ToolbarButton label="Duplicar" onPress={duplicate} />
        <ToolbarButton label="Borrar" onPress={remove} />
      </View>

      <View style={styles.board} {...boardPanResponder.panHandlers}>
        {objects.map(o => (
          <RenderObject key={o.id} obj={o} />
        ))}
        
        {/* Indicador de objeto seleccionado */}
        {selectedId && (
          <View pointerEvents="none" style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>
              Seleccionado: {objects.find(o => o.id === selectedId)?.type || 'Objeto'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.toolbarBottom}>
        <ToolbarButton label="Export JSON" onPress={() => {
          const json = toJSON();
          console.log('Scene JSON:', json);
          alert('Escena exportada a consola');
        }} />
        <ToolbarButton label="Cargar JSON" onPress={() => {
          // Demo: reload same scene from current JSON
          fromJSON(toJSON());
          alert('Escena recargada');
        }} />
      </View>

      {editingTextId && (
        <EditableText obj={objects.find(o => o.id === editingTextId)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  board: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative', // Importante para coordenadas relativas
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1000,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toolbarTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: 'center',
  },
  toolbarBottom: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    justifyContent: 'flex-end',
  },
  toolBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  toolBtnText: { color: '#E2E8F0', fontWeight: '600' },
  divider: { width: 1, height: 24, backgroundColor: '#334155', marginHorizontal: 8 },
  objectContainer: { position: 'absolute' },
  rect: { borderRadius: 8 },
  textBox: { padding: 8, justifyContent: 'center', alignItems: 'flex-start' },
  selection: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
  },
  handle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  handleTL: { left: -6, top: -6 },
  handleTR: { right: -6, top: -6 },
  handleBL: { left: -6, bottom: -6 },
  handleBR: { right: -6, bottom: -6 },
  editOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  editCard: {
    width: '86%', maxWidth: 520, borderRadius: 16, padding: 16,
    backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#334155',
  },
  editTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  textInput: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: '#E5E7EB',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sizeLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    marginRight: 8,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeBtn: {
    backgroundColor: '#374151',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputBox: { backgroundColor: '#111827', padding: 12, borderRadius: 10, marginBottom: 12 },
  inputText: { color: '#E5E7EB' },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
});
