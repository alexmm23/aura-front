import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { AuraText } from './AuraText';
import { Ionicons } from '@expo/vector-icons';

export const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'confirm'
  onClose,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'error': return { name: 'close-circle', color: '#f44336' };
      case 'warning': return { name: 'warning', color: '#FF9800' };
      case 'confirm': return { name: 'help-circle', color: '#A44076' };
      default: return { name: 'information-circle', color: '#2196F3' };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Ícono */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon.name} size={60} color={icon.color} />
          </View>

          {/* Título */}
          <AuraText text={title} style={styles.title} />

          {/* Mensaje */}
          <AuraText text={message} style={styles.message} />

          {/* Botones */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <AuraText text={cancelText} style={styles.cancelButtonText} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={() => {
                if (onConfirm) onConfirm();
                if (onClose) onClose();
              }}
            >
              <AuraText text={confirmText} style={styles.confirmButtonText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#A44076',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});