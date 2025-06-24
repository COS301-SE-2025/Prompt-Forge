
package com.fiveOps.promptforge.promptstore.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.security.Principal;
import java.util.UUID;

import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class PromptStoreControllerReviewTest {

    @Mock
    private PromptStoreService storeService;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PromptStoreController promptStoreController;

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
        when(storeService.getReviewsForPrompt(testPromptId, pageable)).thenReturn(mock(Page.class));

        // Act
        ResponseEntity<Page<ReviewProjection>> response = 
            promptStoreController.getReviewsForPrompt(testPromptId, pageable);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        verify(storeService).getReviewsForPrompt(testPromptId, pageable);
    }

    @Test
    void createReview_ShouldCreateAndReturnReview() {
        // Arrange
        when(authentication.getName()).thenReturn("test@example.com");
        when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
        when(storeService.createReview(any(PromptReview.class))).thenReturn(testReview);

        // Act
        ResponseEntity<PromptReview> response = 
            promptStoreController.createReview(testPromptId, testReview, authentication);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(testPromptId, response.getBody().getPromptId());
        assertEquals(testUserId, response.getBody().getUserId());
        verify(storeService).createReview(any(PromptReview.class));
    }

    @Test
    void createReview_ShouldSetUserIdAndPromptId() {
        // Arrange
        when(authentication.getName()).thenReturn("test@example.com");
        when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
        
        PromptReview reviewWithoutIds = new PromptReview();
        reviewWithoutIds.setRating(4.0);
        reviewWithoutIds.setComment("Good");

        when(storeService.createReview(any(PromptReview.class))).thenAnswer(invocation -> {
            PromptReview r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        // Act
        ResponseEntity<PromptReview> response = 
            promptStoreController.createReview(testPromptId, reviewWithoutIds, authentication);

        // Assert
        assertEquals(testPromptId, response.getBody().getPromptId());
        assertEquals(testUserId, response.getBody().getUserId());
    }
}
