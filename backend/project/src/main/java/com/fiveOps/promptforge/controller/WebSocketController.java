package com.fiveOps.promptforge.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

  @Autowired private SimpMessagingTemplate messagingTemplate;

  @MessageMapping("/connect")
  @SendTo("/topic/connections")
  public Map<String, Object> handleConnection(Map<String, Object> message) {
    System.out.println("User connected: " + message.get("userId"));
    return Map.of(
        "type", "USER_CONNECTED",
        "userId", message.get("userId"),
        "timestamp", System.currentTimeMillis());
  }

  @MessageMapping("/challenge")
  public void handleChallenge(Map<String, Object> challengeData) {
    String opponentId = (String) challengeData.get("opponentId");
    String challengerId = (String) challengeData.get("challengerId");

    // Send challenge notification to specific user
    messagingTemplate.convertAndSendToUser(
        opponentId,
        "/queue/challenges",
        Map.of(
            "type", "CHALLENGE_RECEIVED",
            "challengerId", challengerId,
            "challengerName", challengeData.get("challengerName"),
            "message", challengeData.get("message"),
            "timestamp", System.currentTimeMillis()));
  }

  @MessageMapping("/challenge/accept")
  public void handleChallengeAccept(Map<String, Object> acceptData) {
    String challengerId = (String) acceptData.get("challengerId");
    String accepterId = (String) acceptData.get("accepterId");

    // Notify challenger that challenge was accepted
    messagingTemplate.convertAndSendToUser(
        challengerId,
        "/queue/challenges",
        Map.of(
            "type", "CHALLENGE_ACCEPTED",
            "accepterId", accepterId,
            "accepterName", acceptData.get("accepterName"),
            "gameId", generateGameId(),
            "timestamp", System.currentTimeMillis()));
  }

  private String generateGameId() {
    return "game_" + System.currentTimeMillis();
  }
}
