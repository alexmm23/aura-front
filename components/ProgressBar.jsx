import { AuraText } from "./AuraText";
import { View } from "react-native";
export default function ProgressBar({ progress, passwordStrength }) {
  const passwordStrengthColor = (strength) => {
    if (strength < 0.5) return "red";
    if (strength < 0.8) return "orange";
    return "green";
  };

  const passwordStrengthText = (strength) => {
    if (strength < 0.5) return "Contraseña débil";
    if (strength < 0.8) return "Contraseña media";
    return "Contraseña fuerte";
  };
  const progressWidth = `${progress * 100}%`;

  return (
    <>
      <AuraText
        style={{
          fontSize: 12,
          color: passwordStrengthColor(passwordStrength),
        }}
        text={passwordStrengthText(passwordStrength)}
      />
      <View
        style={{
          height: 10,
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: 5,
          marginVertical: 10,
        }}
      >
        <View
          style={{
            height: "100%",
            width: progressWidth,
            backgroundColor: passwordStrengthColor(passwordStrength),
            borderRadius: 5,
          }}
        />
      </View>
    </>
  );
}
