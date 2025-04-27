import { TextInput } from "react-native";

export const AuraTextInput = ({
  fontFamily = "fredoka-regular",
  style = {},
  ...props
}) => {
  return (
    <TextInput
      style={{
        fontFamily,
        ...style,
      }}
      {...props}
    />
  );
};