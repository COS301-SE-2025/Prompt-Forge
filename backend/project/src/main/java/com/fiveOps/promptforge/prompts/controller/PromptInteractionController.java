package com.fiveOps.promptforge.prompts.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.prompts.service.PromptInteractionService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;

@RestController
@RequestMapping("/api/prompt-interactions")
public class PromptInteractionController {
  @Autowired private PromptInteractionService promptInteractionService;
  @Autowired private PromptRepository promptRepository;
  @Autowired private UserService userService;

  @PostMapping("/record")
  public ResponseEntity<?> recordInteraction(
      @RequestParam UUID promptId, @RequestParam UUID userId, @RequestParam String action) {
    Prompt prompt = promptRepository.findById(promptId).orElse(null);
    User user = userService.findById(userId);
    if (prompt == null || user == null) {
      return ResponseEntity.badRequest().body("Invalid prompt or user");
    }
    promptInteractionService.recordInteraction(prompt, user, action);
    return ResponseEntity.ok("Interaction recorded");
  }

  @GetMapping("/bounce-rate/{promptId}")
  public ResponseEntity<Double> getPromptBounceRate(@PathVariable UUID promptId) {
    Prompt prompt = promptRepository.findById(promptId).orElse(null);
    if (prompt == null) {
      return ResponseEntity.notFound().build();
    }
    double bounceRate = promptInteractionService.getPromptBounceRate(prompt);
    return ResponseEntity.ok(bounceRate);
  }
}
