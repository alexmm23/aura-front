import React from "react";
import ChatScreen from "@/components/chat/ChatScreen";

export default function Chats() {
  return (
    <ChatScreen
      userRole="teacher"
      modalUserType="teacher"
      modalTitle="Seleccionar Estudiante"
      screenTitle="Mis Chats"
    />
  );
}
