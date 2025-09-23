package com.fiveOps.promptforge.promptwars.dto;

import java.util.UUID;

public class GameStartNotification {
  private UUID gameId;
  private UUID player1Id;
  private UUID player2Id;
  private String player1Username;
  private String player2Username;

  public GameStartNotification() {}

  public GameStartNotification(
      UUID gameId, UUID player1Id, UUID player2Id, String player1Username, String player2Username) {
    this.gameId = gameId;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.player1Username = player1Username;
    this.player2Username = player2Username;
  }

  public UUID getGameId() {
    return gameId;
  }

  public void setGameId(UUID gameId) {
    this.gameId = gameId;
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

  public String getPlayer1Username() {
    return player1Username;
  }

  public void setPlayer1Username(String player1Username) {
    this.player1Username = player1Username;
  }

  public String getPlayer2Username() {
    return player2Username;
  }

  public void setPlayer2Username(String player2Username) {
    this.player2Username = player2Username;
  }
}
