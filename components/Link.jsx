import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Link({ title, onPress }) {
  const styles = createStyles();
  return (
    <TouchableOpacity onPress={onPress} style={styles.linkContainer}>
      <Text style={styles.linkText}>{title}</Text>
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
