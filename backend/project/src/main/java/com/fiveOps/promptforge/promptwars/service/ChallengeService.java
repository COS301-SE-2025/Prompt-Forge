package com.fiveOps.promptforge.promptwars.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameState;
import com.fiveOps.promptforge.promptwars.repository.ChallengeRepository;
import com.fiveOps.promptforge.promptwars.repository.GameRepository;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
@Transactional
public class ChallengeService {

  @Autowired private ChallengeRepository challengeRepository;

  @Autowired private GameRepository gameRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private WebSocketService webSocketService;

  @Autowired private GameService gameService;

  public Challenge sendChallenge(UUID challengerId, UUID opponentId, String message) {
    System.out.println(
        "DEBUG: Starting sendChallenge - challengerId: "
            + challengerId
            + ", opponentId: "
            + opponentId);

    try {
      // Validation
      System.out.println("DEBUG: Starting validation...");
      validateChallengeRequest(challengerId, opponentId);
      System.out.println("DEBUG: Basic validation passed");

      // Check if players are friends (following each other)
      System.out.println("DEBUG: Checking if users are friends...");
      if (!areUsersFriends(challengerId, opponentId)) {
        throw new IllegalArgumentException("Can only challenge users you follow");
      }
      System.out.println("DEBUG: Users are friends");

      // Check if opponent is online
      System.out.println("DEBUG: Checking if opponent is online...");
      if (!isUserOnline(opponentId)) {
        throw new IllegalArgumentException("User is currently offline");
      }
      System.out.println("DEBUG: Opponent is online");

      // Check for existing pending challenges between these users
      System.out.println("DEBUG: Checking for existing pending challenges...");
      if (challengeRepository.existsPendingChallengeBetweenUsers(
          challengerId, opponentId, Instant.now())) {
        throw new IllegalArgumentException("Already have a pending challenge with this user");
      }
      System.out.println("DEBUG: No existing pending challenges");

      // Create challenge
      System.out.println("DEBUG: Creating challenge...");
      Challenge challenge = new Challenge(challengerId, opponentId);
      if (message != null && !message.trim().isEmpty()) {
        challenge.setMessage(message.trim());
      }
      System.out.println("DEBUG: Challenge object created");

      System.out.println("DEBUG: Saving challenge to database...");
      Challenge saved = challengeRepository.save(challenge);
      System.out.println("DEBUG: Challenge saved with ID: " + saved.getId());

      // Send real-time notification to opponent
      System.out.println("DEBUG: Fetching challenger user info...");
      User challenger =
          userRepository
              .findById(challengerId)
              .orElseThrow(() -> new IllegalArgumentException("Challenger not found"));
      System.out.println("DEBUG: Challenger found: " + challenger.getUsername());

      System.out.println("DEBUG: Sending WebSocket notification...");
      webSocketService.sendChallengeNotification(opponentId, saved, challenger);
      System.out.println("DEBUG: Challenge sent successfully");

      return saved;
    } catch (Exception e) {
      System.err.println("DEBUG: Exception in sendChallenge: " + e.getClass().getName());
      System.err.println("DEBUG: Exception message: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  public Game acceptChallenge(UUID challengeId, UUID playerId) {
    Challenge challenge =
        challengeRepository
            .findById(challengeId)
            .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

    // Validate acceptance
    if (!challenge.getOpponentId().equals(playerId)) {
      throw new IllegalArgumentException("Cannot accept challenge for another player");
    }

    if (!challenge.isPending()) {
      throw new IllegalArgumentException("Challenge is no longer pending or has expired");
    }

    // Check if either player is already in an active game
    if (gameRepository.isPlayerInActiveGame(
            challenge.getChallengerId(), GameState.FINISHED, GameState.CANCELLED)
        || gameRepository.isPlayerInActiveGame(
            challenge.getOpponentId(), GameState.FINISHED, GameState.CANCELLED)) {
      throw new IllegalArgumentException("One or both players are already in an active game");
    }

    // Accept challenge
    challenge.accept();
    challengeRepository.save(challenge);

    // Create game
    Game game = gameService.createGame(challenge.getChallengerId(), challenge.getOpponentId());

    // Notify both players
    User challenger = userRepository.findById(challenge.getChallengerId()).orElseThrow();
    User opponent = userRepository.findById(challenge.getOpponentId()).orElseThrow();

    webSocketService.sendGameStartNotification(
        challenge.getChallengerId(),
        game.getId(),
        challenger.getUsername(),
        opponent.getUsername());
    webSocketService.sendGameStartNotification(
        challenge.getOpponentId(), game.getId(), challenger.getUsername(), opponent.getUsername());

    return game;
  }

  public void declineChallenge(UUID challengeId, UUID playerId) {
    Challenge challenge =
        challengeRepository
            .findById(challengeId)
            .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

    // Validate decline
    if (!challenge.getOpponentId().equals(playerId)) {
      throw new IllegalArgumentException("Cannot decline challenge for another player");
    }

    if (!challenge.isPending()) {
      throw new IllegalArgumentException("Challenge is no longer pending");
    }

    // Decline challenge
    challenge.decline();
    challengeRepository.save(challenge);

    // Notify challenger
    webSocketService.sendChallengeDeclined(challenge.getChallengerId(), challengeId);
  }

  public List<Challenge> getUserChallenges(UUID userId) {
    return challengeRepository.findByUser(userId);
  }

  public List<Challenge> getIncomingChallenges(UUID userId) {
    return challengeRepository.findIncomingChallenges(userId);
  }

  public List<Challenge> getOutgoingChallenges(UUID userId) {
    return challengeRepository.findOutgoingChallenges(userId);
  }

  // Scheduled task to expire old challenges
  @Scheduled(fixedDelay = 60000) // Run every minute
  public void expireOldChallenges() {
    List<Challenge> expiredChallenges = challengeRepository.findExpiredChallenges(Instant.now());

    for (Challenge challenge : expiredChallenges) {
      challenge.expire();
      challengeRepository.save(challenge);

      // Notify challenger that challenge expired
      webSocketService.sendChallengeExpired(challenge.getChallengerId(), challenge.getId());
    }
  }

  private void validateChallengeRequest(UUID challengerId, UUID opponentId) {
    // Can't challenge yourself
    if (challengerId.equals(opponentId)) {
      throw new IllegalArgumentException("Cannot challenge yourself");
    }

    // Check if either player is already in an active game
    if (gameRepository.isPlayerInActiveGame(
        challengerId, GameState.FINISHED, GameState.CANCELLED)) {
      throw new IllegalArgumentException("You are already in an active game");
    }

    if (gameRepository.isPlayerInActiveGame(opponentId, GameState.FINISHED, GameState.CANCELLED)) {
      throw new IllegalArgumentException("This player is already in an active game");
    }

    // Check if users exist
    if (!userRepository.existsById(challengerId) || !userRepository.existsById(opponentId)) {
      throw new IllegalArgumentException("Invalid user");
    }
  }

  private boolean areUsersFriends(UUID userId1, UUID userId2) {
    // In a real implementation, check if users follow each other
    // For now, assume they're friends if both users exist
    return userRepository.existsById(userId1) && userRepository.existsById(userId2);
  }

  private boolean isUserOnline(UUID userId) {
    // In a real implementation, check user's online status
    // For now, assume user is online if they exist
    return userRepository.existsById(userId);
  }
}
