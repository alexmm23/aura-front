import { TouchableOpacity, StyleSheet } from "react-native";
import { AuraText } from "./AuraText"; // Adjust the import path as necessary

export default function Link({ title, onPress }) {
  const styles = createStyles();
  return (
    <TouchableOpacity onPress={onPress} style={styles.linkContainer}>
      <AuraText style={styles.linkText} text={title} />
    </TouchableOpacity>
  );
}

function createStyles() {
  return StyleSheet.create({
    linkContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      color: "#9068d9", // Purple link text
      fontSize: 14,
    },
  });
}
