import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/Colors";

export const PortraitLayout = ({ children }) => {
  const colors = Colors.light;

  return (
    <>
      <View style={styles.backgroundContainer}>
        <Svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 349 371"
          style={styles.svg}
        >
          <Path
            d="M411.5 253.452C328 515.452 258 232.5 159 208C30 165 18 390 -31 191.5C-73 -27.5 64.1476 -74.5212 173.5 -74.5212C518 -134.5 291.5 215.452 411.5 253.452Z"
            fill={colors.purple}
          />
        </Svg>

        <View style={styles.headerContent}>
          <Image
            source={require("@/assets/images/login_students.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.formContainer}>{children}</View>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    height: 400,
    width: "100%",
    position: "relative",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  headerImage: {
    width: "90%",
    height: 250,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
