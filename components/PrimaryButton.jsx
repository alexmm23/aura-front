import { TouchableOpacity } from "react-native";
import { StyleSheet, Appearance } from "react-native";
import { Colors } from "@/constants/Colors";
import { AuraText } from "./AuraText"; // Adjust the import path as necessary

export default function PrimaryButton({ title, onPress, disabled = false }) {
  const colorScheme = Appearance.getColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.button, disabled ? styles.disabledButton : styles.button]}
      onPress={onPress}
      disabled={disabled}
    >
      <AuraText style={styles.buttonText} text={title} />
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    disabledButton: {
      backgroundColor: theme.disabledOrange,
    },
    button: {
      backgroundColor: theme.orange,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
