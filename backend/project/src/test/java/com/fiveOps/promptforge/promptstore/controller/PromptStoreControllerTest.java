package com.fiveOps.promptforge.promptstore.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.promptstore.dto.ReviewProjection;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.service.UserService;

@ExtendWith(MockitoExtension.class)
class PromptStoreControllerReviewTest {

  @Mock private PromptStoreService storeService;

  @Mock private UserService userService;

  @Mock private Authentication authentication;

  @InjectMocks private PromptStoreController promptStoreController;

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

    when(storeService.createReview(any(PromptReview.class)))
        .thenAnswer(
            invocation -> {
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

  @Test
  void updateReview_ShouldUpdateAndReturnReview() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);

    PromptReview request = new PromptReview();
    request.setRating(4.0);
    request.setComment("Updated comment");

    PromptReview updatedReview = new PromptReview();
    updatedReview.setId(reviewId);
    updatedReview.setPromptId(testPromptId);
    updatedReview.setUserId(testUserId);
    updatedReview.setRating(4.0);
    updatedReview.setComment("Updated comment");

    when(storeService.updateReviewPartial(
            reviewId, testUserId, testPromptId, 4.0, "Updated comment"))
        .thenReturn(updatedReview);

    // Act
    ResponseEntity<PromptReview> response =
        promptStoreController.updateReviewPartial(testPromptId, reviewId, request, authentication);

    // Assert
    assertEquals(200, response.getStatusCodeValue());
    assertEquals(4.0, response.getBody().getRating());
    assertEquals("Updated comment", response.getBody().getComment());
  }

  @Test
  void updateReview_ShouldThrowWhenUnauthorized() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);

    PromptReview request = new PromptReview();
    request.setRating(4.0);

    when(storeService.updateReviewPartial(reviewId, testUserId, testPromptId, 4.0, null))
        .thenThrow(new IllegalArgumentException("Review not found or unauthorized"));

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () ->
            promptStoreController.updateReviewPartial(
                testPromptId, reviewId, request, authentication));
  }

  @Test
  void deleteReview_ShouldReturnNoContent() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);

    // Act
    ResponseEntity<Void> response =
        promptStoreController.deleteReview(testPromptId, reviewId, authentication);

    // Assert
    assertEquals(204, response.getStatusCodeValue());
    verify(storeService).deleteReview(reviewId, testUserId, testPromptId);
  }

  @Test
  void deleteReview_ShouldThrowWhenUnauthorized() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);

    doThrow(new IllegalArgumentException("Review not found or unauthorized"))
        .when(storeService)
        .deleteReview(reviewId, testUserId, testPromptId);

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreController.deleteReview(testPromptId, reviewId, authentication));
  }

  @Test
  void getAllPublicPrompts_ShouldReturnPageOfPrompts() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(storeService.getPublicPromptsWithAuthorAndTags(pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.getAllPublicPrompts(pageable));
    verify(storeService).getPublicPromptsWithAuthorAndTags(pageable);
  }

  @Test
  void getFeaturedPrompts_ShouldReturnFeaturedPrompts() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(storeService.getFeaturedPrompts(pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.getFeaturedPrompts(pageable));
    verify(storeService).getFeaturedPrompts(pageable);
  }

  @Test
  void searchPublic_ShouldReturnSearchResults() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    String query = "test";
    when(storeService.searchPublic(query, pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.searchPublic(query, pageable));
    verify(storeService).searchPublic(query, pageable);
  }

  @Test
  void getUnderPrice_ShouldReturnPromptsUnderPrice() {
    double maxPrice = 10.0;
    List<Prompt> prompts = mock(List.class);
    when(storeService.getPublicUnderPrice(maxPrice)).thenReturn(prompts);
    assertEquals(prompts, promptStoreController.getUnderPrice(maxPrice));
    verify(storeService).getPublicUnderPrice(maxPrice);
  }

  @Test
  void filterByTagName_ShouldReturnFilteredPrompts() {
    Pageable pageable = mock(Pageable.class);
    String tagName = "test";
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(storeService.getPublicByTagName("test", pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.filterByTagName(tagName, pageable));
    verify(storeService).getPublicByTagName("test", pageable);
  }

  @Test
  void filterByTagNameAndFilter_ShouldReturnFilteredPrompts() {
    Pageable pageable = mock(Pageable.class);
    String tagName = "Test";
    String filter = "popular";
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(storeService.getPublicByTagNameAndFilter("Test", filter, pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.filterByTagNameAndFilter(tagName, filter, pageable));
    verify(storeService).getPublicByTagNameAndFilter("Test", filter, pageable);
  }

  @Test
  void getNew_ShouldReturnNewPrompts() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(storeService.getNew(pageable)).thenReturn(page);
    assertEquals(page, promptStoreController.getNew(pageable));
    verify(storeService).getNew(pageable);
  }

  @Test
  void getPublicPromptsByAuthor_ShouldReturnPrompts() {
    UUID authorId = UUID.randomUUID();
    List<Prompt> prompts = mock(List.class);
    when(storeService.getPublicPromptsByAuthor(authorId)).thenReturn(prompts);
    assertEquals(prompts, promptStoreController.getPublicPromptsByAuthor(authorId));
    verify(storeService).getPublicPromptsByAuthor(authorId);
  }

  @Test
  void deleteListing_ShouldReturnNoContentIfDeleted() {
    UUID promptId = UUID.randomUUID();
    when(storeService.deleteListing(promptId)).thenReturn(true);
    ResponseEntity<Void> response = promptStoreController.deleteListing(promptId, authentication);
    assertEquals(204, response.getStatusCodeValue());
    verify(storeService).deleteListing(promptId);
  }

  @Test
  void deleteListing_ShouldReturnNotFoundIfNotDeleted() {
    UUID promptId = UUID.randomUUID();
    when(storeService.deleteListing(promptId)).thenReturn(false);
    ResponseEntity<Void> response = promptStoreController.deleteListing(promptId, authentication);
    assertEquals(404, response.getStatusCodeValue());
    verify(storeService).deleteListing(promptId);
  }

  @Test
  void isPromptBought_ShouldReturnTrueOrFalse() {
    UUID promptId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
    when(storeService.isPromptBought(testUserId, promptId)).thenReturn(true);
    ResponseEntity<Boolean> response =
        promptStoreController.isPromptBought(promptId, authentication);
    assertEquals(200, response.getStatusCodeValue());
    assertTrue(response.getBody());
    verify(storeService).isPromptBought(testUserId, promptId);
  }

  @Test
  void getAllTags_ShouldReturnTags() {
    List<Tag> tags = mock(List.class);
    when(storeService.getAllTags()).thenReturn(tags);
    assertEquals(tags, promptStoreController.getAllTags());
    verify(storeService).getAllTags();
  }

  @Test
  void getPopularTags_ShouldReturnPopularTags() {
    int limit = 5;
    List<Tag> tags = mock(List.class);
    when(storeService.getPopularTags(limit)).thenReturn(tags);
    assertEquals(tags, promptStoreController.getPopularTags(limit));
    verify(storeService).getPopularTags(limit);
  }

  @Test
  void getAllPublicPrompts_ShouldHandleNullAndEmpty() {
    Pageable pageable = mock(Pageable.class);
    when(storeService.getPublicPromptsWithAuthorAndTags(pageable)).thenReturn(null);
    assertNull(promptStoreController.getAllPublicPrompts(pageable));
  }

  @Test
  void getFeaturedPrompts_ShouldHandleNullAndEmpty() {
    Pageable pageable = mock(Pageable.class);
    when(storeService.getFeaturedPrompts(pageable)).thenReturn(null);
    assertNull(promptStoreController.getFeaturedPrompts(pageable));
  }

  @Test
  void searchPublic_ShouldHandleNullAndEmpty() {
    Pageable pageable = mock(Pageable.class);
    String query = "test";
    when(storeService.searchPublic(query, pageable)).thenReturn(null);
    assertNull(promptStoreController.searchPublic(query, pageable));
  }

  @Test
  void getUnderPrice_ShouldHandleEmptyList() {
    double maxPrice = 10.0;
    when(storeService.getPublicUnderPrice(maxPrice)).thenReturn(List.of());
    assertTrue(promptStoreController.getUnderPrice(maxPrice).isEmpty());
  }

  @Test
  void filterByTagName_ShouldHandleNullPage() {
    Pageable pageable = mock(Pageable.class);
    String tagName = "Test";
    when(storeService.getPublicByTagName("Test", pageable)).thenReturn(null);
    assertNull(promptStoreController.filterByTagName(tagName, pageable));
  }

  @Test
  void filterByTagNameAndFilter_ShouldHandleNullPage() {
    Pageable pageable = mock(Pageable.class);
    String tagName = "Test";
    String filter = "popular";
    when(storeService.getPublicByTagNameAndFilter("Test", filter, pageable)).thenReturn(null);
    assertNull(promptStoreController.filterByTagNameAndFilter(tagName, filter, pageable));
  }

  @Test
  void getNew_ShouldHandleNullPage() {
    Pageable pageable = mock(Pageable.class);
    when(storeService.getNew(pageable)).thenReturn(null);
    assertNull(promptStoreController.getNew(pageable));
  }

  @Test
  void getPublicPromptsByAuthor_ShouldHandleEmptyList() {
    UUID authorId = UUID.randomUUID();
    when(storeService.getPublicPromptsByAuthor(authorId)).thenReturn(List.of());
    assertTrue(promptStoreController.getPublicPromptsByAuthor(authorId).isEmpty());
  }

  @Test
  void deleteListing_ShouldHandleException() {
    UUID promptId = UUID.randomUUID();
    when(storeService.deleteListing(promptId))
        .thenThrow(new IllegalArgumentException("Invalid ID"));
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreController.deleteListing(promptId, authentication));
  }

  @Test
  void isPromptBought_ShouldHandleException() {
    UUID promptId = UUID.randomUUID();
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
    when(storeService.isPromptBought(testUserId, promptId))
        .thenThrow(new IllegalArgumentException("Invalid"));
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreController.isPromptBought(promptId, authentication));
  }

  @Test
  void getAllTags_ShouldHandleEmptyList() {
    when(storeService.getAllTags()).thenReturn(List.of());
    assertTrue(promptStoreController.getAllTags().isEmpty());
  }

  @Test
  void getPopularTags_ShouldHandleEmptyList() {
    int limit = 5;
    when(storeService.getPopularTags(limit)).thenReturn(List.of());
    assertTrue(promptStoreController.getPopularTags(limit).isEmpty());
  }

  @Test
  void createReview_ShouldThrowIfDuplicate() {
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
    when(storeService.createReview(any(PromptReview.class)))
        .thenThrow(new IllegalArgumentException("User already reviewed this prompt"));
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreController.createReview(testPromptId, testReview, authentication));
  }

  @Test
  void createReview_ShouldThrowOnGenericException() {
    when(authentication.getName()).thenReturn("test@example.com");
    when(userService.getUserIdByEmail("test@example.com")).thenReturn(testUserId);
    when(storeService.createReview(any(PromptReview.class)))
        .thenThrow(new RuntimeException("Unexpected error"));
    assertThrows(
        RuntimeException.class,
        () -> promptStoreController.createReview(testPromptId, testReview, authentication));
  }

  @Test
  void getReviewsForPrompt_ShouldHandleNullPage() {
    Pageable pageable = mock(Pageable.class);
    when(storeService.getReviewsForPrompt(testPromptId, pageable)).thenReturn(null);
    ResponseEntity<Page<ReviewProjection>> response =
        promptStoreController.getReviewsForPrompt(testPromptId, pageable);
    assertNull(response.getBody());
    assertEquals(200, response.getStatusCodeValue());
  }
}
