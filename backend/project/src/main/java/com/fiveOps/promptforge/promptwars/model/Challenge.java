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
@Table(name = "prompt_wars_challenges")
public class Challenge {

  @Id private UUID id;

  @Column(name = "challenger_id", nullable = false)
  private UUID challengerId;

  @Column(name = "opponent_id", nullable = false)
  private UUID opponentId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ChallengeStatus status = ChallengeStatus.PENDING;

  @Column(length = 200)
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(name = "game_type", nullable = false)
  private GameType gameType = GameType.PROMPT_CREATION;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "responded_at")
  private Instant respondedAt;

  // Default constructor
  public Challenge() {
    this.id = UUID.randomUUID();
    this.createdAt = Instant.now();
    this.expiresAt = Instant.now().plusSeconds(300); // 5 minutes
  }

  // Constructor with required fields
  public Challenge(UUID challengerId, UUID opponentId) {
    this();
    this.challengerId = challengerId;
    this.opponentId = opponentId;
  }

  // Constructor with required fields and game type
  public Challenge(UUID challengerId, UUID opponentId, GameType gameType) {
    this();
    this.challengerId = challengerId;
    this.opponentId = opponentId;
    this.gameType = gameType;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getChallengerId() {
    return challengerId;
  }

  public void setChallengerId(UUID challengerId) {
    this.challengerId = challengerId;
  }

  public UUID getOpponentId() {
    return opponentId;
  }

  public void setOpponentId(UUID opponentId) {
    this.opponentId = opponentId;
  }

  public ChallengeStatus getStatus() {
    return status;
  }

  public void setStatus(ChallengeStatus status) {
    this.status = status;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }

  public Instant getRespondedAt() {
    return respondedAt;
  }

  public void setRespondedAt(Instant respondedAt) {
    this.respondedAt = respondedAt;
  }

  public GameType getGameType() {
    return gameType;
  }

  public void setGameType(GameType gameType) {
    this.gameType = gameType;
  }

  // Utility methods
  public boolean isExpired() {
    return Instant.now().isAfter(this.expiresAt);
  }

  public boolean isPending() {
    return this.status == ChallengeStatus.PENDING && !isExpired();
  }

  public void accept() {
    this.status = ChallengeStatus.ACCEPTED;
    this.respondedAt = Instant.now();
  }

  public void decline() {
    this.status = ChallengeStatus.DECLINED;
    this.respondedAt = Instant.now();
  }

  public void expire() {
    this.status = ChallengeStatus.EXPIRED;
    this.respondedAt = Instant.now();
  }
}
