package com.fiveOps.promptforge.promptwars.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.config.SimpleWebSocketHandler;
import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.user_profile.model.User;

@Service
public class WebSocketService {

  @Autowired private SimpMessagingTemplate messagingTemplate;

  @Autowired private SimpleWebSocketHandler simpleWebSocketHandler;

  public void sendChallengeNotification(UUID userId, Challenge challenge, User challenger) {
    Map<String, Object> challengeData = new HashMap<>();
    challengeData.put("id", challenge.getId().toString());
    challengeData.put("challengerId", challenge.getChallengerId().toString());
    challengeData.put("challengerName", challenger.getUsername());
    challengeData.put("message", challenge.getMessage() != null ? challenge.getMessage() : "");
    challengeData.put("createdAt", challenge.getCreatedAt().toString());

    Map<String, Object> notification = new HashMap<>();
    notification.put("type", "CHALLENGE_RECEIVED");
    notification.put("challenge", challengeData);

    // Try both STOMP and simple WebSocket
    try {
      messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/challenges", notification);
    } catch (Exception e) {
      System.err.println("STOMP send failed: " + e.getMessage());
    }

    // Also try simple WebSocket
    simpleWebSocketHandler.sendMessageToUser(userId.toString(), notification);

    System.out.println("Sent challenge notification to user: " + userId);
  }

  public void sendChallengeDeclined(UUID challengerId, UUID challengeId) {
    Map<String, Object> notification =
        Map.of("type", "CHALLENGE_DECLINED", "challengeId", challengeId.toString());

    // Try both STOMP and simple WebSocket
    try {
      messagingTemplate.convertAndSendToUser(
          challengerId.toString(), "/queue/challenges", notification);
    } catch (Exception e) {
      System.err.println("STOMP send failed: " + e.getMessage());
    }

    simpleWebSocketHandler.sendMessageToUser(challengerId.toString(), notification);

    System.out.println("Sent challenge declined notification to user: " + challengerId);
  }

  public void sendChallengeExpired(UUID challengerId, UUID challengeId) {
    Map<String, Object> notification =
        Map.of("type", "CHALLENGE_EXPIRED", "challengeId", challengeId.toString());

    // Try both STOMP and simple WebSocket
    try {
      messagingTemplate.convertAndSendToUser(
          challengerId.toString(), "/queue/challenges", notification);
    } catch (Exception e) {
      System.err.println("STOMP send failed: " + e.getMessage());
    }

    simpleWebSocketHandler.sendMessageToUser(challengerId.toString(), notification);

    System.out.println("Sent challenge expired notification to user: " + challengerId);
  }

  public void sendGameStartNotification(
      UUID playerId, UUID gameId, String challengerName, String opponentName) {
    Map<String, Object> notification =
        Map.of(
            "type",
            "GAME_STARTING",
            "gameId",
            gameId.toString(),
            "challengerName",
            challengerName,
            "opponentName",
            opponentName);

    // Try both STOMP and simple WebSocket
    try {
      messagingTemplate.convertAndSendToUser(playerId.toString(), "/queue/games", notification);
    } catch (Exception e) {
      System.err.println("STOMP send failed: " + e.getMessage());
    }

    simpleWebSocketHandler.sendMessageToUser(playerId.toString(), notification);

    System.out.println(
        "Sent game start notification to user: "
            + playerId
            + " for game: "
            + gameId
            + " between "
            + challengerName
            + " and "
            + opponentName);
  }

  public void sendGameUpdate(UUID playerId, Map<String, Object> gameUpdate) {
    // Try both STOMP and simple WebSocket
    try {
      messagingTemplate.convertAndSendToUser(playerId.toString(), "/queue/games", gameUpdate);
    } catch (Exception e) {
      System.err.println("STOMP send failed: " + e.getMessage());
    }

    simpleWebSocketHandler.sendMessageToUser(playerId.toString(), gameUpdate);

    System.out.println("Sent game update to user: " + playerId + " - " + gameUpdate.get("type"));
  }
}
