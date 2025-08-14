package com.fiveOps.promptforge.prompts.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashMap;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithSourceDTO;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@ExtendWith(MockitoExtension.class)
class PromptServiceTest {

  @Mock
  private PromptRepository promptRepository;

  @Mock
  private TagService tagService;

  @Mock
  private UniversalTaggingService universalTaggingService;

  @InjectMocks
  private PromptService promptService;

  private Prompt testPrompt;
  private UUID testId;
  private UUID authorId;

  @BeforeEach
  void setUp() {
    testId = UUID.randomUUID();
    authorId = UUID.randomUUID();
    testPrompt = new Prompt();
    testPrompt.setId(testId);
    testPrompt.setAuthorId(authorId);
    testPrompt.setTitle("Test Prompt");
    testPrompt.setContent("Test Content");
    testPrompt.setPrice(0.0);
    testPrompt.setVisibility("private");
  }

  @Test
  void getAllPrompts_ShouldReturnAllPrompts() {
    // Arrange
    List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
    when(promptRepository.findAll()).thenReturn(expectedPrompts);

    // Act
    List<Prompt> result = promptService.getAllPrompts();

    // Assert
    assertEquals(expectedPrompts, result);
    verify(promptRepository).findAll();
  }

  @Test
  void getPromptById_ShouldReturnPromptWhenExists() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));

    // Act
    Prompt result = promptService.getPromptById(testId);

    // Assert
    assertEquals(testPrompt, result);
    verify(promptRepository).findById(testId);
  }

  @Test
  void getPromptById_ShouldReturnNullWhenNotExists() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.empty());

    // Act
    Prompt result = promptService.getPromptById(testId);

    // Assert
    assertNull(result);
    verify(promptRepository).findById(testId);
  }

  @Test
  void createPrompt_ShouldSetDefaultValuesAndSave() {
    // Arrange
    Prompt newPrompt = new Prompt();
    newPrompt.setTitle("New Prompt");
    newPrompt.setContent("New Content");

    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(
            invocation -> {
              Prompt p = invocation.getArgument(0);
              p.setId(testId);
              return p;
            });

    // Act
    Prompt result = promptService.createPrompt(newPrompt);

    // Assert
    assertNotNull(result.getId());
    assertEquals("private", result.getVisibility());
    assertEquals(0.0, result.getPrice());
    verify(promptRepository).save(newPrompt);
  }

  @Test
  void createPrompt_ShouldHandleTags() {
    // Arrange
    Prompt newPrompt = new Prompt();
    newPrompt.setTitle("New Prompt");
    newPrompt.setContent("New Content");

    Tag tag1 = new Tag();
    tag1.setId(UUID.randomUUID());
    Tag tag2 = new Tag();
    tag2.setId(UUID.randomUUID());

    // Mock AI tagging service to return categories
    Map<String, Object> aiTags = new HashMap<>();
    aiTags.put("categories", Arrays.asList("tag1", "tag2"));
    when(universalTaggingService.predictTags("New Content")).thenReturn(aiTags);

    when(tagService.findOrCreateTag("tag1")).thenReturn(tag1);
    when(tagService.findOrCreateTag("tag2")).thenReturn(tag2);
    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Prompt result = promptService.createPrompt(newPrompt);

    // Assert
    assertNotNull(result.getTagIds());
    assertEquals(2, result.getTagIds().size());
    verify(universalTaggingService).predictTags("New Content");
    verify(tagService).findOrCreateTag("tag1");
    verify(tagService).findOrCreateTag("tag2");
  }

  @Test
  void updatePrompt_ShouldUpdateExistingPrompt() {
    // Arrange
    Prompt updatedDetails = new Prompt();
    updatedDetails.setTitle("Updated Title");
    updatedDetails.setContent("Updated Content");
    updatedDetails.setPrice(10.0);

    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));
    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Prompt result = promptService.updatePrompt(testId, updatedDetails);

    // Assert
    assertEquals("Updated Title", result.getTitle());
    assertEquals("Updated Content", result.getContent());
    assertEquals(10.0, result.getPrice());
    verify(promptRepository).findById(testId);
    verify(promptRepository).save(testPrompt);
  }

  @Test
  void updatePrompt_ShouldReturnNullWhenPromptNotFound() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.empty());

    // Act
    Prompt result = promptService.updatePrompt(testId, new Prompt());

    // Assert
    assertNull(result);
    verify(promptRepository).findById(testId);
    verify(promptRepository, never()).save(any());
  }

  @Test
  void publishPrompt_ShouldSetVisibilityToPublic() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));
    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Prompt result = promptService.publishPrompt(testId);

    // Assert
    assertEquals("public", result.getVisibility());
    assertNotNull(result.getPublishedAt());
    verify(promptRepository).findById(testId);
    verify(promptRepository).save(testPrompt);
  }

  @Test
  void unpublishPrompt_ShouldSetVisibilityToPrivate() {
    // Arrange
    testPrompt.setVisibility("public");
    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));
    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Prompt result = promptService.unpublishPrompt(testId);

    // Assert
    assertEquals("private", result.getVisibility());
    verify(promptRepository).findById(testId);
    verify(promptRepository).save(testPrompt);
  }

  @Test
  void deletePrompt_ShouldReturnTrueWhenPromptExists() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));

    // Act
    boolean result = promptService.deletePrompt(testId);

    // Assert
    assertTrue(result);
    verify(promptRepository).findById(testId);
    verify(promptRepository).delete(testPrompt);
  }

  @Test
  void deletePrompt_ShouldReturnFalseWhenPromptNotExists() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.empty());

    // Act
    boolean result = promptService.deletePrompt(testId);

    // Assert
    assertFalse(result);
    verify(promptRepository).findById(testId);
    verify(promptRepository, never()).delete(any());
  }

  @Test
  void getPromptsByTagName_ShouldReturnPromptsWithTag() {
    // Arrange
    UUID tagId = UUID.randomUUID();
    when(tagService.getTagIdByName("Test")).thenReturn(tagId);
    when(promptRepository.findByTagId(tagId)).thenReturn(Arrays.asList(testPrompt));

    // Act
    List<Prompt> result = promptService.getPromptsByTagName("Test");

    // Assert
    assertEquals(1, result.size());
    assertEquals(testPrompt, result.get(0));
    verify(tagService).getTagIdByName("Test");
    verify(promptRepository).findByTagId(tagId);
  }

  @Test
  void searchByTitle_ShouldReturnMatchingPrompts() {
    // Arrange
    String searchTerm = "Test";
    when(promptRepository.findByTitleContainingIgnoreCase(searchTerm))
        .thenReturn(Arrays.asList(testPrompt));

    // Act
    List<Prompt> result = promptService.searchByTitle(searchTerm);

    // Assert
    assertEquals(1, result.size());
    assertEquals(testPrompt, result.get(0));
    verify(promptRepository).findByTitleContainingIgnoreCase(searchTerm);
  }

  @Test
  void searchPublicByTitle_ShouldReturnPublicMatchingPrompts() {
    // Arrange
    String searchTerm = "Test";
    when(promptRepository.searchPublicByTitle(searchTerm)).thenReturn(Arrays.asList(testPrompt));

    // Act
    List<Prompt> result = promptService.searchPublicByTitle(searchTerm);

    // Assert
    assertEquals(1, result.size());
    assertEquals(testPrompt, result.get(0));
    verify(promptRepository).searchPublicByTitle(searchTerm);
  }

  @Test
  void generateTagsForPrompt_ShouldThrowWhenPromptNotFound() {
    // Arrange
    when(promptRepository.findById(testId)).thenReturn(Optional.empty());

    // Act & Assert
    RuntimeException ex = assertThrows(RuntimeException.class, () -> promptService.generateTagsForPrompt(testId));
    assertEquals("Prompt not found", ex.getMessage());
  }

  @Test
  void generateTagsForPrompt_ShouldReturnPredictedTags() {
    // Arrange
    Map<String, Object> expectedTags = Map.of("tag1", 1);
    when(promptRepository.findById(testId)).thenReturn(Optional.of(testPrompt));
    when(universalTaggingService.predictTags("Test Content")).thenReturn(expectedTags);

    // Act
    Map<String, Object> result = promptService.generateTagsForPrompt(testId);

    // Assert
    assertEquals(expectedTags, result);
    verify(universalTaggingService).predictTags("Test Content");
  }

  @Test
  void getPromptsByAuthor_ShouldReturnPagedResults() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 10);

    when(promptRepository.countAuthoredPrompts(authorId)).thenReturn(5L);

    // Act
    Page<PromptWithSourceDTO> page = promptService.getPromptsByAuthor(authorId, pageable);

    // Assert
    assertEquals(5, page.getTotalElements());
    assertTrue(page.getContent().isEmpty());
  }

  @Test
  void getPurchasedPromptsByOptionalTag_ShouldHandleNullTagName() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 10);
    UUID userId = UUID.randomUUID();
    List<PromptWithSourceDTO> prompts = List.of(mock(PromptWithSourceDTO.class));

    when(promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(userId, null, 10, 0))
        .thenReturn(prompts);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, null)).thenReturn(1L);

    // Act
    Page<PromptWithSourceDTO> result = promptService.getPurchasedPromptsByOptionalTag(userId, null, pageable);

    // Assert
    assertEquals(1, result.getTotalElements());
    assertEquals(prompts, result.getContent());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldReturnOnlyAuthoredWhenPurchasedExhausted() {
    // Arrange
    Pageable pageable = PageRequest.of(2, 2); // offset beyond purchased
    UUID userId = UUID.randomUUID();
    UUID tagId = UUID.randomUUID();

    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, tagId)).thenReturn(2L);
    when(promptRepository.countByAuthoredAndTags(userId, tagId)).thenReturn(3L);

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, "tag",
        pageable);

    // Assert
    assertEquals(5, result.getTotalElements());
    assertEquals(0, result.getContent().size());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldReturnPurchasedAndAuthoredWhenMixed() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 3);
    UUID userId = UUID.randomUUID();
    UUID tagId = UUID.randomUUID();

    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, tagId)).thenReturn(2L);
    when(promptRepository.countByAuthoredAndTags(userId, tagId)).thenReturn(2L);
    when(promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(userId, tagId, 2, 0))
        .thenReturn(List.of(mock(PromptWithSourceDTO.class)));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, "tag",
        pageable);

    // Assert
    assertEquals(4, result.getTotalElements());
    assertEquals(1, result.getContent().size());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByFilter_ShouldThrowForInvalidFilter() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 5);
    UUID userId = UUID.randomUUID();

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> promptService.getAuthoredAndPurchasedPromptsByFilter(
            userId, null, "invalidFilter", pageable));
  }

  @Test
  void getPopularPromptsByOptionalTag_ShouldReturnCombinedPrompts() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "popularTag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    // Mock tag lookup
    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);

    // Mock counts
    when(promptRepository.countPopularPurchasedPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(1L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(2L);

    // Mock purchased and authored prompts
    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);
    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);

    when(promptRepository.findPopularPurchasedPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0))
        .thenReturn(List.of(purchasedPrompt));
    when(promptRepository.findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getPopularPromptsByOptionalTag(userId, tagName, pageable);

    // Assert
    assertEquals(3, result.getTotalElements());
    assertEquals(2, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt));
    assertTrue(result.getContent().contains(authoredPrompt));
    verify(tagService).getTagIdByName(tagName);
    verify(promptRepository).findPopularPurchasedPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0);
    verify(promptRepository).findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0);
  }

  @Test
  void getPopularPromptsByOptionalTag_ShouldHandleNullTagName() {
    // Arrange
    UUID userId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(promptRepository.countPopularPurchasedPromptsByUserIdAndOptionalTag(userId, null))
        .thenReturn(0L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null))
        .thenReturn(1L);

    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);
    when(promptRepository.findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null, 2, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getPopularPromptsByOptionalTag(userId, null, pageable);

    // Assert
    assertEquals(1, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(authoredPrompt));
    verify(promptRepository).findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null, 2, 0);
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldReturnCombinedPrompts() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "recentTag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(1L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(2L);

    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);
    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);

    when(promptRepository.getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
        userId, tagId, 1, 0))
        .thenReturn(List.of(purchasedPrompt));
    when(promptRepository.findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(3, result.getTotalElements());
    assertEquals(2, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt));
    assertTrue(result.getContent().contains(authoredPrompt));
    verify(tagService).getTagIdByName(tagName);
    verify(promptRepository)
        .getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId, 1, 0);
    verify(promptRepository).findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId, 1, 0);
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandleNullTagNameAndOnlyAuthored() {
    // Arrange
    UUID userId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, null))
        .thenReturn(0L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null))
        .thenReturn(1L);

    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);
    when(promptRepository.findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null, 2, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, null,
        pageable);

    // Assert
    assertEquals(1, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(authoredPrompt));
    verify(promptRepository).findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, null, 2, 0);
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandleEmptyResults() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "emptyTag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(0L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(0L);

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(0, result.getTotalElements());
    assertTrue(result.getContent().isEmpty());
    verify(tagService).getTagIdByName(tagName);
    verify(promptRepository)
        .countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId);
    verify(promptRepository).countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId);
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandlePaginationBeyondTotalElements() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "tag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(2, 2); // Page beyond available results

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(1L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(2L);

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(3, result.getTotalElements());
    assertTrue(result.getContent().isEmpty());
    assertEquals(2, pageable.getPageNumber());
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandlePartialPageResults() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "tag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 4); // Request more than available

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(1L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(1L);

    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);
    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);

    when(promptRepository.getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
        userId, tagId, 1, 0))
        .thenReturn(List.of(purchasedPrompt));
    when(promptRepository.findPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId, 3, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(2, result.getTotalElements());
    assertEquals(2, result.getContent().size());
    assertEquals(0, result.getNumber());
    assertEquals(1, result.getTotalPages());
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandleOnlyPurchasedPrompts() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "tag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(2L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(0L);

    PromptWithSourceDTO purchasedPrompt1 = mock(PromptWithSourceDTO.class);
    PromptWithSourceDTO purchasedPrompt2 = mock(PromptWithSourceDTO.class);

    when(promptRepository.getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
        userId, tagId, 2, 0))
        .thenReturn(List.of(purchasedPrompt1, purchasedPrompt2));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(2, result.getTotalElements());
    assertEquals(2, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt1));
    assertTrue(result.getContent().contains(purchasedPrompt2));
    verify(promptRepository, never())
        .findPopularAuthoredPromptsByUserIdAndOptionalTag(
            any(UUID.class), any(UUID.class), anyInt(), anyInt());
  }

  @Test
  void getRecentAuthoredAndPurchasedPromptsByOptionalTag_ShouldHandleSecondPageWithRemainingAuthored() {
    // Arrange
    UUID userId = UUID.randomUUID();
    String tagName = "tag";
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(1, 2); // Second page

    when(tagService.getTagIdByName(tagName)).thenReturn(tagId);

    // Use the correct counting methods
    when(promptRepository.countPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(3L);
    when(promptRepository.countPopularAuthoredPromptsByUserIdAndOptionalTag(userId, tagId))
        .thenReturn(2L);

    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);

    // Use lenient stubbing for the method call
    lenient()
        .when(
            promptRepository.getPurchasedPromptsRecentlyCreatedByUserIdAndOptionalTag(
                eq(userId), eq(tagId), anyInt(), anyInt()))
        .thenReturn(List.of(purchasedPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName,
        pageable);

    // Assert
    assertEquals(5, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt));
    assertEquals(1, result.getNumber());
    assertEquals(3, result.getTotalPages());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldHandleEmptyResults() {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, tagId)).thenReturn(0L);
    when(promptRepository.countByAuthoredAndTags(userId, tagId)).thenReturn(0L);

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, "tag",
        pageable);

    // Assert
    assertEquals(0, result.getTotalElements());
    assertTrue(result.getContent().isEmpty());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldHandleNullTagName() {
    // Arrange
    UUID userId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, null)).thenReturn(1L);
    when(promptRepository.countByAuthoredAndTags(userId, null)).thenReturn(1L);

    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);

    // Use lenient() and argument matchers for more flexible stubbing
    lenient()
        .when(
            promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(
                eq(userId), eq(null), anyInt(), anyInt()))
        .thenReturn(List.of(purchasedPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, null,
        pageable);

    // Assert
    assertEquals(2, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt));
    verify(tagService, never()).getTagIdByName(any());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldHandleOnlyAuthored() {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(0, 2);

    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, tagId)).thenReturn(0L);
    when(promptRepository.countByAuthoredAndTags(userId, tagId)).thenReturn(2L);

    PromptWithSourceDTO authoredPrompt = mock(PromptWithSourceDTO.class);
    when(promptRepository.findByAuthorIdAndOptionalTagName(userId, tagId, 2, 0))
        .thenReturn(List.of(authoredPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, "tag",
        pageable);

    // Assert
    assertEquals(2, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(authoredPrompt));
    verify(promptRepository, never())
        .getPurchasedPromptsByUserIdAndOptionalTag(any(), any(), anyInt(), anyInt());
  }

  @Test
  void getAuthoredAndPurchasedPromptsByOptionalTagID_ShouldHandlePaginationWithinPurchased() {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID tagId = UUID.randomUUID();
    Pageable pageable = PageRequest.of(1, 1); // Second item, page size 1

    when(tagService.getTagIdByName("tag")).thenReturn(tagId);
    when(promptRepository.countPurchasedPromptsByOptionalTagName(userId, tagId)).thenReturn(3L);
    when(promptRepository.countByAuthoredAndTags(userId, tagId)).thenReturn(1L);

    PromptWithSourceDTO purchasedPrompt = mock(PromptWithSourceDTO.class);
    when(promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(userId, tagId, 1, 1))
        .thenReturn(List.of(purchasedPrompt));

    // Act
    Page<PromptWithSourceDTO> result = promptService.getAuthoredAndPurchasedPromptsByOptionalTagID(userId, "tag",
        pageable);

    // Assert
    assertEquals(4, result.getTotalElements());
    assertEquals(1, result.getContent().size());
    assertTrue(result.getContent().contains(purchasedPrompt));
    verify(promptRepository, never())
        .findByAuthorIdAndOptionalTagName(any(), any(), anyInt(), anyInt());
  }
}