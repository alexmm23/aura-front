import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AuraText } from "@/components/AuraText";

export const LandscapeLayout = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Lado Izquierdo con Imagen y Texto */}
        <View style={styles.leftSide}>
          <Image
            source={require("@/assets/images/login_students.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Svg
            viewBox="0 0 550 561"
            preserveAspectRatio="none"
            style={styles.svg}
          >
            <Path
              d="M0 25C0 11.1929 11.1929 0 25 0H521.935C543.409 0 554.89 25.2886 540.755 41.4552L354.384 254.62C346.365 263.792 346.125 277.41 353.818 286.858L543.797 520.216C557.095 536.55 545.472 561 524.41 561H25C11.1929 561 0 549.807 0 536V25Z"
              fill="#7752CC"
            />
          </Svg>
          <AuraText style={styles.slogan}>Organiza, Estudia y Aprende</AuraText>
        </View>

        {/* Lado Derecho con formulario */}
        <View style={styles.rightSide}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#e4d7c2",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#e7e1cf",
    borderRadius: 27,
    overflow: "hidden",
    width: "85%",
    maxWidth: 1200,
    height: "85%",
    maxHeight: 700,
  },
  leftSide: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "85%",
    height: "80%",
    resizeMode: "contain",
    marginBottom: 20,
    zIndex: 2,
    position: "relative",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  slogan: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    position: "absolute",
    bottom: 40,
    zIndex: 2,
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
});
