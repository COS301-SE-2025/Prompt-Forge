package com.fiveOps.promptforge.prompts.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@ExtendWith(MockitoExtension.class)
class PromptServiceTest {

  @Mock private PromptRepository promptRepository;

  @Mock private TagService tagService;

  @InjectMocks private PromptService promptService;

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

  // @Test
  // void getPromptsByAuthor_ShouldReturnAuthorPrompts() {
  //   // Arrange
  //   List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
  //   when(promptRepository.findByAuthorId(authorId)).thenReturn(expectedPrompts);

  //   // Act
  //   List<Prompt> result = promptService.getPromptsByAuthor(authorId);

  //   // Assert
  //   assertEquals(expectedPrompts, result);
  //   verify(promptRepository).findByAuthorId(authorId);
  // }

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
    newPrompt.setTagNames(Arrays.asList("tag1", "tag2"));

    Tag tag1 = new Tag();
    tag1.setId(UUID.randomUUID());
    Tag tag2 = new Tag();
    tag2.setId(UUID.randomUUID());

    when(tagService.findOrCreateTags(anyList())).thenReturn(Arrays.asList(tag1, tag2));
    when(promptRepository.save(any(Prompt.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    Prompt result = promptService.createPrompt(newPrompt);

    // Assert
    assertNotNull(result.getTagIds());
    assertEquals(2, result.getTagIds().size());
    verify(tagService).findOrCreateTags(Arrays.asList("tag1", "tag2"));
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
    when(tagService.getTagIdByName("test")).thenReturn(tagId);
    when(promptRepository.findByTagId(tagId)).thenReturn(Arrays.asList(testPrompt));

    // Act
    List<Prompt> result = promptService.getPromptsByTagName("test");

    // Assert
    assertEquals(1, result.size());
    assertEquals(testPrompt, result.get(0));
    verify(tagService).getTagIdByName("test");
    verify(promptRepository).findByTagId(tagId);
  }

  @Test
  void searchByTitle_ShouldReturnMatchingPrompts() {
    // Arrange
    String searchTerm = "test";
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
    String searchTerm = "test";
    when(promptRepository.searchPublicByTitle(searchTerm)).thenReturn(Arrays.asList(testPrompt));

    // Act
    List<Prompt> result = promptService.searchPublicByTitle(searchTerm);

    // Assert
    assertEquals(1, result.size());
    assertEquals(testPrompt, result.get(0));
    verify(promptRepository).searchPublicByTitle(searchTerm);
  }
}
