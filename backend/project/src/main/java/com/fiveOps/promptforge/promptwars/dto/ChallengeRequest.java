package com.fiveOps.promptforge.promptwars.dto;

import java.util.UUID;

import com.fiveOps.promptforge.promptwars.model.GameType;

public class ChallengeRequest {
  private UUID opponentId;
  private String message;
  private GameType gameType = GameType.PROMPT_CREATION;

  public ChallengeRequest() {}

  public ChallengeRequest(UUID opponentId, String message) {
    this.opponentId = opponentId;
    this.message = message;
  }

  public ChallengeRequest(UUID opponentId, String message, GameType gameType) {
    this.opponentId = opponentId;
    this.message = message;
    this.gameType = gameType;
  }

  public UUID getOpponentId() {
    return opponentId;
  }

  public void setOpponentId(UUID opponentId) {
    this.opponentId = opponentId;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public GameType getGameType() {
    return gameType;
  }

  public void setGameType(GameType gameType) {
    this.gameType = gameType;
  }
}
