import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E2D2",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },
  headerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
  },
  titleLandscape: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CB8D27",
    textAlign: "left",
    marginLeft: 200,
  },
});
