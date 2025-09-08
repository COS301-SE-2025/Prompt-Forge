package com.fiveOps.promptforge.promptwars.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameState;
import com.fiveOps.promptforge.promptwars.repository.GameRepository;

@Service
@Transactional
public class GameService {

  @Autowired private GameRepository gameRepository;

  @Autowired private WebSocketService webSocketService;

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
      // Simple scenario generation - in production this could call an AI service
      String[] scenarios = {
        "Write a story about a time traveler who discovers they can only travel to moments "
            + "of great personal regret.",
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

      String scenario = scenarios[(int) (Math.random() * scenarios.length)];
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

    // If both players have submitted, move to rating phase
    if (game.bothPlayersSubmittedPrompts()) {
      game.setGameState(GameState.RATING);
    }

    Game savedGame = gameRepository.save(game);

    // Send real-time notifications to both players
    Map<String, Object> gameUpdate = new HashMap<>();
    gameUpdate.put("type", "PROMPT_SUBMITTED");
    gameUpdate.put("gameId", gameId.toString());
    gameUpdate.put("playerId", playerId.toString());
    gameUpdate.put("gameState", savedGame.getGameState().toString());

    // If both submitted, notify phase change
    if (savedGame.bothPlayersSubmittedPrompts()) {
      gameUpdate.put("type", "PHASE_CHANGE");
      gameUpdate.put("newPhase", "RATING");
    }

    webSocketService.sendGameUpdate(game.getPlayer1Id(), gameUpdate);
    webSocketService.sendGameUpdate(game.getPlayer2Id(), gameUpdate);

    System.out.println("Sent prompt submission update to both players for game: " + gameId);

    return savedGame;
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
}
