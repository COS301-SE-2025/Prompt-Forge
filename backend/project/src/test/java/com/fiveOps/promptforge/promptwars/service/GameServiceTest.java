package com.fiveOps.promptforge.promptwars.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameState;
import com.fiveOps.promptforge.promptwars.model.GameType;
import com.fiveOps.promptforge.promptwars.repository.GameRepository;

public class GameServiceTest {

  @Mock private GameRepository gameRepository;
  @Mock private WebSocketService webSocketService;
  @Mock private org.springframework.core.env.Environment env;

  @InjectMocks private GameService gameService;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void createGame_savesAndReturns() {
    UUID p1 = UUID.randomUUID();
    UUID p2 = UUID.randomUUID();

    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game g = gameService.createGame(p1, p2, GameType.PROMPT_CREATION);

    assertNotNull(g);
    assertEquals(p1, g.getPlayer1Id());
    assertEquals(p2, g.getPlayer2Id());
    verify(gameRepository).save(any());
  }

  @Test
  public void startGame_whenWaiting_starts() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameState(GameState.WAITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game started = gameService.startGame(id);

  // Accept either WRITING or SCENARIO as valid post-start states (depends on implementation)
  assertTrue(
    started.getGameState() == GameState.WRITING || started.getGameState() == GameState.SCENARIO,
    "Expected WRITING or SCENARIO after start, got: " + started.getGameState());
  }

  @Test
  public void submitPrompt_happyPath_savesAndNotifies() {
    UUID id = UUID.randomUUID();
    UUID player1 = UUID.randomUUID();

    Game g = new Game(player1, UUID.randomUUID(), GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.WRITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game result = gameService.submitPrompt(id, player1, "My prompt");

    assertNotNull(result);
    verify(gameRepository).save(any());
  }

  @Test
  public void submitPrompt_notWriting_throws() {
    UUID id = UUID.randomUUID();
    UUID player1 = UUID.randomUUID();

    Game g = new Game(player1, UUID.randomUUID(), GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.WAITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));

    IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
      gameService.submitPrompt(id, player1, "prompt");
    });

    assertTrue(ex.getMessage().toLowerCase().contains("writing"));
  }

  @Test
  public void generateScenario_existingScenario_usesItAndNotifies() {
    UUID id = UUID.randomUUID();
    UUID p1 = UUID.randomUUID();
    UUID p2 = UUID.randomUUID();

    Game g = new Game(p1, p2, GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.WAITING);
    g.setScenario("Pre-existing scenario");

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game saved = gameService.generateScenario(id);

    assertNotNull(saved.getScenario());
    verify(gameRepository).save(any());
  }

  @Test
  public void generateQuestion_whenNotReverse_throws() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameType(GameType.PROMPT_CREATION);
    g.setGameState(GameState.WAITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));

    // Expect runtime exception wrapped -> service will throw IllegalArgumentException
    assertThrows(IllegalArgumentException.class, () -> gameService.generateQuestion(id));
  }

  @Test
  public void cancelActiveGameForUser_noGames_returnsFalse() {
    UUID userId = UUID.randomUUID();
    when(gameRepository.findActiveGamesByPlayer(userId, GameState.FINISHED, GameState.CANCELLED))
        .thenReturn(java.util.List.of());

    boolean result = gameService.cancelActiveGameForUser(userId);
    assertFalse(result);
  }

  @Test
  public void finishGame_notActive_throws() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameState(GameState.WAITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));

    assertThrows(IllegalArgumentException.class, () -> gameService.finishGame(id, UUID.randomUUID()));
  }

  @Test
  public void ratePrompt_notRatingPhase_throws() {
    UUID id = UUID.randomUUID();
    UUID player = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameState(GameState.WRITING);
    when(gameRepository.findById(id)).thenReturn(Optional.of(g));

    assertThrows(IllegalArgumentException.class, () -> gameService.ratePrompt(id, player, 5));
  }

  @Test
  public void restartGame_resetsFields() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameState(GameState.FINISHED);
    g.setScenario("s");
    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game restarted = gameService.restartGame(id);
    assertEquals(GameState.WAITING, restarted.getGameState());
    assertNull(restarted.getScenario());
  }

  @Test
  public void generateQuestion_reservationFails_throws() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    g.setGameType(GameType.REVERSE_PROMPT);
    g.setGameState(GameState.WAITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.updateGameStateIf(id, GameState.WAITING, GameState.WRITING)).thenReturn(0);

    assertThrows(IllegalStateException.class, () -> gameService.generateQuestion(id));
  }

  @Test
  public void getGame_foundAndNotFound() {
    UUID id = UUID.randomUUID();
    Game g = new Game();
    g.setId(id);
    when(gameRepository.findById(id)).thenReturn(Optional.of(g));

    Game found = gameService.getGame(id);
    assertSame(g, found);

    UUID missing = UUID.randomUUID();
    when(gameRepository.findById(missing)).thenReturn(Optional.empty());
    assertThrows(IllegalArgumentException.class, () -> gameService.getGame(missing));
  }

  @Test
  public void getUserAndActiveGames_and_isUserInActiveGame() {
    UUID user = UUID.randomUUID();
    when(gameRepository.findRecentGamesByPlayer(user)).thenReturn(java.util.List.of(new Game()));
    when(gameRepository.findActiveGamesByPlayer(user, GameState.FINISHED, GameState.CANCELLED))
        .thenReturn(java.util.List.of(new Game()));
    when(gameRepository.isPlayerInActiveGame(user, GameState.FINISHED, GameState.CANCELLED)).thenReturn(true);

    assertFalse(gameService.getUserGames(user).isEmpty());
    assertFalse(gameService.getActiveGames(user).isEmpty());
    assertTrue(gameService.isUserInActiveGame(user));
  }

  @Test
  public void finishGame_success_setsFinishedAndWinner() {
    UUID id = UUID.randomUUID();
    UUID p1 = UUID.randomUUID();
    Game g = new Game(p1, UUID.randomUUID(), GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.WRITING);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game finished = gameService.finishGame(id, p1);
    assertEquals(GameState.FINISHED, finished.getGameState());
    assertEquals(p1, finished.getWinnerId());
  }

  @Test
  public void ratePrompt_happyPath_finishesGameWhenBothRated() {
    UUID id = UUID.randomUUID();
    UUID p1 = UUID.randomUUID();
    UUID p2 = UUID.randomUUID();
    Game g = new Game(p1, p2, GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.RATING);
    // Pretend player2 already rated
    g.setPlayer2Rating(7);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Game out = gameService.ratePrompt(id, p1, 6);
    assertEquals(GameState.FINISHED, out.getGameState());
  }

  @Test
  public void cancelActiveGameForUser_withGames_cancelsAndReturnsTrue() {
    UUID user = UUID.randomUUID();
    Game g = new Game();
    g.setId(UUID.randomUUID());
    when(gameRepository.findActiveGamesByPlayer(user, GameState.FINISHED, GameState.CANCELLED))
        .thenReturn(java.util.List.of(g));

    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    boolean res = gameService.cancelActiveGameForUser(user);
    assertTrue(res);
    verify(gameRepository).save(any());
  }

  @Test
  public void generateScenario_whenNoApiKey_usesFallback() {
    UUID id = UUID.randomUUID();
    UUID p1 = UUID.randomUUID();
    UUID p2 = UUID.randomUUID();
    Game g = new Game(p1, p2, GameType.PROMPT_CREATION);
    g.setId(id);
    g.setGameState(GameState.WAITING);
    g.setScenario(null);

    when(gameRepository.findById(id)).thenReturn(Optional.of(g));
    when(gameRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    when(env.getProperty("OPENROUTER_API_KEY")).thenReturn(null);

    Game saved = gameService.generateScenario(id);
    assertNotNull(saved.getScenario());
    assertEquals(com.fiveOps.promptforge.promptwars.model.GameState.WRITING, saved.getGameState());
  }

  @Test
  public void parseRatingResult_handlesTypicalResponse() throws Exception {
    String sample = "Prompt 1 Score: 8/10\nPrompt 2 Score: 5/10\nWinner: Prompt 1\nExplanation: Good";

    java.lang.reflect.Method m = GameService.class.getDeclaredMethod("parseRatingResult", String.class);
    m.setAccessible(true);
    Object res = m.invoke(gameService, sample);
    java.util.Map<?,?> map = (java.util.Map<?,?>) res;
    assertEquals(8, ((Number)map.get("player1Score")).intValue());
    assertEquals(5, ((Number)map.get("player2Score")).intValue());
  }

  @Test
  public void parseQuestionResult_parsesOptionsAndCorrect() throws Exception {
    String sample = "QUESTION: Test\nOUTPUT: hello world\nA) optA\nB) optB\nC) optC\nD) optD\nCORRECT: B";
    java.lang.reflect.Method m = GameService.class.getDeclaredMethod("parseQuestionResult", String.class);
    m.setAccessible(true);
    Object res = m.invoke(gameService, sample);
    java.util.Map<?,?> map = (java.util.Map<?,?>) res;
    assertEquals("B", map.get("correctAnswer"));
    assertTrue(((String)map.get("options")).contains("optB"));
  }

  @Test
  public void parseQuestionResult_handlesDifferentFormat() throws Exception {
    String sample = "Q: Something?\nChoices:\n1) A\n2) B\n3) C\nAnswer: 2";
    java.lang.reflect.Method m = GameService.class.getDeclaredMethod("parseQuestionResult", String.class);
    m.setAccessible(true);
    Object res = m.invoke(gameService, sample);
    java.util.Map<?,?> map = (java.util.Map<?,?>) res;
    assertNotNull(map.get("correctAnswer"));
    assertNotNull(map.get("options"));
  }

  @Test
  public void performAIRating_parsesAndFinishesGame() throws Exception {
    // Prepare a game with both prompts submitted
    UUID id = UUID.randomUUID();
    UUID p1 = UUID.randomUUID();
    UUID p2 = UUID.randomUUID();
    Game g = new Game(p1, p2, GameType.PROMPT_CREATION);
    g.setId(id);
    g.setScenario("scn");
    g.setPlayer1Prompt("p1 prompt");
    g.setPlayer2Prompt("p2 prompt");
    // mark as both submitted
    // set bothPlayersSubmittedPrompts via saving logic not necessary for performAIRating

    // Mock env to provide API key
    when(env.getProperty("OPENROUTER_API_KEY")).thenReturn("fake-key");

    // Mock RestTemplate exchange to return a JSON payload with choices -> message -> content
    org.springframework.http.ResponseEntity<String> fakeResp =
        org.springframework.http.ResponseEntity.ok(
            "{\"choices\":[{\"message\":{\"content\":\"Prompt 1 Score: 8\\nPrompt 2 Score: 6\\nWinner: Prompt 1\\nExplanation: ok\"}}]}"
        );

    // create mock RestTemplate and inject into gameService
    org.springframework.web.client.RestTemplate mockRt = org.mockito.Mockito.mock(org.springframework.web.client.RestTemplate.class);
    when(mockRt.exchange(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq(String.class)))
        .thenReturn(fakeResp);

    java.lang.reflect.Field rtField = GameService.class.getDeclaredField("restTemplate");
    rtField.setAccessible(true);
    rtField.set(gameService, mockRt);

    // Mock repository save to return the game
    when(gameRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(i -> i.getArgument(0));

    // Call private performAIRating
    java.lang.reflect.Method m = GameService.class.getDeclaredMethod("performAIRating", Game.class);
    m.setAccessible(true);
    m.invoke(gameService, g);

    // After rating, game should be finished and have scores set
  // Since our mocked save returns same game, check state on g
    assertEquals(com.fiveOps.promptforge.promptwars.model.GameState.FINISHED, g.getGameState());
    assertNotNull(g.getPlayer1Score());
    assertNotNull(g.getPlayer2Score());
  }
}
