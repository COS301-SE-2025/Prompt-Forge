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
import com.fiveOps.promptforge.promptwars.repository.GameRepository;

@Service
@Transactional
public class GameService {

  @Autowired private GameRepository gameRepository;

  @Autowired private WebSocketService webSocketService;

  @Autowired private Environment env;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${openrouter.base.url:https://openrouter.ai/api/v1}")
  private String openRouterBaseUrl;

  public Game createGame(UUID player1Id, UUID player2Id) {
    Game game = new Game(player1Id, player2Id);
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
  public synchronized Game generateScenario(UUID gameId) {
    // Refresh the game from database to get latest state
    Game game = gameRepository.findById(gameId)
        .orElseThrow(() -> new RuntimeException("Game not found"));

    System.out.println("Generating scenario for game: " + gameId);
    System.out.println("Current game state: " + game.getGameState());
    System.out.println("Current scenario: " + (game.getScenario() != null ? "EXISTS" : "NULL"));

    if (game.getGameState() != GameState.WAITING) {
      System.out.println("Game is not in WAITING state, current state: " + game.getGameState());
      throw new IllegalArgumentException("Game is not in waiting state");
    }

    // Only generate scenario if not already set
    if (game.getScenario() == null || game.getScenario().trim().isEmpty()) {
      System.out.println("No scenario exists, generating new one...");
      // Generate scenario using OpenRouter AI
      String scenario = generateAIScenario();
      game.setScenario(scenario);
      System.out.println("New scenario generated: " + scenario.substring(0, Math.min(50, scenario.length())) + "...");
    } else {
      System.out.println("Scenario already exists, using existing one: " + game.getScenario().substring(0, Math.min(50, game.getScenario().length())) + "...");
    }

    game.setGameState(GameState.WRITING);
    Game savedGame = gameRepository.save(game);
    System.out.println("Game saved with scenario. Final scenario: " + (savedGame.getScenario() != null ? "EXISTS" : "NULL"));

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
      requestBody.put("model", "deepseek/deepseek-r1-0528-qwen3-8b:free");

      List<Map<String, Object>> messages =
          List.of(
              Map.of(
                  "role",
                  "user",
                  "content",
                  "Create a fun, creative scenario for a prompt battle! Make it:"
                      + "\n• Exciting and imaginative"
                      + "\n• Clear and easy to understand" 
                      + "\n• Perfect for AI prompt writing"
                      + "\n\nJust give me ONE short scenario (1-2 sentences max). Examples:"
                      + "\n'🚀 You're designing an AI assistant for Mars colonists who speak in emoji. Write the perfect prompt!'"
                      + "\n'🎭 Create a prompt for an AI that helps shy people become confident public speakers in 30 days.'"
                      + "\n'🌟 Design a prompt for an AI chef that creates meals based on your current mood and the weather.'"
                      + "\n\nNow create something totally new and exciting:"));
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
      "🍳 Write a prompt for an AI chef that only cooks with ingredients found in hotel mini-bars.",
      "📱 Create a prompt for an AI that writes breakup texts that somehow make people feel better.",
      "🎭 Design a prompt for an AI acting coach for people who are afraid of their own shadow.",
      "🎮 Write a prompt for an AI that creates board games for families who never agree on anything.",
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

    if (game.getGameState() != GameState.WRITING) {
      throw new IllegalArgumentException("Game is not in writing phase");
    }

    if (!game.isPlayerInGame(playerId)) {
      throw new IllegalArgumentException("Player is not in this game");
    }

    if (prompt == null || prompt.trim().isEmpty()) {
      throw new IllegalArgumentException("Prompt cannot be empty");
    }

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

  private void performAIRating(Game game) {
    System.out.println("Starting AI rating for game: " + game.getId());
    try {
      System.out.println(
          "Game state: "
              + game.getGameState()
              + ", Both submitted: "
              + game.bothPlayersSubmittedPrompts());
      System.out.println(
          "Game data - Player1 prompt: " + (game.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
      System.out.println(
          "Game data - Player2 prompt: " + (game.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));

      if (!game.bothPlayersSubmittedPrompts()) {
        System.out.println("Not both players submitted, aborting rating");
        return;
      }

      System.out.println("Calling AI rating API...");
      // Get AI rating for both prompts
      Map<String, Object> ratings =
          getAIRating(game.getScenario(), game.getPlayer1Prompt(), game.getPlayer2Prompt());

      System.out.println("AI rating completed, processing results...");
      int player1Score = (Integer) ratings.get("player1Score");
      int player2Score = (Integer) ratings.get("player2Score");
      System.out.println("Player 1 score: " + player1Score + ", Player 2 score: " + player2Score);

      // Set the AI scores
      game.setPlayer1Score(player1Score);
      game.setPlayer2Score(player2Score);
      game.setRatingExplanation((String) ratings.get("explanation"));

      // Set the ratings (Note: in our system, players rate opponent's prompts)
      // So player1's rating is actually the score given to player2's prompt
      game.setPlayer1Rating(player2Score); // Player1 "rates" Player2's prompt
      game.setPlayer2Rating(player1Score); // Player2 "rates" Player1's prompt

      // Calculate winner
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

      // Fallback: Use random rating to complete the game
      try {
        Game fallbackGame = getGame(game.getId());
        if (fallbackGame.getGameState() != GameState.FINISHED) {
          Map<String, Object> fallbackRatings = getFallbackRating();

          int player1Score = (Integer) fallbackRatings.get("player1Score");
          int player2Score = (Integer) fallbackRatings.get("player2Score");

          fallbackGame.setPlayer1Score(player1Score);
          fallbackGame.setPlayer2Score(player2Score);
          fallbackGame.setRatingExplanation(
              "AI rating service temporarily unavailable. Random scores assigned.");

          fallbackGame.setPlayer1Rating(player2Score);
          fallbackGame.setPlayer2Rating(player1Score);

          UUID winner = fallbackGame.calculateWinner();
          fallbackGame.setWinnerId(winner);
          fallbackGame.setGameState(GameState.FINISHED);
          fallbackGame.setEndedAt(java.time.Instant.now());

          gameRepository.save(fallbackGame);

          // Send fallback results
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
        }
      } catch (Exception fallbackError) {
        System.err.println("Fallback rating also failed: " + fallbackError.getMessage());
      }
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

      String ratingPrompt =
          String.format(
              "You are judging a prompt writing competition. Here's the scenario and two "
                  + "competing prompts:\n\n"
                  + "SCENARIO: %s\n\n"
                  + "PROMPT 1: %s\n\n"
                  + "PROMPT 2: %s\n\n"
                  + "Please evaluate both prompts based on:\n"
                  + "1. Relevance to the scenario (25%%)\n"
                  + "2. Clarity and specificity (25%%)\n"
                  + "3. Creativity and innovation (25%%)\n"
                  + "4. Practical effectiveness for AI (25%%)\n\n"
                  + "Provide:\n"
                  + "1. A score for each prompt (1-10)\n"
                  + "2. A brief explanation of your scoring\n"
                  + "3. Declare the winner\n\n"
                  + "Format your response as:\n"
                  + "Prompt 1 Score: X/10\n"
                  + "Prompt 2 Score: Y/10\n"
                  + "Winner: [Prompt 1/Prompt 2/Tie]\n"
                  + "Explanation: [Your detailed analysis]",
              scenario, player1Prompt, player2Prompt);

      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", "deepseek/deepseek-r1-0528-qwen3-8b:free");

      List<Map<String, Object>> messages = List.of(Map.of("role", "user", "content", ratingPrompt));
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
      // Parse the scores
      java.util.regex.Pattern player1ScorePattern =
          java.util.regex.Pattern.compile(
              "Prompt 1 Score:\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);
      java.util.regex.Pattern player2ScorePattern =
          java.util.regex.Pattern.compile(
              "Prompt 2 Score:\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);

      java.util.regex.Matcher player1Matcher = player1ScorePattern.matcher(result);
      java.util.regex.Matcher player2Matcher = player2ScorePattern.matcher(result);

      int player1Score = 5; // Default
      int player2Score = 5; // Default

      if (player1Matcher.find()) {
        player1Score = Integer.parseInt(player1Matcher.group(1));
      }

      if (player2Matcher.find()) {
        player2Score = Integer.parseInt(player2Matcher.group(1));
      }

      ratings.put("player1Score", player1Score);
      ratings.put("player2Score", player2Score);
      ratings.put("explanation", result);

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
    System.out.println(
        "Before restart - Player1 prompt: "
            + (game.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println(
        "Before restart - Player2 prompt: "
            + (game.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));

    // Reset game state for a new round
    game.setGameState(GameState.WAITING); // Set to WAITING so frontend can call generate-scenario
    game.setScenario(null); // Clear scenario so it can be regenerated
    game.setPlayer1Prompt(null);
    game.setPlayer2Prompt(null);
    game.setPlayer1Rating(null);
    game.setPlayer2Rating(null);
    game.setPlayer1Score(null);
    game.setPlayer2Score(null);
    game.setRatingExplanation(null);
    game.setWinnerId(null);
    game.setEndedAt(null);

    System.out.println(
        "After reset - Player1 prompt: " + (game.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println(
        "After reset - Player2 prompt: " + (game.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println("Scenario cleared for regeneration: " + (game.getScenario() != null ? "EXISTS" : "NULL"));
    System.out.println("Game state set to: " + game.getGameState());

    Game savedGame = gameRepository.save(game);

    System.out.println(
        "After save - Player1 prompt: "
            + (savedGame.getPlayer1Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println(
        "After save - Player2 prompt: "
            + (savedGame.getPlayer2Prompt() != null ? "EXISTS" : "NULL"));
    System.out.println("Final game state: " + savedGame.getGameState());
    System.out.println("Ready for scenario generation: " + (savedGame.getScenario() == null ? "YES" : "NO"));

    // Notify both players that the game has been restarted
    Map<String, Object> gameUpdate = new HashMap<>();
    gameUpdate.put("type", "GAME_RESTARTED");
    gameUpdate.put("gameId", savedGame.getId().toString());
    gameUpdate.put("gameState", savedGame.getGameState().toString());

    webSocketService.sendGameUpdate(savedGame.getPlayer1Id(), gameUpdate);
    webSocketService.sendGameUpdate(savedGame.getPlayer2Id(), gameUpdate);

    System.out.println("Sent game restart notification to both players for game: " + savedGame.getId());

    return savedGame;
  }
}
