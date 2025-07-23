package com.fiveOps.promptforge.promptstore.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;

@Repository
public interface PromptReviewRepository extends JpaRepository<PromptReview, UUID> {
  Page<PromptReview> findByPromptId(UUID promptId, Pageable pageable);

  @Query(
      value =
          "SELECT r.user_id, r.prompt_id as promptId, r.user_id as userId, "
              + "u.username, r.rating, r.comment, r.review_id as id "
              + "FROM reviews r "
              + "JOIN users u ON r.user_id = u.user_id "
              + "WHERE r.prompt_id = :promptId",
      countQuery = "SELECT count(*) FROM reviews r WHERE r.prompt_id = :promptId",
      nativeQuery = true)
  Page<ReviewProjection> findReviewsWithUsernameByPromptId(
      @Param("promptId") UUID promptId, Pageable pageable);

  @Query("SELECT AVG(r.rating) FROM PromptReview r WHERE r.promptId = :promptId")
  Double calculateAverageRating(UUID promptId);

  boolean existsByPromptIdAndUserId(UUID promptId, UUID userId);

  @Modifying
  @Query(
      "UPDATE PromptReview r SET r.rating = :rating, r.comment = :comment "
          + "WHERE r.id = :reviewId AND r.userId = :userId AND r.promptId = :promptId")
  int updateReview(
      @Param("reviewId") UUID reviewId,
      @Param("userId") UUID userId,
      @Param("promptId") UUID promptId,
      @Param("rating") Double rating,
      @Param("comment") String comment);

  @Modifying
  @Query(
      "DELETE FROM PromptReview r "
          + "WHERE r.id = :reviewId AND r.userId = :userId AND r.promptId = :promptId")
  int deleteByReviewIdAndUserIdAndPromptId(
      @Param("reviewId") UUID reviewId,
      @Param("userId") UUID userId,
      @Param("promptId") UUID promptId);

  Optional<PromptReview> findByIdAndUserIdAndPromptId(UUID reviewId, UUID userId, UUID promptId);

  boolean existsByIdAndUserIdAndPromptId(UUID reviewId, UUID userId, UUID promptId);
}
