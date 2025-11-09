import React from "react";
import ChatScreen from "@/components/chat/ChatScreen";

export default function Chats() {
  return (
    <ChatScreen
      userRole="student"
      modalUserType="student"
      modalTitle="Seleccionar Profesor"
      screenTitle="Chats"
    />
  );
}
