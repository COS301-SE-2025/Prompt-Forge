package com.fiveOps.promptforge.promptwars.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameState;
import com.fiveOps.promptforge.promptwars.model.GameType;
import com.fiveOps.promptforge.promptwars.repository.GameRepository;

@Service
@Transactional
public class GameService {

  @Autowired private GameRepository gameRepository;

  @Autowired private WebSocketService webSocketService;

  @Autowired private Environment env;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();
  // In-memory guard to avoid duplicate simultaneous generation requests in this JVM
  private final java.util.Set<java.util.UUID> generationLocks =
      java.util.concurrent.ConcurrentHashMap.newKeySet();
  // In-memory guard to avoid duplicate simultaneous finalization/rating requests
  private final java.util.Set<java.util.UUID> finalizationLocks =
      java.util.concurrent.ConcurrentHashMap.newKeySet();

  @Value("${openrouter.base.url:https://openrouter.ai/api/v1}")
  private String openRouterBaseUrl;

  public Game createGame(UUID player1Id, UUID player2Id) {
    return createGame(player1Id, player2Id, GameType.PROMPT_CREATION);
  }

  public Game createGame(UUID player1Id, UUID player2Id, GameType gameType) {
    Game game = new Game(player1Id, player2Id, gameType);
    return gameRepository.save(game);
  }

  public Game startGame(UUID gameId) {
    Game game =
        gameRepository
            .findById(gameId)
            .orElseThrow(() -> new IllegalArgumentException("Game not found"));

    if (game.getGameState() != GameState.WAITING) {
      throw new IllegalArgumentException("Game is not in waiting state");
    }

    game.start();
    return gameRepository.save(game);
  }

  public Game finishGame(UUID gameId, UUID winnerId) {
    Game game =
        gameRepository
            .findById(gameId)
            .orElseThrow(() -> new IllegalArgumentException("Game not found"));

    if (!game.isActive()) {
      throw new IllegalArgumentException("Game is not active");
    }

    if (!game.isPlayerInGame(winnerId)) {
      throw new IllegalArgumentException("Winner is not a player in this game");
    }

    game.finish(winnerId);
    return gameRepository.save(game);
  }

  public Game getGame(UUID gameId) {
    return gameRepository
        .findById(gameId)
        .orElseThrow(() -> new IllegalArgumentException("Game not found"));
  }

  public List<Game> getUserGames(UUID userId) {
    return gameRepository.findRecentGamesByPlayer(userId);
  }

  public List<Game> getActiveGames(UUID userId) {
    return gameRepository.findActiveGamesByPlayer(userId, GameState.FINISHED, GameState.CANCELLED);
  }

  public boolean isUserInActiveGame(UUID userId) {
    return gameRepository.isPlayerInActiveGame(userId, GameState.FINISHED, GameState.CANCELLED);
  }

  // Prompt Wars specific methods
  public Game generateScenario(UUID gameId) {
    // Refresh the game from database to get latest state
    Game game =
        gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));

    System.out.println("Generating scenario for game: " + gameId);
    System.out.println("Current game state: " + game.getGameState());
    System.out.println("Current scenario: " + (game.getScenario() != null ? "EXISTS" : "NULL"));

    if (game.getGameState() != GameState.WAITING) {
      System.out.println("Game is not in WAITING state, current state: " + game.getGameState());
      throw new IllegalArgumentException("Game is not in waiting state");
    }

    // Use DB-level reservation so generation is idempotent across service instances
    int updated =
        gameRepository.updateGameStateIf(game.getId(), GameState.WAITING, GameState.WRITING);
    if (updated == 0) {
      // Another instance or request reserved/changed the state first
      System.out.println(
          "Scenario generation reservation failed for game: " + gameId + ". Aborting.");
      throw new IllegalStateException(
          "Scenario generation already in progress or game not waiting");
    }

    // Reload the game after reservation to ensure fresh entity
    game =
        gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));

    // Only generate scenario if not already set
    if (game.getScenario() == null || game.getScenario().trim().isEmpty()) {
      System.out.println("No scenario exists, generating new one...");
      // Generate scenario using OpenRouter AI
      String scenario = generateAIScenario();
      game.setScenario(scenario);
      System.out.println(
          "New scenario generated: "
              + scenario.substring(0, Math.min(50, scenario.length()))
              + "...");
    } else {
      System.out.println(
          "Scenario already exists, using existing one: "
              + game.getScenario().substring(0, Math.min(50, game.getScenario().length()))
              + "...");
    }

    // Persist WRITING state and scenario
    game.setGameState(GameState.WRITING);
    game.setWritingStartedAt(java.time.Instant.now());
    Game savedGame = gameRepository.save(game);
    System.out.println(
        "Game saved with scenario. Final scenario: "
            + (savedGame.getScenario() != null ? "EXISTS" : "NULL"));

    // Send real-time notifications to both players
    Map<String, Object> gameUpdate = new HashMap<>();
    gameUpdate.put("type", "SCENARIO_GENERATED");
    gameUpdate.put("gameId", gameId.toString());
    gameUpdate.put("scenario", savedGame.getScenario());
    gameUpdate.put("gameState", savedGame.getGameState().toString());

    webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
    webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

    System.out.println("Sent scenario update to both players for game: " + gameId);

    return savedGame;
  }

  private String generateAIScenario() {
    try {
      String apiKey = env.getProperty("OPENROUTER_API_KEY");
      if (apiKey == null) {
        throw new IllegalStateException("OPENROUTER_API_KEY must be set");
      }

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("Authorization", "Bearer " + apiKey);
      headers.set("HTTP-Referer", "https://promptforge.ai");
      headers.set("X-Title", "Prompt Forge");

      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", "meta-llama/llama-4-scout");

      StringBuilder sb = new StringBuilder();
      sb.append("Create a fun, creative scenario for a prompt battle! Make it:\n");
      sb.append("• Exciting and imaginative\n");
      sb.append("• Clear and easy to understand\n");
      sb.append("• Perfect for AI prompt writing\n\n");
      sb.append("Just give me ONE short scenario (1-2 sentences max). Examples:\n");
      sb.append("' You're designing an AI assistant for Mars colonists who speak in emoji. ");
      sb.append("Write the perfect prompt!'\n");
      sb.append("' Create a prompt for an AI that helps shy people become confident public ");
      sb.append("speakers in 30 days.'\n");
      sb.append("' Design a prompt for an AI chef that creates meals based on your current ");
      sb.append("mood and the weather.'\n\n");
      sb.append("Now create something totally new and exciting: explicitly say what the ");
      sb.append("players need to prompt within the scenario or what kind of prompt they need ");
      sb.append("to generate without giving the actual prompt. This prompt battle shows who ");
      sb.append("can prompt better, given a scenario. Keep the scenario very brief - 1-2 ");
      sb.append("sentences max. Make the scenario practical realistic ");
      // sb.append("fun and creative");

      List<Map<String, Object>> messages =
          List.of(Map.of("role", "user", "content", sb.toString()));
      requestBody.put("messages", messages);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      ResponseEntity<String> response =
          restTemplate.exchange(
              openRouterBaseUrl + "/chat/completions", HttpMethod.POST, entity, String.class);

      JsonNode jsonNode = objectMapper.readTree(response.getBody());
      if (jsonNode.has("choices") && jsonNode.get("choices").size() > 0) {
        JsonNode choice = jsonNode.get("choices").get(0);
        if (choice.has("message") && choice.get("message").has("content")) {
          String scenario = choice.get("message").get("content").asText();
          return scenario.trim();
        }
      }

      // Fallback if AI generation fails
      return getFallbackScenario();

    } catch (Exception e) {
      System.err.println("Error generating AI scenario: " + e.getMessage());
      e.printStackTrace();
      return getFallbackScenario();
    }
  }

  private String getFallbackScenario() {
    String[] scenarios = {
      "🎨 Create a prompt for an AI that designs custom tattoos based on people's life stories.",
      "🎪 Design a prompt for an AI carnival game master that creates personalized mini-games.",
      "🌙 Write a prompt for an AI dream interpreter that helps people understand their nightmares.",
      "🎵 Create a prompt for an AI DJ that reads the room's mood and plays perfect songs.",
      "🏠 Design a prompt for an AI interior decorator that works with impossible budgets.",
      "🍳 Write a prompt for an AI chef that only cooks with ingredients found in hotel "
          + "mini-bars.",
      "📱 Create a prompt for an AI that writes breakup texts that somehow make people "
          + "feel better.",
      "🎭 Design a prompt for an AI acting coach for people who are afraid of their own "
          + "shadow.",
      "🎮 Write a prompt for an AI that creates board games for families who never agree "
          + "on anything.",
      "🚗 Create a prompt for an AI GPS that gives directions using only movie quotes.",
    };
    return scenarios[(int) (Math.random() * scenarios.length)];
  }

  public Game submitPrompt(UUID gameId, UUID playerId, String prompt) {
    Game game = getGame(gameId);

    System.out.println("Submitting prompt for player: " + playerId + " in game: " + gameId);
    System.out.println("Game state: " + game.getGameState());
    System.out.println(
        "Before submission - Player1 prompt: "
            + (game.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println(
        "Before submission - Player2 prompt: "
            + (game.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));

    validateGameStateForSubmission(game, playerId);
    validatePlayerEligibility(game, playerId);
    validatePromptContent(prompt);

    game.submitPrompt(playerId, prompt.trim());

    System.out.println(
        "After submission - Player1 prompt: "
            + (game.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println(
        "After submission - Player2 prompt: "
            + (game.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println("Both players submitted check: " + game.bothPlayersSubmittedPrompts());
    System.out.println(
        "Player "
            + playerId
            + " submitted prompt. Both submitted before save: "
            + game.bothPlayersSubmittedPrompts());

    // Save the game first to ensure database is updated
    Game savedGame = gameRepository.save(game);
    System.out.println(
        "Game saved. Both submitted after save: " + savedGame.bothPlayersSubmittedPrompts());

    // If both players have submitted, automatically get AI rating and finish game
    if (savedGame.bothPlayersSubmittedPrompts()) {
      // Automatically get AI rating and determine winner
      CompletableFuture.runAsync(
          () -> {
            try {
              performAIRating(savedGame); // Pass the saved game object directly
            } catch (Exception e) {
              System.err.println("Error performing AI rating: " + e.getMessage());
              e.printStackTrace();
            }
          });
    }

    // Send real-time notifications to both players
    Map<String, Object> gameUpdate = new HashMap<>();
    gameUpdate.put("type", "PROMPT_SUBMITTED");
    gameUpdate.put("gameId", gameId.toString());
    gameUpdate.put("playerId", playerId.toString());
    gameUpdate.put("gameState", savedGame.getGameState().toString());

    // If both submitted, notify that AI rating is in progress
    if (savedGame.bothPlayersSubmittedPrompts()) {
      gameUpdate.put("type", "AI_RATING_STARTED");
      gameUpdate.put("message", "Both prompts submitted! AI judge is evaluating...");
    }

    webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
    webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

    System.out.println("Sent prompt submission update to both players for game: " + gameId);

    return savedGame;
  }

  private void validateGameStateForSubmission(Game game, UUID playerId) {
    if (game.getGameState() != GameState.WRITING) {
      throw new IllegalArgumentException("Game is not in writing phase");
    }
  }

  private void validatePlayerEligibility(Game game, UUID playerId) {
    if (!game.isPlayerInGame(playerId)) {
      throw new IllegalArgumentException("Player is not in this game");
    }
  }

  private void validatePromptContent(String prompt) {
    if (prompt == null || prompt.trim().isEmpty()) {
      throw new IllegalArgumentException("Prompt cannot be empty");
    }

    // Validate prompt content - reject if it contains log messages or other invalid data
    if (prompt.contains("Nothing to write")
        || prompt.contains("Completed")
        || prompt.matches(".*\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}.*")) {
      throw new IllegalArgumentException("Invalid prompt content detected");
    }
  }

  private void performAIRating(Game game) {
    UUID gameId = game.getId();
    // Prevent duplicate rating/finalization in this JVM
    if (!finalizationLocks.add(gameId)) {
      System.out.println("AI rating already in progress for game: " + gameId);
      return;
    }

    try {
      System.out.println("Starting AI rating for game: " + gameId);

      // Use the passed game object directly (already verified both players submitted)
      System.out.println("Game state: " + game.getGameState());
      System.out.println("Both submitted: " + game.bothPlayersSubmittedPrompts());

      // Move game into RATING phase and notify clients
      game.setGameState(GameState.RATING);
      gameRepository.save(game);

      Map<String, Object> ratingStart = new HashMap<>();
      ratingStart.put("type", "AI_RATING_STARTED");
      ratingStart.put("gameId", gameId.toString());
      ratingStart.put("message", "AI judge is evaluating the prompts...");
      ratingStart.put("newPhase", GameState.RATING.toString());

      Map<String, Object> phaseChange = new HashMap<>();
      phaseChange.put("type", "PHASE_CHANGE");
      phaseChange.put("gameId", gameId.toString());
      phaseChange.put("gameState", GameState.RATING.toString());
      phaseChange.put("newPhase", GameState.RATING.toString());

      webSocketService.sendGameUpdate(game.getPlayer1Id(), ratingStart);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), ratingStart);
      webSocketService.sendGameUpdate(game.getPlayer1Id(), phaseChange);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), phaseChange);

      System.out.println("Calling AI rating API...");
      // Get AI rating for both prompts
      Map<String, Object> ratings =
          getAIRating(game.getScenario(), game.getPlayer1Prompt(), game.getPlayer2Prompt());

      System.out.println("AI rating completed, processing results...");
      int player1Score = (Integer) ratings.get("player1Score");
      int player2Score = (Integer) ratings.get("player2Score");
      // Clamp scores to expected 0-10 range to avoid DB constraint violations
      player1Score = Math.max(0, Math.min(10, player1Score));
      player2Score = Math.max(0, Math.min(10, player2Score));
      System.out.println("Player 1 score: " + player1Score + ", Player 2 score: " + player2Score);

      // Set the AI scores (clamped to 0-10)
      game.setPlayer1Score(player1Score);
      game.setPlayer2Score(player2Score);
      game.setRatingExplanation((String) ratings.get("explanation"));

      // Player rating should correspond to their own score.
      // Note: DB check constraint disallows 0 for player*_rating, so store null when score == 0
      Integer player1Rating = (player1Score > 0 && player1Score <= 10) ? player1Score : null;
      Integer player2Rating = (player2Score > 0 && player2Score <= 10) ? player2Score : null;
      game.setPlayer1Rating(player1Rating);
      game.setPlayer2Rating(player2Rating);

      // Calculate winner and finish game
      UUID winner = game.calculateWinner();
      game.setWinnerId(winner);
      game.setGameState(GameState.FINISHED);
      game.setEndedAt(java.time.Instant.now());

      gameRepository.save(game);

      // Send results to both players
      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", "GAME_FINISHED");
      gameUpdate.put("gameId", game.getId().toString());
      gameUpdate.put("gameState", "FINISHED");
      gameUpdate.put("player1Score", player1Score);
      gameUpdate.put("player2Score", player2Score);
      gameUpdate.put("winnerId", winner != null ? winner.toString() : null);
      gameUpdate.put("explanation", ratings.get("explanation"));

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

      System.out.println("Sent game finished update to both players for game: " + game.getId());

    } catch (Exception e) {
      System.err.println("Error in performAIRating: " + e.getMessage());
      e.printStackTrace();
      applyFallbackRating(game.getId());
    } finally {
      finalizationLocks.remove(gameId);
    }
  }

  // Helper to keep performAIRating simpler and reduce cyclomatic complexity
  private void applyFallbackRating(UUID gameId) {
    // Prevent duplicate finalization
    if (!finalizationLocks.add(gameId)) {
      System.out.println("Fallback rating already in progress for game: " + gameId);
      return;
    }

    try {
      Game fallbackGame = getGame(gameId);
      if (fallbackGame.getGameState() == GameState.FINISHED) {
        return;
      }

      // Move to RATING phase to notify clients
      fallbackGame.setGameState(GameState.RATING);
      gameRepository.save(fallbackGame);

      Map<String, Object> phaseChange = new HashMap<>();
      phaseChange.put("type", "PHASE_CHANGE");
      phaseChange.put("gameId", gameId.toString());
      phaseChange.put("gameState", GameState.RATING.toString());
      phaseChange.put("newPhase", GameState.RATING.toString());

      webSocketService.sendGameUpdate(fallbackGame.getPlayer1Id(), phaseChange);
      webSocketService.sendGameUpdate(fallbackGame.getPlayer2Id(), phaseChange);

      Map<String, Object> fallbackRatings = getFallbackRating();
      int player1Score = (Integer) fallbackRatings.get("player1Score");
      int player2Score = (Integer) fallbackRatings.get("player2Score");
      player1Score = Math.max(0, Math.min(10, player1Score));
      player2Score = Math.max(0, Math.min(10, player2Score));

      fallbackGame.setPlayer1Score(player1Score);
      fallbackGame.setPlayer2Score(player2Score);
      fallbackGame.setRatingExplanation(
          "AI rating service temporarily unavailable. Random scores assigned.");

      // Do not write 0 into the player rating columns because DB constraint disallows 0.
      Integer fbPlayer1Rating = (player1Score > 0 && player1Score <= 10) ? player1Score : null;
      Integer fbPlayer2Rating = (player2Score > 0 && player2Score <= 10) ? player2Score : null;
      fallbackGame.setPlayer1Rating(fbPlayer1Rating);
      fallbackGame.setPlayer2Rating(fbPlayer2Rating);

      UUID winner = fallbackGame.calculateWinner();
      fallbackGame.setWinnerId(winner);
      fallbackGame.setGameState(GameState.FINISHED);
      fallbackGame.setEndedAt(java.time.Instant.now());

      gameRepository.save(fallbackGame);

      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", "GAME_FINISHED");
      gameUpdate.put("gameId", fallbackGame.getId().toString());
      gameUpdate.put("gameState", "FINISHED");
      gameUpdate.put("player1Score", player1Score);
      gameUpdate.put("player2Score", player2Score);
      gameUpdate.put("winnerId", winner != null ? winner.toString() : null);
      gameUpdate.put(
          "explanation", "AI rating service temporarily unavailable. Random scores assigned.");

      webSocketService.sendGameUpdate(fallbackGame.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(fallbackGame.getPlayer2Id(), gameUpdate);

      System.out.println(
          "Sent fallback game results to both players for game: " + fallbackGame.getId());
    } catch (Exception fallbackError) {
      System.err.println("Fallback rating also failed: " + fallbackError.getMessage());
    } finally {
      finalizationLocks.remove(gameId);
    }
  }

  private Map<String, Object> getAIRating(
      String scenario, String player1Prompt, String player2Prompt) {
    System.out.println(
        "Getting AI rating for scenario: "
            + scenario.substring(0, Math.min(50, scenario.length()))
            + "...");
    System.out.println(
        "Player 1 prompt: "
            + player1Prompt.substring(0, Math.min(50, player1Prompt.length()))
            + "...");
    System.out.println(
        "Player 2 prompt: "
            + player2Prompt.substring(0, Math.min(50, player2Prompt.length()))
            + "...");
    try {
      String apiKey = env.getProperty("OPENROUTER_API_KEY");
      if (apiKey == null) {
        throw new IllegalStateException("OPENROUTER_API_KEY must be set");
      }

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("Authorization", "Bearer " + apiKey);
      headers.set("HTTP-Referer", "https://promptforge.ai");
      headers.set("X-Title", "Prompt Forge");

      StringBuilder rp = new StringBuilder();
      rp.append("You are judging a prompt writing competition. Here's the scenario and two ");
      rp.append("competing prompts:\n\n");
      rp.append("SCENARIO: %s\n\n");
      rp.append("PROMPT 1: %s\n\n");
      rp.append("PROMPT 2: %s\n\n");
      rp.append("IMPORTANT: Any prompt that is a direct copy-paste from the scenario ");
      rp.append("should receive a score of 0.\n\n");
      rp.append("Evaluate both prompts based on these criteria (total weight = 100%%):\n");
      rp.append("• CLARITY (25%%): How clear and unambiguous the prompt is\n");
      rp.append("• SPECIFICITY (25%%): Level of detail and concrete requirements\n");
      rp.append("• STRUCTURE (25%%): Organization and logical flow\n");
      rp.append("• CONTEXT (15%%): Background information and situational details\n");
      rp.append("• ACTIONABILITY (10%%): How easy it is to act on the prompt\n\n");
      rp.append("RELEVANCE TO SCENARIO: Both prompts must be highly relevant to the given ");
      rp.append("scenario.\n");
      rp.append("Irrelevant prompts should receive low scores regardless of other criteria.\n\n");
      rp.append("Provide:\n");
      rp.append("1. A score for each prompt (1-10, where 10 is exceptional)\n");
      rp.append("2. A structured analysis with key strengths and weaknesses\n");
      rp.append("3. Declare the winner\n\n");
      rp.append("Format your response as:\n");
      rp.append("Prompt 1 Score: X/10\n");
      rp.append("Prompt 2 Score: Y/10\n");
      rp.append("Winner: [Prompt 1/Prompt 2/Tie]\n");
      rp.append("Analysis:\n");
      rp.append("Relevance: [Brief assessment of how well each prompt addresses the scenario]\n");
      rp.append("Clarity: [Assessment of clarity in both prompts]\n");
      rp.append("Specificity: [Assessment of detail level in both prompts]\n");
      rp.append("Structure: [Assessment of organization in both prompts]\n");
      rp.append("Context: [Assessment of background information in both prompts]\n");
      rp.append("Actionability: [Assessment of usability in both prompts]\n");
      rp.append("Overall: [Brief conclusion on which prompt is better and why]");
      rp.append("NB: if no prompt is provided or it is null, give that promp 0");

      String ratingPrompt = String.format(rp.toString(), scenario, player1Prompt, player2Prompt);

      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", "meta-llama/llama-4-scout");

      Map<String, Object> userMsg = new HashMap<>();
      userMsg.put("role", "user");
      userMsg.put("content", ratingPrompt);
      List<Map<String, Object>> messages = List.of(userMsg);
      requestBody.put("messages", messages);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      ResponseEntity<String> response =
          restTemplate.exchange(
              openRouterBaseUrl + "/chat/completions", HttpMethod.POST, entity, String.class);

      System.out.println("OpenRouter API response status: " + response.getStatusCode());
      JsonNode jsonNode = objectMapper.readTree(response.getBody());
      if (jsonNode.has("choices") && jsonNode.get("choices").size() > 0) {
        JsonNode choice = jsonNode.get("choices").get(0);
        if (choice.has("message") && choice.get("message").has("content")) {
          String result = choice.get("message").get("content").asText();
          System.out.println(
              "AI rating result: " + result.substring(0, Math.min(100, result.length())) + "...");
          return parseRatingResult(result);
        }
      }

      System.out.println("No valid response from AI, using fallback");
      // Fallback if AI rating fails
      return getFallbackRating();

    } catch (Exception e) {
      System.err.println("Error getting AI rating: " + e.getMessage());
      e.printStackTrace();
      return getFallbackRating();
    }
  }

  private Map<String, Object> parseRatingResult(String result) {
    Map<String, Object> ratings = new HashMap<>();

    try {
      // Robust parsing: try multiple patterns (Prompt 1 Score, Rating 1, Prompt1:, compact)
      int player1Score = 5; // Default fallback
      int player2Score = 5; // Default fallback

      // Patterns to attempt, in order
      java.util.regex.Pattern[] p1Patterns =
          new java.util.regex.Pattern[] {
            java.util.regex.Pattern.compile(
                "Prompt\\s*1\\s*Score\\s*[:\\-]?\\s*(\\d{1,2})",
                java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Rating\\s*1\\s*[:\\-]?\\s*(\\d{1,2})", java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Prompt1\\s*[:\\-]?\\s*(\\d{1,2})", java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Player\\s*1\\s*score\\s*[:\\-]?\\s*(\\d{1,2})",
                java.util.regex.Pattern.CASE_INSENSITIVE),
          };

      java.util.regex.Pattern[] p2Patterns =
          new java.util.regex.Pattern[] {
            java.util.regex.Pattern.compile(
                "Prompt\\s*2\\s*Score\\s*[:\\-]?\\s*(\\d{1,2})",
                java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Rating\\s*2\\s*[:\\-]?\\s*(\\d{1,2})", java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Prompt2\\s*[:\\-]?\\s*(\\d{1,2})", java.util.regex.Pattern.CASE_INSENSITIVE),
            java.util.regex.Pattern.compile(
                "Player\\s*2\\s*score\\s*[:\\-]?\\s*(\\d{1,2})",
                java.util.regex.Pattern.CASE_INSENSITIVE),
          };

      // Try each pattern until we find a match
      for (java.util.regex.Pattern p : p1Patterns) {
        java.util.regex.Matcher m = p.matcher(result);
        if (m.find()) {
          try {
            player1Score = Integer.parseInt(m.group(1));
            break;
          } catch (NumberFormatException nfe) {
            // ignore and continue
          }
        }
      }

      for (java.util.regex.Pattern p : p2Patterns) {
        java.util.regex.Matcher m = p.matcher(result);
        if (m.find()) {
          try {
            player2Score = Integer.parseInt(m.group(1));
            break;
          } catch (NumberFormatException nfe) {
            // ignore and continue
          }
        }
      }

      // Compact inline pattern like: "Prompt 1: X, Prompt 2: Y" or "Prompt1: X Prompt2: Y"
      if ((player1Score == 5 || player2Score == 5)) {
        java.util.regex.Pattern compact =
            java.util.regex.Pattern.compile(
                "Prompt\\s*1\\s*[:\\-]?\\s*(\\d{1,2})\\s*[,;\\s]+"
                    + "Prompt\\s*2\\s*[:\\-]?\\s*(\\d{1,2})",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher cm = compact.matcher(result);
        if (cm.find()) {
          try {
            if (player1Score == 5) player1Score = Integer.parseInt(cm.group(1));
            if (player2Score == 5) player2Score = Integer.parseInt(cm.group(2));
          } catch (NumberFormatException nfe) {
            // ignore
          }
        }
      }

      // Clamp to 0-10 and ensure integer
      player1Score = Math.max(0, Math.min(10, player1Score));
      player2Score = Math.max(0, Math.min(10, player2Score));

      ratings.put("player1Score", player1Score);
      ratings.put("player2Score", player2Score);
      ratings.put("explanation", result);

      System.out.println(
          "parseRatingResult extracted scores -> p1: " + player1Score + ", p2: " + player2Score);

    } catch (Exception e) {
      System.err.println("Error parsing rating result: " + e.getMessage());
      ratings.put("player1Score", 5);
      ratings.put("player2Score", 5);
      ratings.put("explanation", "Error parsing AI rating. Default scores assigned.");
    }

    return ratings;
  }

  private Map<String, Object> getFallbackRating() {
    Map<String, Object> ratings = new HashMap<>();
    // Generate random but close scores for fallback
    int score1 = 6 + (int) (Math.random() * 3); // 6-8
    int score2 = 6 + (int) (Math.random() * 3); // 6-8

    ratings.put("player1Score", score1);
    ratings.put("player2Score", score2);
    ratings.put(
        "explanation",
        "AI rating service unavailable. Random scores assigned: Prompt 1: "
            + score1
            + "/10, Prompt 2: "
            + score2
            + "/10");

    return ratings;
  }

  public Game ratePrompt(UUID gameId, UUID playerId, Integer rating) {
    Game game = getGame(gameId);

    if (game.getGameState() != GameState.RATING) {
      throw new IllegalArgumentException("Game is not in rating phase");
    }

    if (!game.isPlayerInGame(playerId)) {
      throw new IllegalArgumentException("Player is not in this game");
    }

    game.rateOpponentPrompt(playerId, rating);

    // If both players have rated, finish the game
    if (game.bothPlayersRated()) {
      UUID winner = game.calculateWinner();
      game.setWinnerId(winner);
      game.setGameState(GameState.FINISHED);
      game.setEndedAt(java.time.Instant.now());
    }

    return gameRepository.save(game);
  }

  public boolean cancelActiveGameForUser(UUID userId) {
    List<Game> activeGames =
        gameRepository.findActiveGamesByPlayer(userId, GameState.FINISHED, GameState.CANCELLED);
    if (activeGames == null || activeGames.isEmpty()) {
      return false;
    }
    // Cancel all active games for this user (usually should be only one)
    for (Game game : activeGames) {
      game.cancel();
      gameRepository.save(game);
      // Optionally notify other player(s) via WebSocket
    }
    return true;
  }

  public Game restartGame(UUID gameId) {
    Game game = getGame(gameId);

    System.out.println("Restarting game: " + gameId);

    // Reset game state for a new round
    game.setGameState(GameState.WAITING);
    game.setScenario(null);
    game.setWritingStartedAt(null);
    game.setPlayer1Prompt(null);
    game.setPlayer2Prompt(null);
    game.setPlayer1Rating(null);
    game.setPlayer2Rating(null);
    game.setPlayer1Score(0);
    game.setPlayer2Score(0);
    game.setPlayer1CorrectAnswers(0);
    game.setPlayer2CorrectAnswers(0);
    game.setRatingExplanation(null);
    game.setWinnerId(null);
    game.setEndedAt(null);
    game.setCurrentQuestion(null);
    game.setCurrentOutput(null);
    game.setCurrentOptions(null);
    game.setCorrectAnswer(null);
    game.setQuestionNumber(1);

    Game savedGame = gameRepository.save(game);

    System.out.println("Game restarted and saved: " + savedGame.getId());

    // Notify both players that the game has been restarted
    Map<String, Object> gameUpdate = new HashMap<>();
    gameUpdate.put("type", "GAME_RESTARTED");
    gameUpdate.put("gameId", savedGame.getId().toString());
    gameUpdate.put("gameState", savedGame.getGameState().toString());
    gameUpdate.put("questionNumber", savedGame.getQuestionNumber());
    gameUpdate.put("player1Score", savedGame.getPlayer1CorrectAnswers());
    gameUpdate.put("player2Score", savedGame.getPlayer2CorrectAnswers());

    webSocketService.sendGameUpdate(savedGame.getPlayer1Id(), gameUpdate);
    webSocketService.sendGameUpdate(savedGame.getPlayer2Id(), gameUpdate);

    System.out.println(
        "Sent game restart notification to both players for game: " + savedGame.getId());

    return savedGame;
  }

  /**
   * Force finish a game: assign 0 to missing prompts and ensure AI rating runs if at least one
   * prompt exists. Useful for admin/testing or resolving stuck games.
   */
  public Game forceFinishGame(UUID gameId) {
    Game game = getGame(gameId);

    if (!game.isActive()) {
      throw new IllegalArgumentException("Game is not active");
    }

    // If writing phase, move to finished by assigning missing prompts as empty and letting rating
    // run.
    if (game.getGameState() == GameState.WRITING || game.getGameState() == GameState.WAITING) {
      // Safety: do not allow force-finish to run early. If both players already submitted prompts,
      // we can proceed immediately. Otherwise require the configured writing duration to have
      // elapsed based on writingStartedAt to avoid premature forcing when a client timer is
      // slightly ahead.
      if (!game.bothPlayersSubmittedPrompts()) {
        java.time.Instant started = game.getWritingStartedAt();
        if (started == null) {
          throw new IllegalArgumentException("Writing window has not started yet");
        }
        long elapsed = java.time.Duration.between(started, java.time.Instant.now()).getSeconds();
        int required = (game.getGameType() == GameType.REVERSE_PROMPT) ? 60 : 120;
        // Allow a small grace of 1 second to account for minor clock skew
        if (elapsed < Math.max(0, required - 1)) {
          throw new IllegalArgumentException("Writing period has not yet expired");
        }
      }
      // Assign auto-empty prompts where missing
      if (game.getPlayer1Prompt() == null) {
        // Use a non-empty placeholder so hasPlayerSubmittedPrompt considers this a submission
        game.submitPrompt(game.getPlayer1Id(), "NO_ANSWER");
      }
      if (game.getPlayer2Prompt() == null) {
        game.submitPrompt(game.getPlayer2Id(), "NO_ANSWER");
      }

      Game saved = gameRepository.save(game);

      // If both prompts now present, run AI rating synchronously here
      if (saved.bothPlayersSubmittedPrompts()) {
        performAIRating(saved);
      } else {
        // Set finished with zeros if no prompts
        saved.setPlayer1Score(saved.getPlayer1Score() == null ? 0 : saved.getPlayer1Score());
        saved.setPlayer2Score(saved.getPlayer2Score() == null ? 0 : saved.getPlayer2Score());
        UUID winner = saved.calculateWinner();
        saved.setWinnerId(winner);
        saved.setGameState(GameState.FINISHED);
        saved.setEndedAt(java.time.Instant.now());
        saved.setWritingStartedAt(null);
        gameRepository.save(saved);
      }

      return getGame(gameId);
    }

    throw new IllegalArgumentException("Game cannot be force-finished from its current state");
  }

  /**
   * Handle timeout when neither player submits a prompt within the time limit. Automatically
   * assigns 0-0 scores and finishes the game.
   */
  public Game handleTimeout(UUID gameId) {
    Game game = getGame(gameId);

    System.out.println("Handling timeout for game: " + gameId);
    System.out.println("Current game state: " + game.getGameState());
    System.out.println("Player 1 prompt submitted: " + (game.getPlayer1Prompt() != null));
    System.out.println("Player 2 prompt submitted: " + (game.getPlayer2Prompt() != null));

    if (!game.isActive()) {
      throw new IllegalArgumentException("Game is not active");
    }

    if (game.getGameState() != GameState.WRITING) {
      throw new IllegalArgumentException("Game is not in writing phase - cannot handle timeout");
    }

    // Check if neither player has submitted
    if (game.getPlayer1Prompt() == null && game.getPlayer2Prompt() == null) {
      System.out.println("Neither player submitted - assigning automatic 0-0 scores");

      // Set both scores to 0
      game.setPlayer1Score(0);
      game.setPlayer2Score(0);
      game.setPlayer1Rating(null);
      game.setPlayer2Rating(null);
      game.setRatingExplanation(
          "Neither player submitted a prompt within the time limit. Automatic 0-0 result.");

      // No winner in a tie
      game.setWinnerId(null);
      game.setGameState(GameState.FINISHED);
      game.setEndedAt(java.time.Instant.now());
      game.setWritingStartedAt(null);

      Game savedGame = gameRepository.save(game);

      // Send timeout results to both players
      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", "GAME_FINISHED");
      gameUpdate.put("gameId", gameId.toString());
      gameUpdate.put("gameState", "FINISHED");
      gameUpdate.put("player1Score", 0);
      gameUpdate.put("player2Score", 0);
      gameUpdate.put("winnerId", null);
      gameUpdate.put(
          "explanation",
          "Neither player submitted a prompt within the time limit. Automatic 0-0 result.");
      gameUpdate.put("timeout", true);

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

      System.out.println("Sent timeout game finished update to both players for game: " + gameId);

      return savedGame;
    } else {
      // At least one player submitted - force finish the game so AI rating runs and
      // both players receive GAME_FINISHED with AI judgment.
      System.out.println("At least one player submitted - forcing finish to trigger AI rating");
      try {
        return forceFinishGame(gameId);
      } catch (Exception e) {
        System.err.println("Error while forcing finish during timeout handling: " + e.getMessage());
        // As a fallback, return the current game state without modifying it
        return game;
      }
    }
  }

  // Reverse Prompt Battle methods
  public synchronized Game generateQuestion(UUID gameId) {
    // Prevent duplicate in-JVM requests
    if (!generationLocks.add(gameId)) {
      System.out.println("Generation already in progress (in-memory) for game: " + gameId);
      throw new IllegalStateException("Question generation already in progress");
    }

    Game game =
        gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));

    System.out.println("Generating question for reverse prompt battle: " + gameId);
    System.out.println("Current game state: " + game.getGameState());

    if (game.getGameType() != GameType.REVERSE_PROMPT) {
      generationLocks.remove(gameId);
      throw new IllegalArgumentException("Game is not a reverse prompt battle");
    }

    if (game.getGameState() != GameState.WAITING) {
      generationLocks.remove(gameId);
      throw new IllegalArgumentException("Game is not in waiting state");
    }

    // Atomically reserve the round by changing state from WAITING -> WRITING
    int updated =
        gameRepository.updateGameStateIf(game.getId(), GameState.WAITING, GameState.WRITING);
    if (updated == 0) {
      generationLocks.remove(gameId);
      String reservationMsg =
          "Round reservation failed for game " + gameId + ". Current state: " + game.getGameState();
      System.out.println(reservationMsg);
      throw new IllegalStateException(
          "Question generation already in progress or game not waiting");
    }

    // Reload the game after reservation to ensure fresh entity
    game =
        gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));

    // Persist WRITING state explicitly so submit flows see it
    game.setGameState(GameState.WRITING);
    game.setWritingStartedAt(java.time.Instant.now());
    gameRepository.save(game);

    Map<String, Object> questionData = null;
    try {
      // Generate question and options using AI
      questionData = generateAIQuestion();

      game.setCurrentQuestion((String) questionData.get("question"));
      game.setCurrentOutput((String) questionData.get("output"));
      game.setCurrentOptions((String) questionData.get("options")); // JSON string
      game.setCorrectAnswer((String) questionData.get("correctAnswer"));
      game.clearAnswers(); // Reset answers for new question

      // Already reserved as WRITING — save final fields
      Game savedGame = gameRepository.save(game);

      // Send real-time notifications to both players
      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", "QUESTION_GENERATED");
      gameUpdate.put("gameId", gameId.toString());
      gameUpdate.put("question", savedGame.getCurrentQuestion());
      gameUpdate.put("output", savedGame.getCurrentOutput());
      gameUpdate.put("options", savedGame.getCurrentOptions());
      gameUpdate.put("questionNumber", savedGame.getQuestionNumber());
      gameUpdate.put("gameState", savedGame.getGameState().toString());

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

      System.out.println("Sent question update to both players for game: " + gameId);

      return savedGame;
    } catch (Exception e) {
      String errMsg = "Error generating question for game " + gameId + ": " + e.getMessage();
      System.err.println(errMsg);
      e.printStackTrace();
      // Revert game state back to WAITING so players can retry
      try {
        Game reload = gameRepository.findById(gameId).orElse(null);
        if (reload != null) {
          reload.setGameState(GameState.WAITING);
          gameRepository.save(reload);
          // Notify players that generation failed and they can retry
          Map<String, Object> failUpdate = new HashMap<>();
          failUpdate.put("type", "QUESTION_GENERATION_FAILED");
          failUpdate.put("gameId", gameId.toString());
          failUpdate.put("message", "Question generation failed. Please try again.");
          webSocketService.sendGameUpdate(reload.getPlayer1Id(), failUpdate);
          webSocketService.sendGameUpdate(reload.getPlayer2Id(), failUpdate);
        }
      } catch (Exception ex) {
        String revertMsg = "Failed to revert game state after generation error: " + ex.getMessage();
        System.err.println(revertMsg);
        ex.printStackTrace();
      }
      throw new RuntimeException(e);
    } finally {
      // Ensure in-memory lock is cleared
      generationLocks.remove(gameId);
    }
  }

  private Map<String, Object> generateAIQuestion() {
    try {
      String apiKey = env.getProperty("OPENROUTER_API_KEY");
      if (apiKey == null) {
        throw new IllegalStateException("OPENROUTER_API_KEY must be set");
      }

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("Authorization", "Bearer " + apiKey);
      headers.set("HTTP-Referer", "https://promptforge.ai");
      headers.set("X-Title", "Prompt Forge");

      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", "meta-llama/llama-4-scout");

      StringBuilder qsb = new StringBuilder();
      qsb.append("Create a reverse prompt engineering question for a game. Keep everything ");
      qsb.append("SHORT and CONCISE. You need to:\n");
      qsb.append("1. Create a simple scenario/topic\n");
      qsb.append("2. Generate a SHORT AI output (1-2 sentences max)\n");
      qsb.append("3. Create 4 SHORT prompts (A, B, C, D) that could have generated that ");
      qsb.append("output\n");
      qsb.append("4. Make sure only ONE prompt would realistically generate that specific ");
      qsb.append("output\n\n");
      qsb.append("IMPORTANT: Keep prompts under 10 words each and output under 20 words!\n\n");
      qsb.append("Format your response EXACTLY like this:\n");
      qsb.append("QUESTION: [simple scenario]\n");
      qsb.append("OUTPUT: [short AI output - max 20 words]\n");
      qsb.append("A) [short prompt option A - max 10 words]\n");
      qsb.append("B) [short prompt option B - max 10 words]\n");
      qsb.append("C) [short prompt option C - max 10 words]\n");
      qsb.append("D) [short prompt option D - max 10 words]\n");
      qsb.append("CORRECT: [A, B, C, or D]\n\n");
      qsb.append("Make it challenging but fair. Keep everything SHORT.\n");
      qsb.append("Random seed: ").append(new java.util.Random().nextInt(10000)).append("\n\n");
      qsb.append("The output should be unique enough that only one prompt makes sense.");

      List<Map<String, Object>> messages =
          List.of(Map.of("role", "user", "content", qsb.toString()));
      requestBody.put("messages", messages);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      ResponseEntity<String> response =
          restTemplate.exchange(
              openRouterBaseUrl + "/chat/completions", HttpMethod.POST, entity, String.class);

      JsonNode jsonNode = objectMapper.readTree(response.getBody());
      if (jsonNode.has("choices") && jsonNode.get("choices").size() > 0) {
        JsonNode choice = jsonNode.get("choices").get(0);
        if (choice.has("message") && choice.get("message").has("content")) {
          String result = choice.get("message").get("content").asText();
          return parseQuestionResult(result);
        }
      }

      // Fallback if AI generation fails
      return getFallbackQuestion();

    } catch (Exception e) {
      System.err.println("Error generating AI question: " + e.getMessage());
      e.printStackTrace();
      return getFallbackQuestion();
    }
  }

  private Map<String, Object> parseQuestionResult(String result) {
    Map<String, Object> questionData = new HashMap<>();

    try {
      String[] lines = result.split("\n");
      String question = "";
      String output = "";
      String[] options = new String[4]; // Changed from 5 to 4
      String correctAnswer = "A";

      for (String line : lines) {
        line = line.trim();
        if (line.startsWith("QUESTION:")) {
          question = line.substring(9).trim();
        } else if (line.startsWith("OUTPUT:")) {
          output = line.substring(7).trim();
        } else if (line.startsWith("A)")) {
          options[0] = line.substring(2).trim();
        } else if (line.startsWith("B)")) {
          options[1] = line.substring(2).trim();
        } else if (line.startsWith("C)")) {
          options[2] = line.substring(2).trim();
        } else if (line.startsWith("D)")) {
          options[3] = line.substring(2).trim();
        } else if (line.startsWith("CORRECT:")) {
          correctAnswer = line.substring(8).trim().toUpperCase();
        }
      }

      // Convert options to JSON
      String optionsJson = "[\"" + String.join("\",\"", options) + "\"]";

      questionData.put("question", question);
      questionData.put("output", output);
      questionData.put("options", optionsJson);
      questionData.put("correctAnswer", correctAnswer);

    } catch (Exception e) {
      System.err.println("Error parsing question result: " + e.getMessage());
      return getFallbackQuestion();
    }

    return questionData;
  }

  private Map<String, Object> getFallbackQuestion() {
    Map<String, Object> questionData = new HashMap<>();

    questionData.put("question", "Short Story Writing");
    questionData.put("output", "The robot smiled and waved goodbye to its human friend.");
    questionData.put(
        "options",
        "[\"Write a sad robot story\","
            + "\"Create a happy robot friendship tale\","
            + "\"Generate a technical robot manual\","
            + "\"Write a robot battle scene\"]");
    questionData.put("correctAnswer", "B");

    return questionData;
  }

  public Game submitAnswer(UUID gameId, UUID playerId, String answer) {
    Game game = getGame(gameId);

    System.out.println("Submitting answer for player: " + playerId + " in game: " + gameId);
    System.out.println("Answer: " + answer);
    System.out.println("Game type: " + game.getGameType());

    if (game.getGameType() != GameType.REVERSE_PROMPT) {
      throw new IllegalArgumentException("Game is not a reverse prompt battle");
    }

    // Accept submissions if game is in WRITING state.
    // Also allow a short race window where the DB might still be updating: if state is WAITING but
    // a currentQuestion exists, treat it as accepting answers.
    if (game.getGameState() != GameState.WRITING) {
      if (!(game.getGameState() == GameState.WAITING && game.getCurrentQuestion() != null)) {
        throw new IllegalArgumentException("Game is not in answering phase");
      }
    }

    if (!game.isPlayerInGame(playerId)) {
      throw new IllegalArgumentException("Player is not in this game");
    }

    // Treat null/empty as NO_ANSWER for auto-submits
    String normalizedAnswer =
        (answer == null || answer.trim().isEmpty()) ? "NO_ANSWER" : answer.trim().toUpperCase();

    // Validate answer format (A, B, C, D) or NO_ANSWER
    if (!(normalizedAnswer.matches("[A-D]") || "NO_ANSWER".equals(normalizedAnswer))) {
      throw new IllegalArgumentException("Answer must be A, B, C, D or NO_ANSWER");
    }

    game.submitAnswer(playerId, normalizedAnswer);
    Game savedGame = gameRepository.save(game);

    // If both players have answered, process the results
    if (savedGame.bothPlayersAnswered()) {
      CompletableFuture.runAsync(
          () -> {
            try {
              processAnswers(savedGame);
            } catch (Exception e) {
              System.err.println("Error processing answers: " + e.getMessage());
              e.printStackTrace();
            }
          });
    } else {
      // Send update that one player has answered
      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", "ANSWER_SUBMITTED");
      gameUpdate.put("gameId", gameId.toString());
      gameUpdate.put("playerId", playerId.toString());
      gameUpdate.put("gameState", savedGame.getGameState().toString());

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);
    }

    return savedGame;
  }

  private void processAnswers(Game game) {
    System.out.println("Processing answers for game: " + game.getId());

    try {
      String correctAnswer = game.getCorrectAnswer();
      String player1Answer = game.getPlayer1Answer();
      String player2Answer = game.getPlayer2Answer();

      boolean player1Correct = correctAnswer.equals(player1Answer);
      boolean player2Correct = correctAnswer.equals(player2Answer);

      // Update scores
      if (player1Correct) {
        game.setPlayer1CorrectAnswers(game.getPlayer1CorrectAnswers() + 1);
      }
      if (player2Correct) {
        game.setPlayer2CorrectAnswers(game.getPlayer2CorrectAnswers() + 1);
      }

      // Only end the game if a player reaches 5 points, or after 5 questions
      int player1Score = game.getPlayer1CorrectAnswers();
      int player2Score = game.getPlayer2CorrectAnswers();
      int currentQuestion = game.getQuestionNumber();
      boolean playerReached5 = player1Score >= 5 || player2Score >= 5;
      boolean lastQuestion = currentQuestion >= 5;
      boolean gameFinished = false;

      // Only end if a player reached 5 points, or if 5 questions have been answered
      if (playerReached5 || lastQuestion) {
        gameFinished = true;
        UUID winner = null;
        if (player1Score > player2Score) {
          winner = game.getPlayer1Id();
        } else if (player2Score > player1Score) {
          winner = game.getPlayer2Id();
        } // else tie, winner remains null
        game.setWinnerId(winner);
        game.setGameState(GameState.FINISHED);
        game.setEndedAt(java.time.Instant.now());
      } else {
        // Prepare for next question (increment AFTER the check)
        game.setQuestionNumber(currentQuestion + 1);
        game.setGameState(GameState.WAITING); // Ready for next question
      }

      gameRepository.save(game);

      // Send results to both players
      Map<String, Object> gameUpdate = new HashMap<>();
      gameUpdate.put("type", gameFinished ? "REVERSE_GAME_FINISHED" : "ANSWER_RESULTS");
      gameUpdate.put("gameId", game.getId().toString());
      gameUpdate.put("correctAnswer", correctAnswer);
      gameUpdate.put("player1Answer", player1Answer);
      gameUpdate.put("player2Answer", player2Answer);
      gameUpdate.put("player1Correct", player1Correct);
      gameUpdate.put("player2Correct", player2Correct);
      gameUpdate.put("player1Score", player1Score);
      gameUpdate.put("player2Score", player2Score);
      gameUpdate.put("player1Id", game.getPlayer1Id().toString());
      gameUpdate.put("player2Id", game.getPlayer2Id().toString());
      gameUpdate.put("questionNumber", game.getQuestionNumber());
      gameUpdate.put("gameState", game.getGameState().toString());

      if (gameFinished) {
        gameUpdate.put(
            "winnerId", game.getWinnerId() != null ? game.getWinnerId().toString() : null);
        if (player1Score == player2Score) {
          gameUpdate.put("tie", true);
        }
      }

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

      System.out.println("Sent answer results to both players for game: " + game.getId());

      // If not finished, auto-generate the next question
      if (!gameFinished) {
        // Small delay to allow frontend to show results before next question
        try {
          Thread.sleep(1200);
        } catch (InterruptedException ignored) {
        }
        generateQuestion(game.getId());
      }

    } catch (Exception e) {
      System.err.println("Error in processAnswers: " + e.getMessage());
      e.printStackTrace();
    }
  }
}
