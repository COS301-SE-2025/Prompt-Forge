package com.fiveOps.promptforge.badges.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.badges.model.UserBadge;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {

  List<UserBadge> findByUserId(UUID userId);

  List<UserBadge> findByUserIdAndIsVisibleTrue(UUID userId);

  Optional<UserBadge> findByUserIdAndBadgeId(UUID userId, UUID badgeId);

  @Query(
      "SELECT ub FROM UserBadge ub WHERE ub.userId = :userId "
          + "AND ub.progress >= 100 AND ub.isVisible = true")
  List<UserBadge> findEarnedVisibleBadgesByUserId(@Param("userId") UUID userId);

  @Query("SELECT ub FROM UserBadge ub WHERE ub.userId = :userId AND ub.progress < 100")
  List<UserBadge> findInProgressBadgesByUserId(@Param("userId") UUID userId);

  @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.userId = :userId AND ub.progress >= 100")
  Long countEarnedBadgesByUserId(@Param("userId") UUID userId);
}
