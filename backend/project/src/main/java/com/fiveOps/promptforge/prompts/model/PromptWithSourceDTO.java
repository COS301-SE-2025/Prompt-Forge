package com.fiveOps.promptforge.prompts.model;

import java.util.UUID;

public interface PromptWithSourceDTO extends PromptWithAuthorDTO {
  UUID getPurchaseId();
  String getSource();
  long getUsageCount();

}
