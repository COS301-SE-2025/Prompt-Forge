package com.fiveOps.promptforge.promptstore.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "reviews",
    indexes = {
      @Index(name = "idx_review_prompt", columnList = "prompt_id"),
      @Index(name = "idx_review_user", columnList = "user_id"),
      @Index(name = "idx_review_rating", columnList = "rating")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptReview {
  @Id
  @Column(name = "review_id", columnDefinition = "UUID")
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(name = "prompt_id", nullable = false)
  private UUID promptId;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "rating", nullable = false)
  @DecimalMin(value = "0.5", message = "Rating must be at least 0.5")
  @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
  private Double rating;

  @Column(columnDefinition = "TEXT")
  private String comment;
}
