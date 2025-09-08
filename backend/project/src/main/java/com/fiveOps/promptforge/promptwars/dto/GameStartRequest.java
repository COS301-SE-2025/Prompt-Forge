package com.fiveOps.promptforge.promptwars.dto;

public class GameStartRequest {
  // This could include game preferences in future
  private String gameMode;

  public GameStartRequest() {}

  public GameStartRequest(String gameMode) {
    this.gameMode = gameMode;
  }

  public String getGameMode() {
    return gameMode;
  }

  public void setGameMode(String gameMode) {
    this.gameMode = gameMode;
  }
}
