import { Text } from "react-native";

export const AuraText = ({
  fontFamily = "fredoka-regular",
  style = {},
  text,
}) => {
  return (
    <Text
      style={{
        fontFamily,
        ...style,
      }}
    >
      {text}
    </Text>
  );
};
