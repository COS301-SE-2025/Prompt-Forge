package com.fiveOps.promptforge.promptwars.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.service.GameService;

@RestController
@RequestMapping("/api/prompt-wars/games")
@CrossOrigin(origins = "http://localhost:5173")
public class PromptWarsGameController {

  @Autowired private GameService gameService;

  @GetMapping("/{gameId}")
  public ResponseEntity<Game> getGame(@PathVariable String gameId) {
    try {
      UUID id = UUID.fromString(gameId);
      Game game = gameService.getGame(id);
      return ResponseEntity.ok(game);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/{gameId}/start")
  public ResponseEntity<Game> startGame(
      @PathVariable String gameId, @RequestBody Map<String, Object> request) {
    try {
      UUID id = UUID.fromString(gameId);
      Game game = gameService.getGame(id);
      // Game should already be started when created from challenge
      return ResponseEntity.ok(game);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/{gameId}/generate-scenario")
  public ResponseEntity<Map<String, String>> generateScenario(@PathVariable String gameId) {
    try {
      UUID id = UUID.fromString(gameId);
      Game game = gameService.generateScenario(id);
      return ResponseEntity.ok(Map.of("scenario", game.getScenario()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/{gameId}/submit-prompt")
  public ResponseEntity<Void> submitPrompt(
      @PathVariable String gameId,
      @RequestBody Map<String, String> request,
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
    try {
      UUID id = UUID.fromString(gameId);
      String prompt = request.get("prompt");
      UUID playerId = UUID.fromString(userIdHeader);
      gameService.submitPrompt(id, playerId, prompt);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/{gameId}/rate-prompt")
  public ResponseEntity<Void> ratePrompt(
      @PathVariable String gameId,
      @RequestBody Map<String, Integer> request,
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
    try {
      UUID id = UUID.fromString(gameId);
      Integer rating = request.get("rating");
      UUID playerId = UUID.fromString(userIdHeader);
      gameService.ratePrompt(id, playerId, rating);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/{gameId}/state")
  public ResponseEntity<Map<String, Object>> getGameState(@PathVariable String gameId) {
    try {
      UUID id = UUID.fromString(gameId);
      Game game = gameService.getGame(id);

      Map<String, Object> state =
          Map.of(
              "game", game,
              "submissions", List.of(),
              "playerSubmissions", List.of(),
              "opponentSubmissions", List.of(),
              "currentRound", game.getCurrentRound() != null ? game.getCurrentRound() : 1);

      return ResponseEntity.ok(state);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/my-games")
  public ResponseEntity<List<Game>> getMyGames() {
    try {
      // This would need user context from JWT
      return ResponseEntity.ok(List.of());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/active")
  public ResponseEntity<List<Game>> getActiveGames(
      @RequestHeader("X-User-Id") String userIdHeader) {
    try {
      java.util.UUID userId = java.util.UUID.fromString(userIdHeader);
      List<Game> activeGames = gameService.getActiveGames(userId);
      return ResponseEntity.ok(activeGames);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/{gameId}/forfeit")
  public ResponseEntity<Void> forfeitGame(@PathVariable String gameId) {
    try {
      // Implementation needed
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  // Cancel the user's active game
  @DeleteMapping("/active")
  public ResponseEntity<?> cancelActiveGame(@RequestHeader("X-User-Id") String userIdHeader) {
    try {
      java.util.UUID userId = java.util.UUID.fromString(userIdHeader);
      boolean cancelled = gameService.cancelActiveGameForUser(userId);
      if (cancelled) {
        return ResponseEntity.ok("Active game cancelled");
      } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No active game found for user");
      }
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to cancel active game: " + e.getMessage());
    }
  }
}
