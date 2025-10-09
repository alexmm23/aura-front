import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { AuraText } from "@/components/AuraText";
import { MaterialIcons } from "@expo/vector-icons";
import { useUsers } from "../hooks/useUsers";

export const UserSelectionModal = ({
  visible,
  onClose,
  onUserSelect,
  userType = "student",
  title,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, loading, searchUsers, fetchUsers } = useUsers(userType);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      fetchUsers();
    }
  };

  const handleUserSelect = (user) => {
    onUserSelect(user);
    onClose();
    setSearchQuery("");
  };

  const getStatusText = (user) => {
    if (user.isOnline) {
      return "En línea";
    } else if (user.lastSeen) {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffInHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return "Hace unos minutos";
      } else if (diffInHours < 24) {
        return `Hace ${diffInHours} horas`;
      } else {
        return `Hace ${Math.floor(diffInHours / 24)} días`;
      }
    }
    return "Desconectado";
  };

  const getStatusColor = (user) => {
    return user.isOnline ? "#4CAF50" : "#999";
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </Pressable>
          <AuraText style={styles.title}>
            {title ||
              (userType === "teacher"
                ? "Seleccionar Estudiante"
                : "Seleccionar Profesor")}
          </AuraText>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar ${
              userType === "teacher" ? "estudiantes" : "profesores"
            }...`}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => handleSearch("")}
              style={styles.clearButton}
            >
              <MaterialIcons name="clear" size={20} color="#999" />
            </Pressable>
          )}
        </View>

        {/* Users List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <AuraText style={styles.loadingText}>Cargando usuarios...</AuraText>
          </View>
        ) : (
          <ScrollView style={styles.usersList}>
            {users.map((user) => (
              <Pressable
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserSelect(user)}
              >
                <View style={styles.userAvatar}>
                  <AuraText style={styles.avatarText}>{user.avatar}</AuraText>
                  {user.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.userInfo}>
                  <AuraText style={styles.userName}>{user.name}</AuraText>
                  {user.email && (
                    <AuraText style={styles.userEmail}>{user.email}</AuraText>
                  )}
                  {user.department && (
                    <AuraText style={styles.userDepartment}>
                      {user.department}
                    </AuraText>
                  )}
                  <AuraText
                    style={[styles.userStatus, { color: getStatusColor(user) }]}
                  >
                    {getStatusText(user)}
                  </AuraText>
                </View>

                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </Pressable>
            ))}

            {users.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <MaterialIcons name="person-search" size={48} color="#999" />
                <AuraText style={styles.emptyText}>
                  {searchQuery
                    ? "No se encontraron usuarios"
                    : "No hay usuarios disponibles"}
                </AuraText>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  avatarText: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});
