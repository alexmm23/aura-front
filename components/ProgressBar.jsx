import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressBar = ({ progress, color }) => {
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.bar, 
          { 
            width: `${progress * 100}%`,
            backgroundColor: color || '#4CAF50' // Color verde por defecto
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ProgressBar;