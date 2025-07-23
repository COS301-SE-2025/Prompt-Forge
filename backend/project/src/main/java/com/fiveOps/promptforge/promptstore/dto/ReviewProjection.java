package com.fiveOps.promptforge.promptstore.dto;

import java.util.UUID;

public interface ReviewProjection {
  UUID getId();

  UUID getPromptId();

  UUID getUserId();

  String getUserName();

  Double getRating();

  String getComment();
}
