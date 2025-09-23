package com.fiveOps.promptforge.promptwars.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.service.GameService;

public class PromptWarsGameControllerTest {

  @Mock private GameService gameService;

  @InjectMocks private PromptWarsGameController controller;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void getGame_returnsGame() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    when(gameService.getGame(id)).thenReturn(g);

    ResponseEntity<Game> resp = controller.getGame(id.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertSame(g, resp.getBody());
  }

  @Test
  public void startGame_endpoint_returnsOk() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    when(gameService.getGame(id)).thenReturn(g);

    ResponseEntity<Game> resp = controller.startGame(id.toString(), Map.of());
    assertEquals(200, resp.getStatusCode().value());
  }

  @Test
  public void restartGame_endpoint_callsService() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    when(gameService.restartGame(id)).thenReturn(g);

    ResponseEntity<Game> resp = controller.restartGame(id.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertSame(g, resp.getBody());
  }

  @Test
  public void generateScenario_endpoint_returnsScenario() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setScenario("hey");
    when(gameService.generateScenario(id)).thenReturn(g);

    ResponseEntity<Map<String, String>> resp = controller.generateScenario(id.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertEquals("hey", resp.getBody().get("scenario"));
  }

  @Test
  public void submitPrompt_missingHeader_returns500() {
    UUID id = UUID.randomUUID();
    ResponseEntity<Void> resp = controller.submitPrompt(id.toString(), Map.of("prompt","x"), null);
    assertEquals(500, resp.getStatusCode().value());
  }

  @Test
  public void ratePrompt_missingHeader_returns500() {
    UUID id = UUID.randomUUID();
    ResponseEntity<Void> resp = controller.ratePrompt(id.toString(), Map.of("rating",5), null);
    assertEquals(500, resp.getStatusCode().value());
  }

  @Test
  public void getGameState_returnsMap() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    when(gameService.getGame(id)).thenReturn(g);

    ResponseEntity<Map<String, Object>> resp = controller.getGameState(id.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertTrue(resp.getBody().containsKey("game"));
  }

  @Test
  public void getMyGames_returnsEmptyList() {
    ResponseEntity<java.util.List<Game>> resp = controller.getMyGames();
    assertEquals(200, resp.getStatusCode().value());
    assertTrue(resp.getBody().isEmpty());
  }

  @Test
  public void getActiveGames_returnsList() {
    UUID userId = UUID.randomUUID();
    when(gameService.getActiveGames(userId)).thenReturn(java.util.List.of(new Game()));

    ResponseEntity<java.util.List<Game>> resp = controller.getActiveGames(userId.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertFalse(resp.getBody().isEmpty());
  }

  @Test
  public void forfeitGame_stub_returnsOk() {
    UUID id = UUID.randomUUID();
    ResponseEntity<Void> resp = controller.forfeitGame(id.toString());
    assertEquals(200, resp.getStatusCode().value());
  }

  @Test
  public void cancelActiveGame_returnsOkWhenCancelled() {
    UUID userId = UUID.randomUUID();
    when(gameService.cancelActiveGameForUser(userId)).thenReturn(true);

    ResponseEntity<?> resp = controller.cancelActiveGame(userId.toString());
    assertEquals(200, resp.getStatusCode().value());
  }

  @Test
  public void cancelActiveGame_returnsNotFoundWhenNone() {
    UUID userId = UUID.randomUUID();
    when(gameService.cancelActiveGameForUser(userId)).thenReturn(false);

    ResponseEntity<?> resp = controller.cancelActiveGame(userId.toString());
    assertEquals(404, resp.getStatusCode().value());
  }

  @Test
  public void generateQuestion_okAndBadRequest() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setCurrentQuestion("q");
    g.setCurrentOutput("o");
    g.setCurrentOptions("[\"a\"]");
    g.setQuestionNumber(1);
    g.setGameState(com.fiveOps.promptforge.promptwars.model.GameState.WRITING);

    when(gameService.generateQuestion(id)).thenReturn(g);

    ResponseEntity<Map<String, Object>> resp = controller.generateQuestion(id.toString());
    assertEquals(200, resp.getStatusCode().value());

    // simulate IllegalArgumentException
    when(gameService.generateQuestion(id)).thenThrow(new IllegalArgumentException("not reverse"));
    ResponseEntity<Map<String, Object>> resp2 = controller.generateQuestion(id.toString());
    assertEquals(400, resp2.getStatusCode().value());
  }

  @Test
  public void submitAnswer_okAndBadRequest() {
    UUID id = UUID.randomUUID();
    UUID player = UUID.randomUUID();
    Game g = new Game();
    g.setGameState(com.fiveOps.promptforge.promptwars.model.GameState.WRITING);
    g.setPlayer1CorrectAnswers(0);
    g.setPlayer2CorrectAnswers(0);
    g.setQuestionNumber(1);
    when(gameService.submitAnswer(id, player, "A")).thenReturn(g);

    ResponseEntity<Map<String, Object>> resp = controller.submitAnswer(id.toString(), Map.of("answer","A"), player.toString());
    assertEquals(200, resp.getStatusCode().value());

    when(gameService.submitAnswer(id, player, "A")).thenThrow(new IllegalArgumentException("bad"));
    ResponseEntity<Map<String, Object>> resp2 = controller.submitAnswer(id.toString(), Map.of("answer","A"), player.toString());
    assertEquals(400, resp2.getStatusCode().value());
  }

  @Test
  public void generateScenario_returnsScenarioMap() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setScenario("You are trapped in a haunted data center");

    when(gameService.generateScenario(id)).thenReturn(g);

    ResponseEntity<Map<String, String>> resp = controller.generateScenario(id.toString());
    assertEquals(200, resp.getStatusCode().value());
    assertNotNull(resp.getBody().get("scenario"));
  }

  @Test
  public void submitPrompt_missingUser_500() {
    UUID id = UUID.randomUUID();
    when(gameService.submitPrompt(any(), any(), any())).thenThrow(new RuntimeException("no user header"));

    ResponseEntity<Void> resp = controller.submitPrompt(id.toString(), Map.of("prompt", "hello"), null);
    assertEquals(500, resp.getStatusCode().value());
  }
}
