import { Text, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors"; // Adjust the import path as necessary
import React, { forwardRef } from "react";
import { AuraText } from "./AuraText"; // Adjust the import path as necessary

const FormInput = React.forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      error = "",
      onSubmitEditing,
      returnKeyType = "next",
    },
    ref
  ) => {
    const theme = Colors.light;
    const styles = createStyles(theme);
    console.log("Error message:", error);

    return (
      <>
        {/* {label ? <Text style={styles.label}>{label}</Text> : null} */}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#a0a0a0" // Light gray placeholder text
          returnKeyType={returnKeyType} // Set the return key type
          onSubmitEditing={onSubmitEditing} // Handle moving to the next input
        />
        {error ? (
          <AuraText
            style={styles.errorText}
            text={error}
            fontFamily="fredoka-light"
          />
        ) : null}
      </>
    );
  }
);

export default FormInput;

function createStyles(theme) {
  return StyleSheet.create({
    label: {
      fontSize: 16,
      color: theme.label,
      marginBottom: 3,
      fontFamily: "fredoka-regular",
    },
    input: {
      backgroundColor: theme.beige, // Beige input background
      borderRadius: 8,
      padding: 12,
      marginVertical: 4,
      fontSize: 16,
      fontFamily: "fredoka-regular",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginLeft: 4,
      marginTop: -6,
      marginBottom: 6,
    },
  });
}
