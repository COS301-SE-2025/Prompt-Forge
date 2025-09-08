package com.fiveOps.promptforge.promptwars.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameState;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {

  // Check if a player is in any active game
  @Query(
      "SELECT COUNT(g) > 0 FROM Game g WHERE "
          + "(g.player1Id = :playerId OR g.player2Id = :playerId) "
          + "AND g.gameState NOT IN (:finishedState, :cancelledState)")
  boolean isPlayerInActiveGame(
      @Param("playerId") UUID playerId,
      @Param("finishedState") GameState finishedState,
      @Param("cancelledState") GameState cancelledState);

  // Find active game for a player
  @Query(
      "SELECT g FROM Game g WHERE "
          + "(g.player1Id = :playerId OR g.player2Id = :playerId) "
          + "AND g.gameState NOT IN (:finishedState, :cancelledState)")
  List<Game> findActiveGamesByPlayer(
      @Param("playerId") UUID playerId,
      @Param("finishedState") GameState finishedState,
      @Param("cancelledState") GameState cancelledState);

  // Find games by state
  List<Game> findByGameState(GameState gameState);

  // Find recent games for a player
  @Query(
      "SELECT g FROM Game g WHERE "
          + "g.player1Id = :playerId OR g.player2Id = :playerId "
          + "ORDER BY g.createdAt DESC")
  List<Game> findRecentGamesByPlayer(@Param("playerId") UUID playerId);

  // Find games between two specific players
  @Query(
      "SELECT g FROM Game g WHERE "
          + "((g.player1Id = :player1 AND g.player2Id = :player2) OR "
          + " (g.player1Id = :player2 AND g.player2Id = :player1)) "
          + "ORDER BY g.createdAt DESC")
  List<Game> findGamesBetweenPlayers(
      @Param("player1") UUID player1, @Param("player2") UUID player2);
}
