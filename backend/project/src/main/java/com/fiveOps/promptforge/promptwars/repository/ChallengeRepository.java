package com.fiveOps.promptforge.promptwars.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.promptwars.model.ChallengeStatus;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

  // Find challenges for a specific user (either as challenger or opponent)
  @Query(
      "SELECT c FROM Challenge c WHERE "
          + "(c.challengerId = :userId OR c.opponentId = :userId) "
          + "AND c.status = :status "
          + "ORDER BY c.createdAt DESC")
  List<Challenge> findByUserAndStatus(
      @Param("userId") UUID userId, @Param("status") ChallengeStatus status);

  // Find all challenges for a user
  @Query(
      "SELECT c FROM Challenge c WHERE "
          + "c.challengerId = :userId OR c.opponentId = :userId "
          + "ORDER BY c.createdAt DESC")
  List<Challenge> findByUser(@Param("userId") UUID userId);

  // Check if there's a pending challenge between two users
  @Query(
      "SELECT COUNT(c) > 0 FROM Challenge c WHERE "
          + "((c.challengerId = :user1 AND c.opponentId = :user2) OR "
          + " (c.challengerId = :user2 AND c.opponentId = :user1)) "
          + "AND c.status = 'PENDING' AND c.expiresAt > :now")
  boolean existsPendingChallengeBetweenUsers(
      @Param("user1") UUID user1, @Param("user2") UUID user2, @Param("now") Instant now);

  // Find expired challenges that need to be updated
  @Query("SELECT c FROM Challenge c WHERE " + "c.status = 'PENDING' AND c.expiresAt <= :now")
  List<Challenge> findExpiredChallenges(@Param("now") Instant now);

  // Find incoming challenges for a user
  @Query(
      "SELECT c FROM Challenge c WHERE "
          + "c.opponentId = :userId AND c.status = 'PENDING' "
          + "ORDER BY c.createdAt DESC")
  List<Challenge> findIncomingChallenges(@Param("userId") UUID userId);

  // Find outgoing challenges for a user
  @Query(
      "SELECT c FROM Challenge c WHERE "
          + "c.challengerId = :userId AND c.status = 'PENDING' "
          + "ORDER BY c.createdAt DESC")
  List<Challenge> findOutgoingChallenges(@Param("userId") UUID userId);
}
