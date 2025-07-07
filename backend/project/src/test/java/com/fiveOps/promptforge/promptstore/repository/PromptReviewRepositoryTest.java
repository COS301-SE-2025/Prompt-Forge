package com.fiveOps.promptforge.promptstore.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;

@ExtendWith(MockitoExtension.class)
class PromptReviewRepositoryTest {

  @Mock private PromptReviewRepository reviewRepository;

  @Test
  void findByPromptId_ShouldReturnPageOfReviews() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    Pageable pageable = mock(Pageable.class);
    when(reviewRepository.findByPromptId(promptId, pageable)).thenReturn(mock(Page.class));

    // Act
    Page<PromptReview> result = reviewRepository.findByPromptId(promptId, pageable);

    // Assert
    assertNotNull(result);
    verify(reviewRepository).findByPromptId(promptId, pageable);
  }

  @Test
  void findReviewsWithUsernameByPromptId_ShouldReturnProjections() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    Pageable pageable = mock(Pageable.class);
    when(reviewRepository.findReviewsWithUsernameByPromptId(promptId, pageable))
        .thenReturn(mock(Page.class));

    // Act
    Page<ReviewProjection> result =
        reviewRepository.findReviewsWithUsernameByPromptId(promptId, pageable);

    // Assert
    assertNotNull(result);
    verify(reviewRepository).findReviewsWithUsernameByPromptId(promptId, pageable);
  }

  @Test
  void calculateAverageRating_ShouldReturnAverage() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    when(reviewRepository.calculateAverageRating(promptId)).thenReturn(4.5);

    // Act
    Double result = reviewRepository.calculateAverageRating(promptId);

    // Assert
    assertEquals(4.5, result);
    verify(reviewRepository).calculateAverageRating(promptId);
  }

  @Test
  void existsByPromptIdAndUserId_ShouldReturnBoolean() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    when(reviewRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(true);

    // Act
    boolean result = reviewRepository.existsByPromptIdAndUserId(promptId, userId);

    // Assert
    assertTrue(result);
    verify(reviewRepository).existsByPromptIdAndUserId(promptId, userId);
  }
}
