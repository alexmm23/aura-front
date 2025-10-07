import { Text, StyleSheet, Platform } from "react-native";

export const AuraText = ({ fontFamily = "fredoka-regular", style, text }) => {
  return (
    <Text
      style={StyleSheet.flatten([
        Platform.select({
          web: {},
          default: { fontFamily },
        }),
        style,
      ])}
    >
      {text}
    </Text>
  );
};
