package com.fiveOps.promptforge.promptwars.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "prompt_wars_games")
public class Game {

  @Id private UUID id;

  @Column(name = "player1_id", nullable = false)
  private UUID player1Id;

  @Column(name = "player2_id", nullable = false)
  private UUID player2Id;

  @Enumerated(EnumType.STRING)
  @Column(name = "game_state", nullable = false)
  private GameState gameState = GameState.WAITING;

  @Column(columnDefinition = "TEXT")
  private String scenario;

  @Column(name = "player1_prompt", columnDefinition = "TEXT")
  private String player1Prompt;

  @Column(name = "player2_prompt", columnDefinition = "TEXT")
  private String player2Prompt;

  @Column(name = "player1_rating")
  private Integer player1Rating;

  @Column(name = "player2_rating")
  private Integer player2Rating;

  @Column(name = "player1_score")
  private Integer player1Score;

  @Column(name = "player2_score")
  private Integer player2Score;

  @Column(name = "rating_explanation", columnDefinition = "TEXT")
  private String ratingExplanation;

  @Column(name = "current_round")
  private Integer currentRound = 1;

  @Column(name = "started_at")
  private Instant startedAt;

  @Column(name = "ended_at")
  private Instant endedAt;

  @Column(name = "winner_id")
  private UUID winnerId;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  // Default constructor
  public Game() {
    this.id = UUID.randomUUID();
    this.createdAt = Instant.now();
  }

  // Constructor with players
  public Game(UUID player1Id, UUID player2Id) {
    this();
    this.player1Id = player1Id;
    this.player2Id = player2Id;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getPlayer1Id() {
    return player1Id;
  }

  public void setPlayer1Id(UUID player1Id) {
    this.player1Id = player1Id;
  }

  public UUID getPlayer2Id() {
    return player2Id;
  }

  public void setPlayer2Id(UUID player2Id) {
    this.player2Id = player2Id;
  }

  public GameState getGameState() {
    return gameState;
  }

  public void setGameState(GameState gameState) {
    this.gameState = gameState;
  }

  public String getScenario() {
    return scenario;
  }

  public void setScenario(String scenario) {
    this.scenario = scenario;
  }

  public Instant getStartedAt() {
    return startedAt;
  }

  public void setStartedAt(Instant startedAt) {
    this.startedAt = startedAt;
  }

  public Instant getEndedAt() {
    return endedAt;
  }

  public void setEndedAt(Instant endedAt) {
    this.endedAt = endedAt;
  }

  public UUID getWinnerId() {
    return winnerId;
  }

  public void setWinnerId(UUID winnerId) {
    this.winnerId = winnerId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public String getPlayer1Prompt() {
    return player1Prompt;
  }

  public void setPlayer1Prompt(String player1Prompt) {
    this.player1Prompt = player1Prompt;
  }

  public String getPlayer2Prompt() {
    return player2Prompt;
  }

  public void setPlayer2Prompt(String player2Prompt) {
    this.player2Prompt = player2Prompt;
  }

  public Integer getPlayer1Rating() {
    return player1Rating;
  }

  public void setPlayer1Rating(Integer player1Rating) {
    this.player1Rating = player1Rating;
  }

  public Integer getPlayer2Rating() {
    return player2Rating;
  }

  public void setPlayer2Rating(Integer player2Rating) {
    this.player2Rating = player2Rating;
  }

  public Integer getPlayer1Score() {
    return player1Score;
  }

  public void setPlayer1Score(Integer player1Score) {
    this.player1Score = player1Score;
  }

  public Integer getPlayer2Score() {
    return player2Score;
  }

  public void setPlayer2Score(Integer player2Score) {
    this.player2Score = player2Score;
  }

  public String getRatingExplanation() {
    return ratingExplanation;
  }

  public void setRatingExplanation(String ratingExplanation) {
    this.ratingExplanation = ratingExplanation;
  }

  public Integer getCurrentRound() {
    return currentRound;
  }

  public void setCurrentRound(Integer currentRound) {
    this.currentRound = currentRound;
  }

  // Utility methods
  public boolean isPlayerInGame(UUID playerId) {
    return playerId.equals(this.player1Id) || playerId.equals(this.player2Id);
  }

  public UUID getOpponentId(UUID playerId) {
    if (playerId.equals(this.player1Id)) {
      return this.player2Id;
    } else if (playerId.equals(this.player2Id)) {
      return this.player1Id;
    }
    return null;
  }

  public boolean isActive() {
    return this.gameState != GameState.FINISHED && this.gameState != GameState.CANCELLED;
  }

  public void start() {
    this.gameState = GameState.SCENARIO;
    this.startedAt = Instant.now();
  }

  public void finish(UUID winnerId) {
    this.gameState = GameState.FINISHED;
    this.winnerId = winnerId;
    this.endedAt = Instant.now();
  }

  public void cancel() {
    this.gameState = GameState.CANCELLED;
    this.endedAt = Instant.now();
  }

  // Prompt Wars specific methods
  public void submitPrompt(UUID playerId, String prompt) {
    if (playerId.equals(this.player1Id)) {
      this.player1Prompt = prompt;
    } else if (playerId.equals(this.player2Id)) {
      this.player2Prompt = prompt;
    } else {
      throw new IllegalArgumentException("Player is not in this game");
    }
  }

  public void rateOpponentPrompt(UUID playerId, Integer rating) {
    if (rating < 1 || rating > 10) {
      throw new IllegalArgumentException("Rating must be between 1 and 10");
    }

    if (playerId.equals(this.player1Id)) {
      this.player1Rating = rating;
    } else if (playerId.equals(this.player2Id)) {
      this.player2Rating = rating;
    } else {
      throw new IllegalArgumentException("Player is not in this game");
    }
  }

  public boolean hasPlayerSubmittedPrompt(UUID playerId) {
    if (playerId.equals(this.player1Id)) {
      return this.player1Prompt != null && !this.player1Prompt.trim().isEmpty();
    } else if (playerId.equals(this.player2Id)) {
      return this.player2Prompt != null && !this.player2Prompt.trim().isEmpty();
    }
    return false;
  }

  public boolean bothPlayersSubmittedPrompts() {
    return hasPlayerSubmittedPrompt(this.player1Id) && hasPlayerSubmittedPrompt(this.player2Id);
  }

  public boolean hasPlayerRated(UUID playerId) {
    if (playerId.equals(this.player1Id)) {
      return this.player1Rating != null;
    } else if (playerId.equals(this.player2Id)) {
      return this.player2Rating != null;
    }
    return false;
  }

  public boolean bothPlayersRated() {
    return this.player1Rating != null && this.player2Rating != null;
  }

  public UUID calculateWinner() {
    // Use AI scores if available (new system)
    if (this.player1Score != null && this.player2Score != null) {
      if (this.player1Score > this.player2Score) {
        return this.player1Id; // Player 1 has higher AI score
      } else if (this.player2Score > this.player1Score) {
        return this.player2Id; // Player 2 has higher AI score
      }
      return null; // Tie
    }

    // Fallback to old rating system
    if (!bothPlayersRated()) {
      return null;
    }

    if (this.player1Rating > this.player2Rating) {
      return this.player2Id; // Player 1 rated Player 2 higher = Player 2 wins
    } else if (this.player2Rating > this.player1Rating) {
      return this.player1Id; // Player 2 rated Player 1 higher = Player 1 wins
    }

    return null; // Tie
  }
}
