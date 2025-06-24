package com.fiveOps.promptforge.promptstore.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.UUID;

import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.repository.PromptReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class PromptStoreServiceReviewTest {

    @Mock
    private PromptReviewRepository reviewRepository;

    @InjectMocks
    private PromptStoreService promptStoreService;

    private UUID testPromptId;
    private UUID testUserId;
    private PromptReview testReview;

    @BeforeEach
    void setUp() {
        testPromptId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testReview = new PromptReview();
        testReview.setPromptId(testPromptId);
        testReview.setUserId(testUserId);
        testReview.setRating(4.5);
        testReview.setComment("Great prompt!");
    }

    @Test
    void getReviewsForPrompt_ShouldReturnPageOfReviews() {
        // Arrange
        Pageable pageable = mock(Pageable.class);
        when(reviewRepository.findReviewsWithUsernameByPromptId(testPromptId, pageable)).thenReturn(mock(Page.class));

        // Act
        Page<ReviewProjection> result = promptStoreService.getReviewsForPrompt(testPromptId, pageable);

        // Assert
        assertNotNull(result);
        verify(reviewRepository).findReviewsWithUsernameByPromptId(testPromptId, pageable);
    }

    @Test
    void createReview_ShouldSaveReview_WhenNotExists() {
        // Arrange
        when(reviewRepository.existsByPromptIdAndUserId(testPromptId, testUserId)).thenReturn(false);
        when(reviewRepository.save(testReview)).thenReturn(testReview);

        // Act
        PromptReview result = promptStoreService.createReview(testReview);

        // Assert
        assertNotNull(result);
        assertEquals(testReview, result);
        verify(reviewRepository).existsByPromptIdAndUserId(testPromptId, testUserId);
        verify(reviewRepository).save(testReview);
    }

    @Test
    void createReview_ShouldThrowException_WhenAlreadyExists() {
        // Arrange
        when(reviewRepository.existsByPromptIdAndUserId(testPromptId, testUserId)).thenReturn(true);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            promptStoreService.createReview(testReview));
        verify(reviewRepository).existsByPromptIdAndUserId(testPromptId, testUserId);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void getAverageRating_ShouldReturnRating() {
        // Arrange
        when(reviewRepository.calculateAverageRating(testPromptId)).thenReturn(4.2);

        // Act
        Double result = promptStoreService.getAverageRating(testPromptId);

        // Assert
        assertEquals(4.2, result);
        verify(reviewRepository).calculateAverageRating(testPromptId);
    }
}