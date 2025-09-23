package com.fiveOps.promptforge.promptwars.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.argThat;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.fiveOps.promptforge.config.SimpleWebSocketHandler;
import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.user_profile.model.User;

public class WebSocketServiceTest {

  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private SimpleWebSocketHandler simpleWebSocketHandler;

  @InjectMocks private WebSocketService webSocketService;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void sendChallengeNotification_triesBothChannels() {
    UUID userId = UUID.randomUUID();
    Challenge c = new Challenge(UUID.randomUUID(), UUID.randomUUID(), null);
    User u = new User();
    u.setUsername("bob");

    webSocketService.sendChallengeNotification(userId, c, u);

  verify(messagingTemplate)
    .convertAndSendToUser(eq(userId.toString()), eq("/queue/challenges"),
      argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_RECEIVED") && ((java.util.Map<?,?>)obj).containsKey("challenge")));

  verify(simpleWebSocketHandler)
    .sendMessageToUser(eq(userId.toString()),
      argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_RECEIVED") && ((java.util.Map<?,?>)obj).containsKey("challenge")));
  }

  @Test
  public void sendGameUpdate_usesBothPathsEvenIfStompFails() {
    UUID userId = UUID.randomUUID();
    Map<String, Object> update = Map.of("type", "GAME_UPDATE");

    // simulate STOMP failure - use matchers for all args to avoid mixing raw values and matchers
    doThrow(new RuntimeException("stomp fail")).when(messagingTemplate)
      .convertAndSendToUser(org.mockito.ArgumentMatchers.eq(userId.toString()), org.mockito.ArgumentMatchers.eq("/queue/games"), org.mockito.ArgumentMatchers.eq(update));

    webSocketService.sendGameUpdate(userId, update);

    // should still attempt simple websocket
    verify(simpleWebSocketHandler).sendMessageToUser(userId.toString(), update);
  }

  @Test
  public void sendChallengeDeclined_sendsBothPaths() {
    UUID challenger = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    webSocketService.sendChallengeDeclined(challenger, challengeId);

    verify(messagingTemplate)
      .convertAndSendToUser(eq(challenger.toString()), eq("/queue/challenges"),
        argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_DECLINED") && ((java.util.Map<?,?>)obj).get("challengeId").equals(challengeId.toString())));

    verify(simpleWebSocketHandler)
      .sendMessageToUser(eq(challenger.toString()),
        argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_DECLINED") && ((java.util.Map<?,?>)obj).get("challengeId").equals(challengeId.toString())));
  }

  @Test
  public void sendChallengeExpired_sendsBothPaths() {
    UUID challenger = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    webSocketService.sendChallengeExpired(challenger, challengeId);

    verify(messagingTemplate)
      .convertAndSendToUser(eq(challenger.toString()), eq("/queue/challenges"),
        argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_EXPIRED") && ((java.util.Map<?,?>)obj).get("challengeId").equals(challengeId.toString())));

    verify(simpleWebSocketHandler)
      .sendMessageToUser(eq(challenger.toString()),
        argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("CHALLENGE_EXPIRED") && ((java.util.Map<?,?>)obj).get("challengeId").equals(challengeId.toString())));
  }

  @Test
  public void sendGameStartNotification_sendsToBothPathsAndHandlesStompFailure() {
    UUID player = UUID.randomUUID();
    UUID gameId = UUID.randomUUID();

    // Simulate STOMP throw - use matchers for all args to avoid mixing raw values and matchers
    doThrow(new RuntimeException("stomp fail")).when(messagingTemplate)
      .convertAndSendToUser(org.mockito.ArgumentMatchers.eq(player.toString()), org.mockito.ArgumentMatchers.eq("/queue/games"), org.mockito.ArgumentMatchers.any());

    webSocketService.sendGameStartNotification(player, gameId, "Alice", "Bob");

    verify(simpleWebSocketHandler).sendMessageToUser(eq(player.toString()), argThat(obj -> obj instanceof java.util.Map && ((java.util.Map<?,?>)obj).get("type").equals("GAME_STARTING")));
  }
}
