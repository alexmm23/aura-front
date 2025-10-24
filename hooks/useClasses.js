import { useState, useEffect } from "react";
import { API } from "@/config/api";
import { apiGet } from "../utils/fetchWithAuth";
import Toast from "react-native-toast-message";

export const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiGet(API.ENDPOINTS.STUDENT.COURSES);

      if (!response.ok) {
        const data = await response.json();

        if (data.error === "No Google account linked") {
          // Mostrar mensaje específico para cuenta no linkeada
          // Toast.show({
          //   type: "info",
          //   text1: "Cuenta de Google no vinculada",
          //   text2: "Vincula tu cuenta para ver tus clases",
          // });
          setClasses([]);
          return;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Classes data:", data);
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      Toast.show({
        type: "error",
        text1: "Error al cargar clases",
        text2: "No se pudieron cargar tus clases",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    refetch: fetchClasses,
  };
};
