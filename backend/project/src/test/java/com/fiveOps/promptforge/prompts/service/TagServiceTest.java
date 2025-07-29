package com.fiveOps.promptforge.prompts.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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

import com.fiveOps.promptforge.prompts.model.Tag;
import com.fiveOps.promptforge.prompts.repository.TagRepository;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

  @Mock private TagRepository tagRepository;

  @InjectMocks private TagService tagService;

  private Tag testTag;

  @BeforeEach
  void setUp() {
    testTag = new Tag();
    testTag.setId(UUID.randomUUID());
    testTag.setName("Test-tag");
    testTag.setSlug("test-tag");
  }

  @Test
  void findOrCreateTag_ShouldReturnExistingTag() {
    // Arrange
    when(tagRepository.findByName("Test-tag")).thenReturn(Optional.of(testTag));

    // Act
    Tag result = tagService.findOrCreateTag("test-tag");

    // Assert
    assertEquals(testTag, result);
    verify(tagRepository).findByName("Test-tag");
    verify(tagRepository, never()).save(any());
  }

  @Test
  void findOrCreateTag_ShouldCreateNewTagWhenNotExists() {
    // Arrange
    when(tagRepository.findByName("New-tag")).thenReturn(Optional.empty());
    when(tagRepository.save(any(Tag.class)))
        .thenAnswer(
            invocation -> {
              Tag t = invocation.getArgument(0);
              t.setId(UUID.randomUUID());
              return t;
            });

    // Act
    Tag result = tagService.findOrCreateTag("new-tag");

    // Assert
    assertNotNull(result);
    assertEquals("New-tag", result.getName());
    verify(tagRepository).findByName("New-tag");
    verify(tagRepository).save(any(Tag.class));
  }

  @Test
  void findOrCreateTags_ShouldHandleMultipleTags() {
    // Arrange
    List<String> tagNames = Arrays.asList("tag1", "tag2");

    Tag tag1 = new Tag();
    tag1.setId(UUID.randomUUID());
    tag1.setName("Tag1");

    Tag tag2 = new Tag();
    tag2.setId(UUID.randomUUID());
    tag2.setName("Tag2");

    when(tagRepository.findByName("Tag1")).thenReturn(Optional.of(tag1));
    when(tagRepository.findByName("Tag2")).thenReturn(Optional.of(tag2));

    // Act
    List<Tag> result = tagService.findOrCreateTags(tagNames);

    // Assert
    assertEquals(2, result.size());
    assertTrue(result.contains(tag1));
    assertTrue(result.contains(tag2));
  }

  @Test
  void incrementUsageCount_ShouldCallRepository() {
    // Arrange
    UUID tagId = UUID.randomUUID();

    // Act
    tagService.incrementUsageCount(tagId);

    // Assert
    verify(tagRepository).incrementUsageCount(tagId);
  }

  @Test
  void getPopularTags_ShouldReturnTagsOrderedByUsage() {
    // Arrange
    List<Tag> expectedTags = Arrays.asList(testTag);
    when(tagRepository.findPopularTags(5)).thenReturn(expectedTags);

    // Act
    List<Tag> result = tagService.getPopularTags(5);

    // Assert
    assertEquals(expectedTags, result);
    verify(tagRepository).findPopularTags(5);
  }

  @Test
  void getTagIdByName_ShouldReturnTagId() {
    // Arrange
    when(tagRepository.findByName("Test-tag")).thenReturn(Optional.of(testTag));

    // Act
    UUID result = tagService.getTagIdByName("test-tag");

    // Assert
    assertEquals(testTag.getId(), result);
  }

  @Test
  void getTagIdByName_ShouldThrowWhenTagNotFound() {
    // Arrange
    when(tagRepository.findByName("missing")).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(RuntimeException.class, () -> tagService.getTagIdByName("missing"));
  }

  @Test
  void normalizeTagName_ShouldTrimWhitespace() {
    // Act
    String result = tagService.normalizeTagName("  Test  ");

    // Assert
    assertEquals("Test", result);
  }

  @Test
  void generateSlug_ShouldCreateValidSlug() {
    // Act
    String result = tagService.generateSlug("Test @ Tag #123");

    // Assert
    assertEquals("test-tag-123", result);
  }
}
