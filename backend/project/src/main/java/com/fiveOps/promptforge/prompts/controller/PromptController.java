package com.fiveOps.promptforge.prompts.controller;

import java.util.List;
import java.util.UUID;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithSourceDTO;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {
  private final PromptService promptService;
  private final JwtUtil jwtUtil;
  private final UserService userService;

  public PromptController(PromptService promptService, JwtUtil jwtUtil, UserService userService) {
    this.promptService = promptService;
    this.jwtUtil = jwtUtil;
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<List<Prompt>> getAllPrompts() {
    return ResponseEntity.ok(promptService.getAllPrompts());
  }

  @GetMapping("/author/{authorId}")
  public ResponseEntity<Page<PromptWithSourceDTO>> getPromptsByAuthor(@PathVariable UUID authorId,
    Pageable pageable) {
    return ResponseEntity.ok(promptService.getPromptsByAuthor(authorId,pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Prompt> getPromptById(@PathVariable UUID id) {
    Prompt prompt = promptService.getPromptById(id);
    return prompt != null ? ResponseEntity.ok(prompt) : ResponseEntity.notFound().build();
  }

  @PostMapping
  public ResponseEntity<?> createPrompt(@RequestBody Prompt prompt, HttpServletRequest request) {
    if (prompt.getPrice() == null) {
      prompt.setPrice(0.0);
    }

    try {
      // Extract JWT token from cookies
      String token = null;
      Cookie[] cookies = request.getCookies();

      if (cookies != null) {
        for (Cookie cookie : cookies) {
          if ("token".equals(cookie.getName())) {
            token = cookie.getValue();
            break;
          }
        }
      }

      if (token == null || token.isEmpty()) {
        System.err.println("No JWT token found in cookies");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body("{\"error\": \"Authentication required\"}");
      }

      // Validate token
      if (!jwtUtil.validateToken(token)) {
        System.err.println("Invalid JWT token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body("{\"error\": \"Invalid token\"}");
      }

      // Extract email from token
      String userEmail = jwtUtil.extractUsername(token);

      if (userEmail == null || userEmail.isEmpty()) {
        System.err.println("Could not extract email from token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body("{\"error\": \"Invalid token format\"}");
      }

      // Find user by email and get their ID
      User user = userService.findByEmail(userEmail);
      if (user == null) {
        System.err.println("User not found for email: " + userEmail);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body("{\"error\": \"User not found\"}");
      }

      // Set the authorId from the authenticated user
      prompt.setAuthorId(user.getUserId()); // Note: using getUserId() based on your UserService

      System.out.println(
          "Creating prompt for user: " + userEmail + " (ID: " + user.getUserId() + ")");

      Prompt created = promptService.createPrompt(prompt);
      return ResponseEntity.ok(created);

    } catch (Exception e) {
      System.err.println("Error creating prompt: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
    }

  }

  @PutMapping("/{id}")
  public ResponseEntity<Prompt> updatePrompt(
      @PathVariable UUID id, @RequestBody Prompt promptDetails) {
    Prompt updatedPrompt = promptService.updatePrompt(id, promptDetails);
    return updatedPrompt != null
        ? ResponseEntity.ok(updatedPrompt)
        : ResponseEntity.notFound().build();
  }

  @PostMapping("/{id}/publish")
  public ResponseEntity<Prompt> publishPrompt(@PathVariable UUID id) {
    Prompt publishedPrompt = promptService.publishPrompt(id);
    return publishedPrompt != null
        ? ResponseEntity.ok(publishedPrompt)
        : ResponseEntity.notFound().build();
  }

  @PostMapping("/{id}/unpublish")
  public ResponseEntity<Prompt> unpublishPrompt(@PathVariable UUID id) {
    Prompt unpublishedPrompt = promptService.unpublishPrompt(id);
    return unpublishedPrompt != null
        ? ResponseEntity.ok(unpublishedPrompt)
        : ResponseEntity.notFound().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deletePrompt(@PathVariable UUID id) {
    boolean deleted = promptService.deletePrompt(id);
    return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  @GetMapping("/by-tag/{tagName}")
  public ResponseEntity<List<Prompt>> getByTagName(@PathVariable String tagName) {
    return ResponseEntity.ok(promptService.getPromptsByTagName(tagName));
  }

  @GetMapping("/search")
  public ResponseEntity<List<Prompt>> searchPrompts(
      @RequestParam String query, @RequestParam(required = false) Boolean onlyPublic) {

    if (onlyPublic != null && onlyPublic) {
      return ResponseEntity.ok(promptService.searchPublicByTitle(query));

    }
    return ResponseEntity.ok(promptService.searchByTitle(query));
  }

  @GetMapping("/purchased")
    public ResponseEntity<Page<PromptWithSourceDTO>> getPurchasedPrompts(
      Pageable pageable, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        String userEmail = authentication.getName();
        UUID userId = userService.getUserIdByEmail(userEmail);
        System.out.println("\nuserEmail in purchased:"+userEmail);
        System.out.println("\nuserId in purchased:"+userId);
        System.out.println(userId);
        return ResponseEntity.ok(promptService.getPurchasedPrompts(userId, pageable));
        
    }

    @GetMapping("/myprompts/{userId}")
    public ResponseEntity<Page<PromptWithSourceDTO>> getAuthoredAndPurchasedPrompts(
      @PathVariable UUID userId, Pageable pageable) {
        
      return ResponseEntity.ok(promptService.getAuthoredAndPurchasedPrompts(userId, pageable));
    }
    
    @GetMapping("/myprompts/{userId}/tag/{tagName}")
    public ResponseEntity<Page<PromptWithSourceDTO>> getAuthoredAndPurchasedPrompts(
      @PathVariable UUID userId, @PathVariable String tagName, Pageable pageable) {
        
      return ResponseEntity.ok(promptService
      .getAuthoredAndPurchasedPromptsByTagID(userId ,tagName, pageable));
    }
}

