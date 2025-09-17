package com.fiveOps.promptforge.promptwars.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.promptwars.dto.ChallengeRequest;
import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.service.ChallengeService;

@RestController
@RequestMapping("/api/prompt-wars/challenges")
@CrossOrigin(origins = "*")
public class PromptWarsChallengeController {

  @Autowired private ChallengeService challengeService;

  // Send a challenge to another user
  @PostMapping("/send")
  public ResponseEntity<?> sendChallenge(
      @RequestHeader("X-User-Id") UUID challengerId, @RequestBody ChallengeRequest request) {
    try {
      System.out.println(
          "DEBUG: Sending challenge from " + challengerId + " to " + request.getOpponentId());
      System.out.println("DEBUG: Message: " + request.getMessage());

      Challenge challenge =
          challengeService.sendChallenge(
              challengerId, request.getOpponentId(), request.getMessage(), request.getGameType());

      System.out.println("DEBUG: Challenge created successfully with ID: " + challenge.getId());
      return ResponseEntity.ok(challenge);
    } catch (IllegalArgumentException e) {
      System.err.println("DEBUG: IllegalArgumentException: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      System.err.println("DEBUG: Exception type: " + e.getClass().getName());
      System.err.println("DEBUG: Exception message: " + e.getMessage());
      System.err.println("DEBUG: Exception cause: " + e.getCause());
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(
              "Failed to send challenge: " + e.getClass().getSimpleName() + " - " + e.getMessage());
    }
  }

  // Accept a challenge
  @PostMapping("/{challengeId}/accept")
  public ResponseEntity<?> acceptChallenge(
      @PathVariable UUID challengeId, @RequestHeader("X-User-Id") UUID playerId) {
    try {
      Game game = challengeService.acceptChallenge(challengeId, playerId);
      return ResponseEntity.ok(game);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to accept challenge: " + e.getMessage());
    }
  }

  // Decline a challenge
  @PostMapping("/{challengeId}/decline")
  public ResponseEntity<?> declineChallenge(
      @PathVariable UUID challengeId, @RequestHeader("X-User-Id") UUID playerId) {
    try {
      challengeService.declineChallenge(challengeId, playerId);
      return ResponseEntity.ok().body("Challenge declined successfully");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to decline challenge: " + e.getMessage());
    }
  }

  // Get all challenges for a user (incoming and outgoing)
  @GetMapping("/my-challenges")
  public ResponseEntity<?> getUserChallenges(@RequestHeader("X-User-Id") UUID userId) {
    try {
      List<Challenge> challenges = challengeService.getUserChallenges(userId);
      return ResponseEntity.ok(challenges);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to get challenges: " + e.getMessage());
    }
  }

  // Get incoming challenges for a user
  @GetMapping("/incoming")
  public ResponseEntity<?> getIncomingChallenges(@RequestHeader("X-User-Id") UUID userId) {
    try {
      List<Challenge> challenges = challengeService.getIncomingChallenges(userId);
      return ResponseEntity.ok(challenges);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to get incoming challenges: " + e.getMessage());
    }
  }

  // Get outgoing challenges for a user
  @GetMapping("/outgoing")
  public ResponseEntity<?> getOutgoingChallenges(@RequestHeader("X-User-Id") UUID userId) {
    try {
      List<Challenge> challenges = challengeService.getOutgoingChallenges(userId);
      return ResponseEntity.ok(challenges);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to get outgoing challenges: " + e.getMessage());
    }
  }

  // Get details of a specific challenge
  @GetMapping("/{challengeId}")
  public ResponseEntity<?> getChallengeDetails(
      @PathVariable UUID challengeId, @RequestHeader("X-User-Id") UUID userId) {
    try {
      List<Challenge> userChallenges = challengeService.getUserChallenges(userId);
      Challenge challenge =
          userChallenges.stream()
              .filter(c -> c.getId().equals(challengeId))
              .findFirst()
              .orElse(null);

      if (challenge == null) {
        return ResponseEntity.notFound().build();
      }

      return ResponseEntity.ok(challenge);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to get challenge details: " + e.getMessage());
    }
  }
}
