package com.fiveOps.promptforge.config;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.user_profile.service.UserService;

@Component
public class SimpleWebSocketHandler extends TextWebSocketHandler {
  private final UserService userService;
  private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
  private final Map<String, Set<String>> gameRooms = new ConcurrentHashMap<>();
  private final ObjectMapper objectMapper = new ObjectMapper();

  public SimpleWebSocketHandler(UserService userService) {
    this.userService = userService;
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    String userId = getUserId(session);
    if (userId != null) {
      sessions.put(userId, session);
      System.out.println("WebSocket connection established for user: " + userId);
      userService.setActive(UUID.fromString(userId), true);
      // Send connection confirmation
      Map<String, Object> response = Map.of("type", "CONNECTED", "userId", userId);
      session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    String userId = getUserId(session);
    if (userId != null) {
      sessions.remove(userId);
      System.out.println("WebSocket connection closed for user: " + userId);
      userService.setActive(UUID.fromString(userId), false);
    }
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    try {
      Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
      String type = (String) payload.get("type");

      System.out.println("Received WebSocket message: " + type);

      // Handle different message types
      switch (type) {
        case "USER_CONNECT":
          handleUserConnect(session, payload);
          break;
        case "GET_USER_ONLINE_STATUS":
          getUserOnlineStatus(payload);
          break;
        case "JOIN_GAME_ROOM":
          handleJoinGameRoom(session, payload);
          break;
        case "LEAVE_GAME_ROOM":
          handleLeaveGameRoom(session, payload);
          break;
        case "GAME_CHAT":
          handleGameChat(payload);
          break;
        case "GAME_ACTION":
          handleGameAction(payload);
          break;
        default:
          System.out.println("Unknown message type: " + type);
      }
    } catch (Exception e) {
      System.err.println("Error processing WebSocket message: " + e.getMessage());
    }
  }

  private void handleUserConnect(WebSocketSession session, Map<String, Object> payload)
      throws IOException {
    String userId = (String) payload.get("userId");

    if (userId != null) {
      sessions.put(userId, session);

      Map<String, Object> response = Map.of("type", "USER_CONNECTED", "userId", userId);
      session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }
  }

  public void sendMessageToUser(String userId, Map<String, Object> message) {
    WebSocketSession session = sessions.get(userId);
    if (session != null && session.isOpen()) {
      try {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        System.out.println("Sent message to user " + userId + ": " + message.get("type"));
      } catch (IOException e) {
        System.err.println("Error sending message to user " + userId + ": " + e.getMessage());
      }
    } else {
      System.out.println("No active session for user: " + userId);
    }
  }

  private String getUserId(WebSocketSession session) {
    // Extract user ID from session attributes or query parameters
    // This is a simplified approach - in production you'd validate JWT tokens
    String query = session.getUri().getQuery();
    if (query != null && query.contains("userId=")) {
      return query.split("userId=")[1].split("&")[0];
    }
    return null;
  }

  private void handleJoinGameRoom(WebSocketSession session, Map<String, Object> payload) {
    String userId = (String) payload.get("userId");
    String gameId = (String) payload.get("gameId");
    if (userId != null && gameId != null) {
      // Add user to game room
      gameRooms.computeIfAbsent(gameId, k -> new HashSet<>()).add(userId);
      System.out.println("User " + userId + " joined game room: " + gameId);

      // Notify other players in the game room
      Map<String, Object> notification = new HashMap<>();
      notification.put("type", "USER_JOINED_GAME");
      notification.put("userId", userId);
      notification.put("gameId", gameId);
      sendToGameRoom(gameId, notification, userId);
    }
  }

  private void handleLeaveGameRoom(WebSocketSession session, Map<String, Object> payload) {
    String userId = (String) payload.get("userId");
    String gameId = (String) payload.get("gameId");
    if (userId != null && gameId != null) {
      // Remove user from game room
      Set<String> room = gameRooms.get(gameId);
      if (room != null) {
        room.remove(userId);
        if (room.isEmpty()) {
          gameRooms.remove(gameId);
        }
      }
      System.out.println("User " + userId + " left game room: " + gameId);
    }
  }

  private void handleGameChat(Map<String, Object> payload) {
    String gameId = (String) payload.get("gameId");
    String userId = (String) payload.get("userId");
    String message = (String) payload.get("message");

    if (gameId != null && userId != null && message != null) {
      // Broadcast chat message to all players in the game room
      Map<String, Object> chatMessage = new HashMap<>();
      chatMessage.put("type", "GAME_CHAT");
      chatMessage.put("gameId", gameId);
      chatMessage.put("userId", userId);
      chatMessage.put("message", message);
      chatMessage.put("timestamp", System.currentTimeMillis());

      sendToGameRoom(gameId, chatMessage, null); // Send to all players including sender
      System.out.println("Chat message in game " + gameId + " from " + userId + ": " + message);
    }
  }

  private void handleGameAction(Map<String, Object> payload) {
    String gameId = (String) payload.get("gameId");
    String action = (String) payload.get("action");

    if (gameId != null && action != null) {
      // Broadcast game action to all players in the game room
      Map<String, Object> actionMessage = new HashMap<>();
      actionMessage.put("type", "GAME_ACTION");
      actionMessage.put("gameId", gameId);
      actionMessage.put("action", action);
      actionMessage.put("data", payload.get("data"));

      sendToGameRoom(gameId, actionMessage, null);
      System.out.println("Game action in game " + gameId + ": " + action);
    }
  }

  private void sendToGameRoom(String gameId, Map<String, Object> message, String excludeUserId) {
    Set<String> room = gameRooms.get(gameId);
    if (room != null) {
      for (String userId : room) {
        if (excludeUserId == null || !userId.equals(excludeUserId)) {
          sendMessageToUser(userId, message);
        }
      }
    }
  }

  private void getUserOnlineStatus(Map<String, Object> payload) {
    String userId = (String) payload.get("userId");
    String otherUserId = (String) payload.get("otherUserId");
    Map<String, Object> actionMessage = new HashMap<>();
    actionMessage.put("type", "USER_ONLINE_STATUS");
    actionMessage.put("userId", otherUserId);
    actionMessage.put("isActive", sessions.get(otherUserId) != null);
    sendMessageToUser(userId, actionMessage);
  }
}
