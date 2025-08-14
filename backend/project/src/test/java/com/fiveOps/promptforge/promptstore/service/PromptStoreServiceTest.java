package com.fiveOps.promptforge.promptstore.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithAuthorDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.prompts.service.TagService;
import com.fiveOps.promptforge.promptstore.dto.PromptWithTagsDTO;
import com.fiveOps.promptforge.promptstore.exception.PurchaseException;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.repository.PromptPurchaseRepository;
import com.fiveOps.promptforge.promptstore.repository.PromptReviewRepository;
import com.fiveOps.promptforge.promptstore.repository.PromptStoreRepository;

@ExtendWith(MockitoExtension.class)
class PromptStoreServiceReviewTest {

  @Mock
  private PromptReviewRepository reviewRepository;

  @Mock
  private PromptStoreRepository promptStoreRepository;
  @Mock
  private PromptService promptService;
  @Mock
  private PromptPurchaseRepository purchaseRepository;
  @Mock
  private TagService tagService;

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
  void purchasePrompt_ShouldCreatePurchaseWhenValid() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    Prompt prompt = new Prompt();
    prompt.setPrice(10.0);

    when(promptService.getPromptById(promptId)).thenReturn(prompt);
    when(purchaseRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(false);
    when(purchaseRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

    // Act
    PromptPurchase result = promptStoreService.purchasePrompt(promptId, userId);

    // Assert
    assertNotNull(result);
    assertEquals(promptId, result.getPromptId());
    assertEquals(userId, result.getUserId());
    assertEquals(10.0, result.getPricePaid());
    assertEquals("public", result.getVisibility());
    verify(purchaseRepository).save(any());
  }

  @Test
  void purchasePrompt_ShouldThrowWhenAlreadyPurchased() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    when(promptService.getPromptById(promptId)).thenReturn(new Prompt());
    when(purchaseRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(true);

    // Act & Assert
    assertThrows(PurchaseException.class, () -> promptStoreService.purchasePrompt(promptId, userId));
    verify(purchaseRepository, never()).save(any());
  }

  @Test
  void purchasePrompt_ShouldThrowWhenPromptNotFound() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    when(promptService.getPromptById(promptId)).thenReturn(null);

    // Act & Assert
    assertThrows(PurchaseException.class, () -> promptStoreService.purchasePrompt(promptId, userId));
    verify(purchaseRepository, never()).save(any());
  }

  @Test
  void isOwned_ShouldReturnTrueWhenUserIsAuthor() {
    // Arrange
    UUID promptId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    when(promptStoreRepository.existsByIdAndAuthorId(promptId, userId)).thenReturn(true);

    // Act & Assert
    assertTrue(promptStoreService.isOwned(userId, promptId));
    verify(purchaseRepository, never()).existsByPromptIdAndUserId(any(), any()); // Verify second check was never called
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
    assertThrows(IllegalArgumentException.class, () -> promptStoreService.createReview(testReview));
    verify(reviewRepository).existsByPromptIdAndUserId(testPromptId, testUserId);
    verify(reviewRepository, never()).save(any());
  }

  @Test
  void updateReviewPartial_ShouldUpdateOnlyProvidedFields() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    PromptReview existingReview = new PromptReview();
    existingReview.setId(reviewId);
    existingReview.setPromptId(testPromptId);
    existingReview.setUserId(testUserId);
    existingReview.setRating(3.0);
    existingReview.setComment("Original comment");

    when(reviewRepository.findByIdAndUserIdAndPromptId(reviewId, testUserId, testPromptId))
        .thenReturn(Optional.of(existingReview));
    when(reviewRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    // Act - update only rating
    PromptReview result = promptStoreService.updateReviewPartial(reviewId, testUserId, testPromptId, 5.0, null);

    // Assert
    assertEquals(5.0, result.getRating());
    assertEquals("Original comment", result.getComment());

    // Act - update only comment
    result = promptStoreService.updateReviewPartial(
        reviewId, testUserId, testPromptId, null, "New comment");

    // Assert
    assertEquals(5.0, result.getRating()); // Rating remains unchanged
    assertEquals("New comment", result.getComment());
  }

  @Test
  void updateReviewPartial_ShouldThrowWhenReviewNotFound() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(reviewRepository.findByIdAndUserIdAndPromptId(reviewId, testUserId, testPromptId))
        .thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreService.updateReviewPartial(
            reviewId, testUserId, testPromptId, 5.0, "Comment"));
  }

  @Test
  void deleteReview_ShouldDeleteWhenExists() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(reviewRepository.existsByIdAndUserIdAndPromptId(reviewId, testUserId, testPromptId))
        .thenReturn(true);

    // Act
    promptStoreService.deleteReview(reviewId, testUserId, testPromptId);

    // Assert
    verify(reviewRepository).deleteById(reviewId);
  }

  @Test
  void deleteReview_ShouldThrowWhenNotExists() {
    // Arrange
    UUID reviewId = UUID.randomUUID();
    when(reviewRepository.existsByIdAndUserIdAndPromptId(reviewId, testUserId, testPromptId))
        .thenReturn(false);

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> promptStoreService.deleteReview(reviewId, testUserId, testPromptId));
    verify(reviewRepository, never()).deleteById(any());
  }

  @Test
  void getAllPublicPrompts_ShouldReturnPrompts() {
    List<Prompt> prompts = List.of(mock(Prompt.class));
    when(promptStoreRepository.findByVisibility("public")).thenReturn(prompts);
    assertEquals(prompts, promptStoreService.getAllPublicPrompts());
  }

  @Test
  void getAllPublicPrompts_ShouldReturnEmptyList() {
    when(promptStoreRepository.findByVisibility("public")).thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.getAllPublicPrompts().isEmpty());
  }

  @Test
  void getPublicPromptsWithAuthorAndTags_ShouldReturnPage() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(promptStoreRepository.getPublicPromptsWithAuthorAndTags(pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getPublicPromptsWithAuthorAndTags(pageable));
  }

  @Test
  void getPageCount_ShouldReturnCorrectValue() {
    when(promptStoreRepository.count()).thenReturn(10L);
    assertEquals(2, promptStoreService.getPageCount("5"));
  }

  @Test
  void getPageCount_ShouldHandleZero() {
    when(promptStoreRepository.count()).thenReturn(0L);
    assertEquals(0, promptStoreService.getPageCount("5"));
  }

  @Test
  void getPromptCount_ShouldReturnCount() {
    when(promptStoreRepository.count()).thenReturn(7L);
    assertEquals(7, promptStoreService.getPromptCount());
  }

  @Test
  void getFeaturedPrompts_ShouldReturnPage() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(promptStoreRepository.findByFeatured(pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getFeaturedPrompts(pageable));
  }

  @Test
  void searchPublicList_ShouldReturnPrompts() {
    List<Prompt> prompts = List.of(mock(Prompt.class));
    when(promptService.searchPublicByTitle("query")).thenReturn(prompts);
    assertEquals(prompts, promptStoreService.searchPublic("query"));
  }

  @Test
  void searchPublicList_ShouldReturnEmpty() {
    when(promptService.searchPublicByTitle("query")).thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.searchPublic("query").isEmpty());
  }

  @Test
  void searchPublicPage_ShouldReturnPage() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(promptStoreRepository.searchPublicByTitle("query", pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.searchPublic("query", pageable));
  }

  @Test
  void getPublicUnderPrice_ShouldReturnPrompts() {
    List<Prompt> prompts = List.of(mock(Prompt.class));
    when(promptStoreRepository.findPublicUnderPrice(10.0)).thenReturn(prompts);
    assertEquals(prompts, promptStoreService.getPublicUnderPrice(10.0));
  }

  @Test
  void getPublicByTagName_ShouldReturnFilteredPrompts() {
    Prompt publicPrompt = mock(Prompt.class);
    when(publicPrompt.getVisibility()).thenReturn("public");
    when(promptService.getPromptsByTagName("tag")).thenReturn(List.of(publicPrompt));
    assertEquals(List.of(publicPrompt), promptStoreService.getPublicByTagName("tag"));
  }

  @Test
  void getPublicByTagName_ShouldReturnEmptyIfNoPublic() {
    Prompt privatePrompt = mock(Prompt.class);
    when(privatePrompt.getVisibility()).thenReturn("private");
    when(promptService.getPromptsByTagName("tag")).thenReturn(List.of(privatePrompt));
    assertTrue(promptStoreService.getPublicByTagName("tag").isEmpty());
  }

  @Test
  void getPublicByTagNamePageable_ShouldReturnPage() {
    Pageable pageable = mock(Pageable.class);
    UUID tagId = UUID.randomUUID();
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptStoreRepository.findPublicByTagId(tagId, pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getPublicByTagName("tag", pageable));
  }

  @Test
  void getPublicByTagNameAndFilter_ShouldReturnFeatured() {
    Pageable pageable = mock(Pageable.class);
    UUID tagId = UUID.randomUUID();
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptStoreRepository.findPublicByTagIdAndFeatured(tagId, pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getPublicByTagNameAndFilter("tag", "featured", pageable));
  }

  @Test
  void getPublicByTagNameAndFilter_ShouldReturnNew() {
    Pageable pageable = mock(Pageable.class);
    UUID tagId = UUID.randomUUID();
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptStoreRepository.findByTagAndNew(tagId, pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getPublicByTagNameAndFilter("tag", "new", pageable));
  }

  @Test
  void getNew_ShouldReturnPage() {
    Pageable pageable = mock(Pageable.class);
    Page<Map<String, PromptWithAuthorDTO>> page = mock(Page.class);
    when(promptStoreRepository.findNew(pageable)).thenReturn(page);
    assertEquals(page, promptStoreService.getNew(pageable));
  }

  @Test
  void isPromptBought_ShouldReturnTrueOrFalse() {
    UUID promptId = UUID.randomUUID();
    when(purchaseRepository.existsByPromptIdAndUserId(promptId, testUserId)).thenReturn(true);
    assertTrue(promptStoreService.isPromptBought(testUserId, promptId));
    when(purchaseRepository.existsByPromptIdAndUserId(promptId, testUserId)).thenReturn(false);
    assertFalse(promptStoreService.isPromptBought(testUserId, promptId));
  }

  // @Test
  // void getPublicPromptsByAuthor_ShouldReturnPublicOnly() {
  // Prompt publicPrompt = mock(Prompt.class);
  // when(publicPrompt.getVisibility()).thenReturn("public");
  // when(promptService.getPromptsByAuthor(testUserId)).thenReturn(List.of(publicPrompt));
  // assertEquals(List.of(publicPrompt),
  // promptStoreService.getPublicPromptsByAuthor(testUserId));
  // }

  // @Test
  // void getPublicPromptsByAuthor_ShouldReturnEmptyIfNoPublic() {
  // Prompt privatePrompt = mock(Prompt.class);
  // when(privatePrompt.getVisibility()).thenReturn("private");
  // when(promptService.getPromptsByAuthor(testUserId)).thenReturn(List.of(privatePrompt));
  // assertTrue(promptStoreService.getPublicPromptsByAuthor(testUserId).isEmpty());
  // }

  @Test
  void deleteListing_ShouldReturnTrueIfUnpublished() {
    UUID promptId = UUID.randomUUID();
    Prompt prompt = mock(Prompt.class);
    when(promptService.unpublishPrompt(promptId)).thenReturn(prompt);
    assertTrue(promptStoreService.deleteListing(promptId));
  }

  @Test
  void deleteListing_ShouldReturnFalseIfNotUnpublished() {
    UUID promptId = UUID.randomUUID();
    when(promptService.unpublishPrompt(promptId)).thenReturn(null);
    assertFalse(promptStoreService.deleteListing(promptId));
  }

  @Test
  void getRecentlyPublishedPrompts_ShouldReturnList() {
    List<Prompt> prompts = List.of(mock(Prompt.class));
    when(promptStoreRepository.findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(
        "public"))
        .thenReturn(prompts);
    assertFalse(promptStoreService.getRecentlyPublishedPrompts().isEmpty());
  }

  @Test
  void getRecentlyPublishedPrompts_ShouldReturnEmptyList() {
    when(promptStoreRepository.findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc(
        "public"))
        .thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.getRecentlyPublishedPrompts().isEmpty());
  }

  @Test
  void getAllTags_ShouldReturnTags() {
    List<Tag> tags = List.of(mock(Tag.class));
    when(tagService.getAllTags()).thenReturn(tags);
    assertEquals(tags, promptStoreService.getAllTags());
  }

  @Test
  void getAllTags_ShouldReturnEmptyList() {
    when(tagService.getAllTags()).thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.getAllTags().isEmpty());
  }

  @Test
  void getPopularTags_ShouldReturnTags() {
    List<Tag> tags = List.of(mock(Tag.class));
    when(tagService.getPopularTags(5)).thenReturn(tags);
    assertEquals(tags, promptStoreService.getPopularTags(5));
  }

  @Test
  void getPopularTags_ShouldReturnEmptyList() {
    when(tagService.getPopularTags(5)).thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.getPopularTags(5).isEmpty());
  }

  @Test
  void getPromptsWithTags_ShouldReturnList() {
    Prompt prompt = mock(Prompt.class);
    when(promptStoreRepository.findByVisibility("public")).thenReturn(List.of(prompt));
    List<Tag> tags = List.of(mock(Tag.class));
    when(prompt.getTagIds()).thenReturn(List.of(UUID.randomUUID()));
    when(tagService.getTagsByIds(any())).thenReturn(tags);
    List<PromptWithTagsDTO> result = promptStoreService.getPromptsWithTags();
    assertEquals(1, result.size());
    assertEquals(tags, result.get(0).getTags());
  }

  @Test
  void getPromptsWithTags_ShouldReturnEmptyList() {
    when(promptStoreRepository.findByVisibility("public")).thenReturn(Collections.emptyList());
    assertTrue(promptStoreService.getPromptsWithTags().isEmpty());
  }
}
