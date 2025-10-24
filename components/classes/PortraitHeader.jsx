import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export const PortraitHeader = () => (
  <View style={styles.backgroundContainer}>
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 500 500"
      style={styles.svg}
    >
      <Path
        d="M255.625 387.801C209.254 181.192 -160.246 23.1376 82.0284 -31.2381C324.303 -85.6138 756.693 147.292 499.715 406.644C292.867 538.783 474.159 720.291 259.299 690.506C56.814 617.548 301.996 594.41 255.625 387.801Z"
        fill="#CDAEC4"
        fillOpacity={0.67}
        transform="scale(0.7) translate(100, -50)"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  backgroundContainer: {
    height: 250,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
