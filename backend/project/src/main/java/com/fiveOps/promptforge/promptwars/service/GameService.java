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
  public Game generateScenario(UUID gameId) {
    Game game = getGame(gameId);

    if (game.getGameState() != GameState.WAITING) {
      throw new IllegalArgumentException("Game is not in waiting state");
    }

    // Only generate scenario if not already set
    if (game.getScenario() == null || game.getScenario().trim().isEmpty()) {
      // Generate scenario using OpenRouter AI
      String scenario = generateAIScenario();
      game.setScenario(scenario);
    }

    game.setGameState(GameState.WRITING);
    Game savedGame = gameRepository.save(game);

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
      
      List<Map<String, Object>> messages = List.of(Map.of(
        "role", "user",
        "content", "Generate a creative and engaging scenario for a prompt writing competition. The scenario should be:\n" +
                  "1. Specific enough to guide prompt creation\n" +
                  "2. Open-ended enough to allow creativity\n" +
                  "3. Interesting and fun to work with\n" +
                  "4. Suitable for AI prompt engineering\n\n" +
                  "Please provide just the scenario description in 2-3 sentences, nothing else.\n\n" +
                  "Examples of good scenarios:\n" +
                  "- \"You're a time traveler who accidentally changed history. Write a prompt to help an AI figure out what went wrong and how to fix it.\"\n" +
                  "- \"An alien species has just made contact with Earth, but they only communicate through colors and emotions. Create a prompt for an AI to help establish meaningful communication.\"\n" +
                  "- \"You've discovered that your dreams are actually glimpses into parallel universes. Design a prompt for an AI to help you navigate and understand these alternate realities.\"\n\n" +
                  "Generate a new, unique scenario:"
      ));
      requestBody.put("messages", messages);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      ResponseEntity<String> response = restTemplate.exchange(
          openRouterBaseUrl + "/chat/completions",
          HttpMethod.POST,
          entity,
          String.class
      );

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
      "Write a story about a time traveler who discovers they can only travel to moments of great personal regret.",
      "Describe a world where emotions are visible as colors that surround people.",
      "Tell the story of the last bookstore on Earth.",
      "Write about a character who can hear the thoughts of inanimate objects.",
      "Describe a society where people age backwards.",
      "Write about a person who wakes up with a superpower they desperately don't want.",
      "Tell the story of a museum night guard who discovers the exhibits come alive.",
      "Write about a world where lies become physical objects.",
      "Describe a character who can taste colors and see sounds.",
      "Write about the day gravity stopped working.",
    };
    return scenarios[(int) (Math.random() * scenarios.length)];
  }

  public Game submitPrompt(UUID gameId, UUID playerId, String prompt) {
    Game game = getGame(gameId);

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

    // If both players have submitted, automatically get AI rating and finish game
    if (game.bothPlayersSubmittedPrompts()) {
      // Automatically get AI rating and determine winner
      CompletableFuture.runAsync(() -> {
        try {
          performAIRating(gameId);
        } catch (Exception e) {
          System.err.println("Error performing AI rating: " + e.getMessage());
          e.printStackTrace();
        }
      });
    }

    Game savedGame = gameRepository.save(game);

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

  private void performAIRating(UUID gameId) {
    try {
      Game game = getGame(gameId);
      
      if (!game.bothPlayersSubmittedPrompts()) {
        return;
      }

      // Get AI rating for both prompts
      Map<String, Object> ratings = getAIRating(game.getScenario(), game.getPlayer1Prompt(), game.getPlayer2Prompt());
      
      int player1Score = (Integer) ratings.get("player1Score");
      int player2Score = (Integer) ratings.get("player2Score");
      
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
      gameUpdate.put("gameId", gameId.toString());
      gameUpdate.put("gameState", "FINISHED");
      gameUpdate.put("player1Score", player1Score);
      gameUpdate.put("player2Score", player2Score);
      gameUpdate.put("winnerId", winner != null ? winner.toString() : null);
      gameUpdate.put("explanation", ratings.get("explanation"));

      webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
      webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

      System.out.println("Sent game finished update to both players for game: " + gameId);
      
    } catch (Exception e) {
      System.err.println("Error in performAIRating: " + e.getMessage());
      e.printStackTrace();
    }
  }

  private Map<String, Object> getAIRating(String scenario, String player1Prompt, String player2Prompt) {
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

      String ratingPrompt = String.format(
        "You are judging a prompt writing competition. Here's the scenario and two competing prompts:\n\n" +
        "SCENARIO: %s\n\n" +
        "PROMPT 1: %s\n\n" +
        "PROMPT 2: %s\n\n" +
        "Please evaluate both prompts based on:\n" +
        "1. Relevance to the scenario (25%%)\n" +
        "2. Clarity and specificity (25%%)\n" +
        "3. Creativity and innovation (25%%)\n" +
        "4. Practical effectiveness for AI (25%%)\n\n" +
        "Provide:\n" +
        "1. A score for each prompt (1-10)\n" +
        "2. A brief explanation of your scoring\n" +
        "3. Declare the winner\n\n" +
        "Format your response as:\n" +
        "Prompt 1 Score: X/10\n" +
        "Prompt 2 Score: Y/10\n" +
        "Winner: [Prompt 1/Prompt 2/Tie]\n" +
        "Explanation: [Your detailed analysis]",
        scenario, player1Prompt, player2Prompt
      );

      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", "deepseek/deepseek-r1-0528-qwen3-8b:free");
      
      List<Map<String, Object>> messages = List.of(Map.of(
        "role", "user",
        "content", ratingPrompt
      ));
      requestBody.put("messages", messages);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      ResponseEntity<String> response = restTemplate.exchange(
          openRouterBaseUrl + "/chat/completions",
          HttpMethod.POST,
          entity,
          String.class
      );

      JsonNode jsonNode = objectMapper.readTree(response.getBody());
      if (jsonNode.has("choices") && jsonNode.get("choices").size() > 0) {
        JsonNode choice = jsonNode.get("choices").get(0);
        if (choice.has("message") && choice.get("message").has("content")) {
          String result = choice.get("message").get("content").asText();
          return parseRatingResult(result);
        }
      }

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
      java.util.regex.Pattern player1ScorePattern = java.util.regex.Pattern.compile("Prompt 1 Score:\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);
      java.util.regex.Pattern player2ScorePattern = java.util.regex.Pattern.compile("Prompt 2 Score:\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);
      
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
    int score1 = 6 + (int)(Math.random() * 3); // 6-8
    int score2 = 6 + (int)(Math.random() * 3); // 6-8
    
    ratings.put("player1Score", score1);
    ratings.put("player2Score", score2);
    ratings.put("explanation", "AI rating service unavailable. Random scores assigned: Prompt 1: " + score1 + "/10, Prompt 2: " + score2 + "/10");
    
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
}
