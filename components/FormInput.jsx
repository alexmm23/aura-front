import { Text, TextInput, Appearance } from "react-native";
import { StyleSheet } from "react-native";

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  errorMessage = "",
}) {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === "dark";
  const styles = createStyles(theme);

  return (
    <>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#a0a0a0" // Light gray placeholder text
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    label: {
      fontSize: 16,
      color: theme.label,
      marginBottom: 3,
    },
    input: {
      backgroundColor: "#e4d7c2", // Beige input background
      borderRadius: 8,
      padding: 12,
      marginVertical: 4,
      fontSize: 16,
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
