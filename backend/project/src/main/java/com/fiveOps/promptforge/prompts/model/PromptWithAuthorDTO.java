package com.fiveOps.promptforge.prompts.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PromptWithAuthorDTO {

  UUID getId();

  UUID getAuthorId();

  String getTitle();

  String getSlug();

  String getDescription();

  Double getPrice();

  LocalDateTime getCreatedAt();

  LocalDateTime getPublishedAt();

  List<UUID> getTagIds();

  String[] getTagNames();

  String getAuthorName(); // (JOINed)

}
