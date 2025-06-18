import { Platform } from "react-native";
import NotebookCanvasWeb from "./NotebookCanvasWeb";

const NotebookCanvas = (props) => {
  if (Platform.OS === "web") {
    return <NotebookCanvasWeb {...props} />;
  }
};

export default NotebookCanvas;
