// components/CustomDateTimePicker.jsx
import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Para web, usaremos input HTML nativo
const WebDateTimePicker = ({ value, mode, onChange, minimumDate }) => {
  const handleChange = (event) => {
    if (mode === 'time') {
      // Para el selector de tiempo
      const [hours, minutes] = event.target.value.split(':');
      const newTime = new Date(value); // Usar la fecha actual como base
      newTime.setHours(parseInt(hours, 10));
      newTime.setMinutes(parseInt(minutes, 10));
      newTime.setSeconds(0);
      onChange({ type: 'set' }, newTime);
    } else {
      // Para el selector de fecha
      const selectedDate = new Date(event.target.value + 'T00:00:00'); // Agregar tiempo para evitar problemas de zona horaria
      onChange({ type: 'set' }, selectedDate);
    }
  };

  const formatForInput = (date) => {
    if (!date || isNaN(date.getTime())) {
      // Si la fecha es inválida, usar valores por defecto
      if (mode === 'time') {
        return '12:00';
      }
      return new Date().toISOString().slice(0, 10);
    }

    if (mode === 'time') {
      // Formato HH:MM para input type="time"
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Formato YYYY-MM-DD para input type="date"
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const inputType = mode === 'time' ? 'time' : 'date';
  
  // Para el mínimo de fecha, permitir el día actual
  let min = undefined;
  if (minimumDate && mode === 'date') {
    const minDate = new Date(minimumDate);
    const year = minDate.getFullYear();
    const month = (minDate.getMonth() + 1).toString().padStart(2, '0');
    const day = minDate.getDate().toString().padStart(2, '0');
    min = `${year}-${month}-${day}`;
  }

  return (
    <input
      type={inputType}
      value={formatForInput(value)}
      onChange={handleChange}
      min={min}
      style={{
        padding: 12,
        borderRadius: 8,
        border: '1px solid #ddd',
        fontSize: 16,
        backgroundColor: '#fff',
        width: '100%',
      }}
    />
  );
};

export const CustomDateTimePicker = (props) => {
  if (Platform.OS === 'web') {
    return <WebDateTimePicker {...props} />;
  }
  
  return <DateTimePicker {...props} />;
};