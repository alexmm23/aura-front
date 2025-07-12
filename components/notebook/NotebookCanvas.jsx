import { Platform } from "react-native";
import NotebookCanvasWeb from "./NotebookCanvasWeb";
import NotebookCanvasNative from "./NotebookCanvasNative";

const NotebookCanvas = (props) => {
  if (Platform.OS === "web") {
    return <NotebookCanvasWeb {...props} />;
  } else{
    return <NotebookCanvasNative {...props} />;
  }
};

export default NotebookCanvas;
