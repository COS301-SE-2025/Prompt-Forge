package com.fiveOps.promptforge.prompts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptInteraction;
import com.fiveOps.promptforge.user_profile.model.User;

@Repository
public interface PromptInteractionRepository extends JpaRepository<PromptInteraction, Long> {
  List<PromptInteraction> findByPrompt(Prompt prompt);

  List<PromptInteraction> findByUser(User user);

  List<PromptInteraction> findByPromptAndAction(Prompt prompt, String action);

  long countByPromptAndAction(Prompt prompt, String action);

  long countByPrompt(Prompt prompt);
}
