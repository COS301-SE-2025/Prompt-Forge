package com.fiveOps.promptforge.badges.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fiveOps.promptforge.badges.dto.BadgeDto;
import com.fiveOps.promptforge.badges.service.BadgeAwardingService;
import com.fiveOps.promptforge.badges.service.BadgeService;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.service.UserService;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

  @Autowired private BadgeService badgeService;

  @Autowired private UserService userService;

  @Autowired private JwtUtil jwtUtil;

  @Autowired private BadgeAwardingService badgeAwardingService;

  // Helper method to extract email from cookie (copied from UserController)
  private String extractEmailFromCookie(HttpServletRequest request) {
    if (request.getCookies() == null) throw new RuntimeException("No cookies found");

    for (Cookie cookie : request.getCookies()) {
      if (cookie.getName().equals("token")) {
        return jwtUtil.extractUsername(cookie.getValue()); // email stored as subject
      }
    }
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication token not found");
  }

  // Get all available badges
  @GetMapping
  public ResponseEntity<List<BadgeDto>> getAllBadges() {
    return ResponseEntity.ok(badgeService.getAllActiveBadges());
  }

  // Get current user's badges (with progress)
  @GetMapping("/me")
  public ResponseEntity<List<BadgeDto>> getMyBadges(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    if (email == null) {
      return ResponseEntity.status(401).build();
    }

    var user = userService.getUserByEmail(email);
    if (user == null) {
      return ResponseEntity.status(404).build();
    }

    return ResponseEntity.ok(badgeService.getUserBadges(user.getUserId()));
  }

  // Get current user's earned badges only (for profile display)
  @GetMapping("/me/earned")
  public ResponseEntity<List<BadgeDto>> getMyEarnedBadges(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    if (email == null) {
      return ResponseEntity.status(401).build();
    }

    var user = userService.getUserByEmail(email);
    if (user == null) {
      return ResponseEntity.status(404).build();
    }

    return ResponseEntity.ok(badgeService.getUserEarnedBadges(user.getUserId()));
  }

  // Get badges for a specific user (earned and visible only)
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<BadgeDto>> getUserBadges(@PathVariable UUID userId) {
    return ResponseEntity.ok(badgeService.getUserEarnedBadges(userId));
  }

  // Get badges for a specific username (earned and visible only)
  @GetMapping("/user/username/{username}")
  public ResponseEntity<List<BadgeDto>> getUserBadgesByUsername(@PathVariable String username) {
    var user = userService.getUserByUsername(username);
    if (user == null) {
      return ResponseEntity.status(404).build();
    }

    return ResponseEntity.ok(badgeService.getUserEarnedBadges(user.getUserId()));
  }

  // Toggle badge visibility
  @PostMapping("/{badgeId}/toggle-visibility")
  public ResponseEntity<Map<String, String>> toggleBadgeVisibility(
      @PathVariable UUID badgeId, HttpServletRequest request) {

    String email = extractEmailFromCookie(request);
    if (email == null) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    var user = userService.getUserByEmail(email);
    if (user == null) {
      return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    badgeService.toggleBadgeVisibility(user.getUserId(), badgeId);
    return ResponseEntity.ok(Map.of("message", "Badge visibility toggled"));
  }

  // Get badge count for current user
  @GetMapping("/me/count")
  public ResponseEntity<Map<String, Long>> getMyBadgeCount(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    if (email == null) {
      return ResponseEntity.status(401).build();
    }

    var user = userService.getUserByEmail(email);
    if (user == null) {
      return ResponseEntity.status(404).build();
    }

    Long count = badgeService.getUserBadgeCount(user.getUserId());
    return ResponseEntity.ok(Map.of("count", count));
  }

  // Manual badge check - awards all qualifying badges based on current stats
  @PostMapping("/me/check")
  public ResponseEntity<Map<String, Object>> checkAndAwardMyBadges(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    if (email == null) {
      return ResponseEntity.status(401).build();
    }

    var user = userService.getUserByEmail(email);
    if (user == null) {
      return ResponseEntity.status(404).build();
    }

    try {
      System.out.println("🎯 Manual badge check triggered for user: " + user.getUserId());
      badgeAwardingService.checkAndAwardAllBadges(user.getUserId());

      // Get updated badge count
      Long newCount = badgeService.getUserBadgeCount(user.getUserId());

      return ResponseEntity.ok(
          Map.of(
              "message",
              "Badge check completed successfully",
              "badgeCount",
              newCount,
              "userId",
              user.getUserId().toString()));
    } catch (Exception e) {
      System.err.println("❌ Error during manual badge check: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500)
          .body(Map.of("error", "Badge check failed: " + e.getMessage()));
    }
  }
}
