package com.fiveOps.promptforge.promptwars.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import com.fiveOps.promptforge.promptwars.dto.ChallengeRequest;
import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.promptwars.service.ChallengeService;

public class PromptWarsChallengeControllerTest {

  @Mock private ChallengeService challengeService;

  @InjectMocks private PromptWarsChallengeController controller;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void sendChallenge_happyPath_returnsChallenge() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();
    ChallengeRequest req = new ChallengeRequest();
    req.setOpponentId(opponent);
    req.setMessage("Let's battle");

    Challenge c = new Challenge();
    c.setChallengerId(challenger);
    c.setOpponentId(opponent);

    when(challengeService.sendChallenge(any(), any(), any(), any())).thenReturn(c);

  ResponseEntity<?> resp = controller.sendChallenge(challenger, req);

  assertEquals(200, resp.getStatusCode().value());
    assertTrue(resp.getBody() instanceof Challenge);
  }

  @Test
  public void acceptChallenge_notFound_throwsBadRequest() {
    // Simulate service throwing IllegalArgumentException
    UUID challengeId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();

    when(challengeService.acceptChallenge(any(), any())).thenThrow(new IllegalArgumentException("no"));

    ResponseEntity<?> resp = controller.acceptChallenge(challengeId, playerId);
    assertTrue(resp.getStatusCode().is4xxClientError());
  }

  @Test
  public void declineChallenge_serviceError_returnsServerError() {
    UUID challengeId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();

    // make service throw
  doThrow(new RuntimeException("boom")).when(challengeService).declineChallenge(any(), any());

  // The controller method wraps exceptions, call and assert 500
  ResponseEntity<?> resp = controller.declineChallenge(challengeId, playerId);
  assertEquals(500, resp.getStatusCode().value());
  }

  @Test
  public void getUserChallenges_returnsList() {
    UUID userId = UUID.randomUUID();
    when(challengeService.getUserChallenges(userId)).thenReturn(List.of(new Challenge()));

    ResponseEntity<?> resp = controller.getUserChallenges(userId);
    assertEquals(200, resp.getStatusCode().value());
    assertTrue(resp.getBody() instanceof List);
  }
}
