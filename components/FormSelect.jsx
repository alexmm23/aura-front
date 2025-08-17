import React, { useState, forwardRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { AuraText } from "./AuraText";

const FormSelect = forwardRef(
  (
    {
      placeholder,
      value,
      onValueChange,
      options = [],
      error = "",
      style,
      ...otherProps
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = Colors.light;
    const styles = createStyles(theme);

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (selectedValue) => {
      onValueChange?.(selectedValue);
      setIsOpen(false);
    };

    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          ref={ref}
          style={[styles.selectButton, error ? styles.errorBorder : null]}
          onPress={() => setIsOpen(true)}
          {...otherProps}
        >
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#919191"
          />
        </TouchableOpacity>

        {error ? (
          <AuraText
            style={styles.errorText}
            text={error}
            fontFamily="fredoka-light"
          />
        ) : null}

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Ionicons name="checkmark" size={20} color="#7752CC" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
);

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      width: "100%",
    },
    selectButton: {
      backgroundColor: theme.beige,
      borderRadius: 8,
      padding: 12,
      marginVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    errorBorder: {
      borderColor: "#FF5252",
    },
    selectText: {
      fontSize: 16,
      fontFamily: "fredoka-regular",
      color: "#333",
      flex: 1,
    },
    placeholderText: {
      color: "#a0a0a0",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginLeft: 4,
      marginTop: -6,
      marginBottom: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 8,
      width: "100%",
      maxWidth: 300,
      maxHeight: 300,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    optionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      marginVertical: 2,
    },
    selectedOption: {
      backgroundColor: "#f0ebff",
    },
    optionText: {
      fontSize: 16,
      fontFamily: "fredoka-regular",
      color: "#333",
      flex: 1,
    },
    selectedOptionText: {
      color: "#7752CC",
      fontWeight: "600",
    },
  });
};

FormSelect.displayName = "FormSelect";

export default FormSelect;
