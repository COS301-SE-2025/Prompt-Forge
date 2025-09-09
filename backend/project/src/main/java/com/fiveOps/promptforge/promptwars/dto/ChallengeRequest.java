package com.fiveOps.promptforge.promptwars.dto;

import java.util.UUID;

public class ChallengeRequest {
  private UUID opponentId;
  private String message;

  public ChallengeRequest() {}

  public ChallengeRequest(UUID opponentId, String message) {
    this.opponentId = opponentId;
    this.message = message;
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
}
