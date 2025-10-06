import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AuraText } from "@/components/AuraText";
import { Ionicons } from "@expo/vector-icons";
import Head from "expo-router/head";
import Svg, { Path } from "react-native-svg";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CustomDateTimePicker } from '@/components/CustomDateTimePicker';
import { API, buildApiUrl } from "@/config/api";
import { Picker } from "@react-native-picker/picker";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

// Servicio de notificaciones web (agregar esta función directamente en el archivo)
const webNotificationService = {
  scheduledTimeouts: new Map(),

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  async scheduleReminder(reminder) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    const targetTime = new Date(reminder.date_time);
    const delay = targetTime.getTime() - new Date().getTime();
    if (delay <= 0) return null;

    const timeoutId = setTimeout(() => {
      const notification = new Notification(`🔔 ${reminder.title}`, {
        body: reminder.description ? 
          `¡Oye! Recuerda que tienes: ${reminder.description}` : 
          '¡Oye! Recuerda que tienes esta tarea pendiente',
        icon: '/favicon.ico',
        requireInteraction: true,
      });

      if (reminder.has_alarm) {
        // Sonido simple
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaMgA=');
        audio.play().catch(console.error);
      }

      notification.onclick = () => { window.focus(); notification.close(); };
      setTimeout(() => notification.close(), 10000);
      this.scheduledTimeouts.delete(reminder.id);
    }, delay);

    this.scheduledTimeouts.set(reminder.id, timeoutId);
    return timeoutId;
  },

  cancelReminder(reminderId) {
    const timeoutId = this.scheduledTimeouts.get(reminderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledTimeouts.delete(reminderId);
    }
  }
};

export default function Reminders() {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  // States
  const [reminders, setReminders] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    upcoming_today: 0
  }); // Inicializar con valores por defecto
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    frequency: '',
    search: '',
  });

  // Form data - Inicializar con fechas válidas
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(), // Fecha actual
    time: (() => {
      const now = new Date();
      // En lugar de forzar 12:00, usar la hora actual
      return now;
    })(),
    frequency: 'once',
    has_alarm: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load data
  const loadReminders = async () => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams({
        ...filters,
        page: 1,
        limit: 20,
        sort_by: 'date_time',
        sort_order: 'ASC'
      }).toString();

      const response = await fetchWithAuth(
        buildApiUrl(`${API.ENDPOINTS.REMINDERS.LIST}?${queryString}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ); // ← Cerré correctamente el fetch aquí

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reminders response:', data);
      
      // Ajusta según la estructura de respuesta de tu backend
      setReminders(data.reminders || data.data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.REMINDERS.STATISTICS),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Statistics response:', data); // Para debug
      setStatistics(data || { total: 0, pending: 0, upcoming_today: 0 });
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Establecer estadísticas por defecto en caso de error
      setStatistics({ total: 0, pending: 0, upcoming_today: 0 });
    }
  };

  // CRUD Operations
  const saveReminder = async () => {
    try {
      if (!formData.title.trim()) {
        Alert.alert('Error', 'El título es requerido');
        return;
      }

      const dateTime = new Date(formData.date);
      dateTime.setHours(formData.time.getHours());
      dateTime.setMinutes(formData.time.getMinutes());

      const reminderData = {
        title: formData.title,
        description: formData.description,
        date_time: dateTime.toISOString(),
        frequency: formData.frequency,
        has_alarm: formData.has_alarm,
      };

      const endpoint = editingReminder 
        ? API.ENDPOINTS.REMINDERS.UPDATE.replace(':id', editingReminder.id)
        : API.ENDPOINTS.REMINDERS.CREATE;

      const method = editingReminder ? 'PUT' : 'POST';

      const response = await fetchWithAuth(buildApiUrl(endpoint), {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedReminder = await response.json();

      // 🔔 AGREGAR: Programar notificación en web
      if (Platform.OS === 'web' && formData.has_alarm) {
        const timeoutId = await webNotificationService.scheduleReminder({
          id: savedReminder.id || Date.now(),
          title: formData.title,
          description: formData.description,
          date_time: dateTime.toISOString(),
          has_alarm: formData.has_alarm
        });

        if (timeoutId) {
          console.log('🔔 Notificación web programada');
        }
      }

      Alert.alert(
        'Éxito', 
        editingReminder ? 'Recordatorio actualizado' : 'Recordatorio creado' +
        (Platform.OS === 'web' && formData.has_alarm ? '\n🔔 ¡Te notificaremos cuando llegue la hora!' : '')
      );
      
      closeModal();
      loadReminders();
      loadStatistics();
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'No se pudo guardar el recordatorio');
    }
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder);
    const reminderDate = new Date(reminder.date_time);
    
    // Asegurar que las fechas sean válidas
    const validDate = isNaN(reminderDate.getTime()) ? new Date() : reminderDate;
    const validTime = isNaN(reminderDate.getTime()) ? new Date() : new Date(reminderDate);
    
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      date: validDate,
      time: validTime,
      frequency: reminder.frequency,
      has_alarm: reminder.has_alarm || false
    });
    setShowModal(true);
  };

  const deleteReminder = (id) => {
    console.log('🗑️ Attempting to delete reminder:', id); // Para debugging
    
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Starting delete process for reminder:', id);
              
              // Cancelar notificación web
              if (Platform.OS === 'web') {
                webNotificationService.cancelReminder(id);
                console.log('🔔 Web notification cancelled for reminder:', id);
              }

              const deleteUrl = buildApiUrl(API.ENDPOINTS.REMINDERS.DELETE.replace(':id', id));
              console.log('🌐 Delete URL:', deleteUrl);

              const response = await fetchWithAuth(deleteUrl, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              console.log('📡 Delete response status:', response.status);

              if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Delete error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              console.log('✅ Delete successful:', result);

              Alert.alert('✅ Éxito', 'Recordatorio eliminado');
              
              // Recargar datos
              await loadReminders();
              await loadStatistics();
              
            } catch (error) {
              console.error('❌ Error deleting reminder:', error);
              Alert.alert('❌ Error', `No se pudo eliminar el recordatorio: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const markAsSent = async (id) => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.REMINDERS.MARK_SENT.replace(':id', id)),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Alert.alert('Éxito', 'Recordatorio marcado como enviado');
      loadReminders();
      loadStatistics();
    } catch (error) {
      console.error('Error marking as sent:', error);
      Alert.alert('Error', 'No se pudo marcar como enviado');
    }
  };

  // 📧 Función para enviar email manual
  const sendReminderEmail = async (reminderId) => {
    try {
      Alert.alert(
        '📧 Enviar recordatorio',
        '¿Quieres enviar este recordatorio por correo ahora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar',
            onPress: async () => {
              try {
                const response = await fetchWithAuth(
                  buildApiUrl(API.ENDPOINTS.REMINDERS.SEND_EMAIL.replace(':id', reminderId)),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                  }
                );

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                Alert.alert('✅ Éxito', result.message || '¡Correo de recordatorio enviado!');
                loadReminders();
              } catch (error) {
                console.error('Error sending email:', error);
                Alert.alert('❌ Error', error.message || 'No se pudo enviar el correo');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 🔔 Función para próximos recordatorios
  const sendUpcomingNotification = async () => {
    try {
      const response = await fetchWithAuth(
        buildApiUrl(API.ENDPOINTS.REMINDERS.SEND_UPCOMING),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hours: 2 }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      Alert.alert('✅ Éxito', result.message || '¡Notificación enviada!');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('❌ Error', error.message || 'No se pudo enviar la notificación');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReminder(null);
    
    // Reinicializar con fechas válidas
    const defaultTime = new Date();
    defaultTime.setHours(12, 0, 0, 0);
    
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      time: defaultTime,
      frequency: 'once',
      has_alarm: false,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    await loadStatistics();
    setRefreshing(false);
  };

  // Date/Time picker handlers
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      // Asegurar que mantenemos la hora actual cuando cambiamos la fecha
      const newDate = new Date(selectedDate);
      if (formData.time) {
        newDate.setHours(formData.time.getHours());
        newDate.setMinutes(formData.time.getMinutes());
      }
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false);
    }
    if (selectedTime && event.type !== 'dismissed') {
      // Para web y móvil, asegurar que tenemos una fecha válida
      let timeToSet = selectedTime;
      
      if (Platform.OS === 'web') {
        // En web, selectedTime ya tiene la hora correcta establecida por handleChange
        timeToSet = selectedTime;
      } else {
        // En móvil, usar la fecha actual con la nueva hora
        timeToSet = new Date(formData.date);
        timeToSet.setHours(selectedTime.getHours());
        timeToSet.setMinutes(selectedTime.getMinutes());
        timeToSet.setSeconds(0);
      }
      
      setFormData(prev => ({ ...prev, time: timeToSet }));
    }
  };

  // Format functions
  const formatDate = (date) => {
    // Convertir a Date si es string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    // Convertir a Date si es string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false // Usar formato 24 horas
    });
  };

  const getStatusColor = (status) => {
    return status === 'pending' ? '#FF9800' : '#4CAF50';
  };

  const getStatusText = (status) => {
    return status === 'pending' ? 'Pendiente' : 'Enviado';
  };

  const getFrequencyText = (frequency) => {
    const frequencies = {
      once: 'Una vez',
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual'
    };
    return frequencies[frequency] || frequency;
  };

  // Helper function para obtener estadísticas de forma segura
  const getSafeStatValue = (statValue) => {
    if (typeof statValue === 'number') return String(statValue);
    if (typeof statValue === 'string') return statValue;
    return '0';
  };

  // Load data on mount
  useEffect(() => {
    loadReminders();
    loadStatistics();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadReminders();
  }, [filters]);

  return (
    <>
      <Head>
        <title>Recordatorios - AURA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          {/* Header con SVG */}
          {isLandscape ? (
            <LandscapeHeader styles={styles} />
          ) : (
            <PortraitHeader styles={styles} />
          )}

          {/* Título y estadísticas */}
          <View style={styles.contentWrapper}>
            <View style={styles.headerTitle}>
              <AuraText
                text={"Mis Recordatorios"}
                style={isLandscape ? styles.titleLandscape : styles.title}
              />
              
              {/* 🔔 AGREGAR ESTE BOTÓN */}
              <TouchableOpacity onPress={sendUpcomingNotification}>
                <Ionicons name="notifications-outline" size={24} color="#A44076" />
              </TouchableOpacity>
            </View>

            {/* Statistics Cards - Versión más robusta */}
            {statistics && (
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <AuraText 
                    text={getSafeStatValue(statistics.total)} 
                    style={styles.statNumber} 
                  />
                  <AuraText text="Total" style={styles.statLabel} />
                </View>
                <View style={styles.statCard}>
                  <AuraText 
                    text={getSafeStatValue(statistics.pending)} 
                    style={styles.statNumber} 
                  />
                  <AuraText text="Pendientes" style={styles.statLabel} />
                </View>
                <View style={styles.statCard}>
                  <AuraText 
                    text={getSafeStatValue(statistics.upcoming_today)} 
                    style={styles.statNumber} 
                  />
                  <AuraText text="Hoy" style={styles.statLabel} />
                </View>
              </View>
            )}

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterButton, filters.status === 'pending' && styles.filterButtonActive]}
                  onPress={() => setFilters({...filters, status: filters.status === 'pending' ? '' : 'pending'})}
                >
                  <AuraText text="Pendientes" style={styles.filterButtonText} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filters.status === 'sent' && styles.filterButtonActive]}
                  onPress={() => setFilters({...filters, status: filters.status === 'sent' ? '' : 'sent'})}
                >
                  <AuraText text="Enviados" style={styles.filterButtonText} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filters.status === '' && styles.filterButtonActive]}
                  onPress={() => setFilters({...filters, status: ''})}
                >
                  <AuraText text="Todos" style={styles.filterButtonText} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Contenido scrollable */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {reminders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <AuraText text="No tienes recordatorios" style={styles.emptyText} />
                <TouchableOpacity 
                  style={styles.createFirstButton} 
                  onPress={() => setShowModal(true)}
                >
                  <AuraText text="Crear tu primer recordatorio" style={styles.createFirstButtonText} />
                </TouchableOpacity>
              </View>
            ) : (
              reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderTitleContainer}>
                      <AuraText text={reminder.title} style={styles.reminderTitle} />
                      <View style={styles.badgesContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reminder.status) }]}>
                          <AuraText text={getStatusText(reminder.status)} style={styles.badgeText} />
                        </View>
                        <View style={styles.frequencyBadge}>
                          <AuraText text={getFrequencyText(reminder.frequency)} style={styles.badgeText} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.reminderActions}>
                      {reminder.has_alarm && (
                        <Ionicons name="alarm-outline" size={20} color="#A44076" />
                      )}
                      
                      {/* 📧 AGREGAR ESTE BOTÓN AQUÍ */}
                      {reminder.status === 'pending' && (
                        <TouchableOpacity onPress={() => sendReminderEmail(reminder.id)}>
                          <Ionicons name="mail-outline" size={20} color="#A44076" />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity onPress={() => editReminder(reminder)}>
                        <Ionicons name="pencil-outline" size={20} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteReminder(reminder.id)}>
                        <Ionicons name="trash-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.reminderInfo}>
                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTime}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <AuraText text={formatDate(reminder.date_time)} style={styles.dateTimeText} />
                      </View>
                      <View style={styles.dateTime}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <AuraText text={formatTime(reminder.date_time)} style={styles.dateTimeText} />
                      </View>
                    </View>
                    
                    {reminder.description && (
                      <AuraText text={reminder.description} style={styles.description} />
                    )}
                    
                    {reminder.status === 'pending' && (
                      <TouchableOpacity 
                        style={styles.markSentButton}
                        onPress={() => markAsSent(reminder.id)}
                      >
                        <AuraText text="Marcar como enviado" style={styles.markSentButtonText} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Botón flotante para agregar recordatorio */}
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>

          {/* Modal para crear/editar recordatorio */}
          <Modal
            visible={showModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={closeModal}
          >
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <AuraText 
                  text={editingReminder ? "Editar Recordatorio" : "Nuevo Recordatorio"} 
                  style={styles.modalTitle} 
                />
                <TouchableOpacity onPress={saveReminder}>
                  <AuraText text="Guardar" style={styles.saveButtonText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Título */}
                <View style={styles.formGroup}>
                  <AuraText text="Título *" style={styles.formLabel} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                    placeholder="Nombre del recordatorio"
                    maxLength={255}
                  />
                </View>

                {/* Descripción */}
                <View style={styles.formGroup}>
                  <AuraText text="Descripción" style={styles.formLabel} />
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                    placeholder="Descripción del recordatorio"
                    multiline
                    numberOfLines={3}
                    maxLength={255}
                  />
                </View>

                {/* Fecha y Hora */}
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeGroup}>
                    <AuraText text="Fecha *" style={styles.formLabel} />
                    <TouchableOpacity 
                      style={styles.dateTimeButton}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          // En web, no necesitamos mostrar/ocultar, el input se maneja automáticamente
                        } else {
                          setShowDatePicker(true);
                        }
                      }}
                    >
                      {Platform.OS === 'web' ? (
                        <CustomDateTimePicker
                          value={formData.date}
                          mode="date"
                          onChange={onDateChange}
                          minimumDate={new Date()} // Esto permite seleccionar desde hoy
                        />
                      ) : (
                        <>
                          <AuraText text={formatDate(formData.date)} style={styles.dateTimeButtonText} />
                          <Ionicons name="calendar-outline" size={20} color="#666" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateTimeGroup}>
                    <AuraText text="Hora *" style={styles.formLabel} />
                    <TouchableOpacity 
                      style={styles.dateTimeButton}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          // En web, no necesitamos mostrar/ocultar
                        } else {
                          setShowTimePicker(true);
                        }
                      }}
                    >
                      {Platform.OS === 'web' ? (
                        <CustomDateTimePicker
                          value={formData.time}
                          mode="time"
                          onChange={onTimeChange}
                        />
                      ) : (
                        <>
                          <AuraText text={formatTime(formData.time)} style={styles.dateTimeButtonText} />
                          <Ionicons name="time-outline" size={20} color="#666" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Frecuencia */}
                <View style={styles.formGroup}>
                  <AuraText text="Frecuencia" style={styles.formLabel} />
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.frequency}
                      onValueChange={(value) => setFormData({...formData, frequency: value})}
                      style={styles.picker}
                    >
                      <Picker.Item label="Una vez" value="once" />
                      <Picker.Item label="Diario" value="daily" />
                      <Picker.Item label="Semanal" value="weekly" />
                      <Picker.Item label="Mensual" value="monthly" />
                    </Picker>
                  </View>
                </View>

                {/* Alarma */}
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setFormData({...formData, has_alarm: !formData.has_alarm})}
                >
                  <Ionicons 
                    name={formData.has_alarm ? "checkbox" : "checkbox-outline"} 
                    size={24} 
                    color="#A44076" 
                  />
                  <AuraText text="Activar alarma" style={styles.checkboxLabel} />
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>

            {/* Date/Time Pickers - Solo para móvil */}
            {Platform.OS !== 'web' && showDatePicker && (
              <CustomDateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor="#000"
              />
            )}

            {Platform.OS !== 'web' && showTimePicker && (
              <CustomDateTimePicker
                value={formData.time}
                mode="time"
                display="default"
                onChange={onTimeChange}
                textColor="#000"
              />
            )}
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

// Mantén los componentes LandscapeHeader y PortraitHeader igual que antes
const LandscapeHeader = ({ styles }) => (
  <View style={styles.backgroundContainerLandscape}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="-200 -210 560 670"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.4) translate(180, -50)"
      />
    </Svg>
  </View>
);

const PortraitHeader = ({ styles }) => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 500 500"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.7) translate(100, -50)"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },
  headerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
  },
  titleLandscape: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
    marginLeft: 200,
  },
  
  // Statistics
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    minWidth: 80,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A44076",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },

  // Filters
  filtersContainer: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: "#A44076",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#666",
  },

  // Reminder cards
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reminderTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
  },
  badgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  reminderActions: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  reminderInfo: {
    gap: 10,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  markSentButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  markSentButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginVertical: 20,
    textAlign: "center",
  },
  createFirstButton: {
    backgroundColor: "#A44076",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Floating button
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A44076",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A44076",
  },
  saveButtonText: {
    color: "#A44076",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  dateTimeGroup: {
    flex: 1,
  },
  dateTimeButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },

  // Background styles
  backgroundContainer: {
    height: 250,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  backgroundContainerLandscape: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "80%",
    height: "90%",
    zIndex: 0,
    overflow: "hidden",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});