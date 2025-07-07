package com.fiveOps.promptforge.prompts.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fiveOps.promptforge.prompts.service.TagService;

class PromptTest {

  @Mock private TagService tagService;

  private Prompt prompt;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    prompt = new Prompt();
    prompt.setTitle("Test Prompt");
    prompt.setContent("Test Content");
  }

  @Test
  void generateSlug_ShouldCreateSlugFromTitle() {
    // Act
    prompt.onCreate();

    // Assert
    assertEquals("test-prompt", prompt.getSlug());
  }

  @Test
  void generateSlug_ShouldHandleSpecialCharacters() {
    // Arrange
    prompt.setTitle("Test @ Prompt #123");

    // Act
    prompt.onCreate();

    // Assert
    assertEquals("test-prompt-123", prompt.getSlug());
  }

  @Test
  void generateSlug_ShouldUpdateSlugOnTitleChange() {
    // Arrange
    prompt.onCreate(); // Initial slug
    String initialSlug = prompt.getSlug();

    // Act
    prompt.setTitle("Updated Title");
    prompt.onUpdate(); // chnage slug on update

    // Assert
    assertNotEquals(initialSlug, prompt.getSlug());
    assertEquals("updated-title", prompt.getSlug());
  }

  @Test
  void resolveAndSetTags_ShouldConvertTagNamesToTagIds() {
    // Arrange
    List<String> tagNames = Arrays.asList("tag1", "tag2");
    prompt.setTagNames(tagNames);

    UUID tagId1 = UUID.randomUUID();
    UUID tagId2 = UUID.randomUUID();

    Tag tag1 = new Tag();
    tag1.setId(tagId1);
    tag1.setName("tag1");

    Tag tag2 = new Tag();
    tag2.setId(tagId2);
    tag2.setName("tag2");

    when(tagService.findOrCreateTags(tagNames)).thenReturn(Arrays.asList(tag1, tag2));

    // Act
    prompt.resolveAndSetTags(tagService);

    // Assert
    assertNotNull(prompt.getTagIds());
    assertEquals(2, prompt.getTagIds().size());
    assertTrue(prompt.getTagIds().contains(tagId1));
    assertTrue(prompt.getTagIds().contains(tagId2));
  }

  @Test
  void resolveAndSetTags_ShouldDoNothingWhenNoTagNames() {
    // Arrange
    prompt.setTagNames(null);

    // Act
    prompt.resolveAndSetTags(tagService);

    // Assert
    assertNull(prompt.getTagIds());
    verifyNoInteractions(tagService);
  }
}
