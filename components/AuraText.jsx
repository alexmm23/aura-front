import { Text, StyleSheet, Platform } from "react-native";

export const AuraText = ({
  children,
  fontFamily = "fredoka-regular",
  style,
  text,
  ...props
}) => {
  const content = children !== undefined ? children : text;

  return (
    <Text
      {...props}
      style={StyleSheet.flatten([
        Platform.select({
          web: {},
          default: { fontFamily },
        }),
        style,
      ])}
    >
      {content}
    </Text>
  );
};
