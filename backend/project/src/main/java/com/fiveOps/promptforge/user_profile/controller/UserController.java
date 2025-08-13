package com.fiveOps.promptforge.user_profile.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;
import com.fiveOps.promptforge.util.service.MailService;

@RestController
@RequestMapping("/api/user")
public class UserController {

  private static final org.slf4j.Logger LOGGER =
      org.slf4j.LoggerFactory.getLogger(UserController.class);

  @Autowired private UserService userService;

  @Autowired private JwtUtil jwtUtil;

  @Autowired private MailService mailService;

  @GetMapping("/{id}")
  public UserDto getUser(@PathVariable UUID id) {
    return userService.getUserById(id);
  }

  @PatchMapping("/{id}")
  public UserDto updateUser(@PathVariable UUID id, @RequestBody UpdateProfileDto dto) {
    return userService.updateUser(id, dto);
  }

  @GetMapping("/me")
  public ResponseEntity<UserDto> getCurrentUser(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    UserDto user = userService.getUserByEmail(email);
    return ResponseEntity.ok(user);
  }

  // Update own profile
  @PatchMapping("/me")
  public UserDto updateCurrentUser(HttpServletRequest request, @RequestBody UpdateProfileDto dto) {
    String email = extractEmailFromCookie(request);
    return userService.updateUserByEmail(email, dto);
  }

  @GetMapping("/me/id")
  public Map<String, UUID> getCurrentUserId(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    UUID userId = userService.getUserIdByEmail(email);
    return Map.of("userId", userId);
  }

  @GetMapping
  public List<UserDto> getAllUsers() {
    return userService.getAllUsers();
  }

  @DeleteMapping("/{id}")
  public void deleteUser(@PathVariable UUID id) {
    userService.deleteUser(id);
  }

  // Helper: Get email from JWT cookie
  private String extractEmailFromCookie(HttpServletRequest request) {
    if (request.getCookies() == null) throw new RuntimeException("No cookies found");

    for (Cookie cookie : request.getCookies()) {
      if (cookie.getName().equals("token")) {
        return jwtUtil.extractUsername(cookie.getValue()); // email stored as subject
      }
    }
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication token not found");
  }

  @PostMapping(
      value = "/upload-picture",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Map<String, String>> uploadProfilePicture(
      @RequestPart("file") MultipartFile file, // Using @RequestPart instead of @RequestParam
      HttpServletRequest request) {
    try {
      if (file.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
      }

      String email = extractEmailFromCookie(request);
      String imageUrl = userService.saveProfilePicture(email, file);

      return ResponseEntity.ok(
          Map.of("url", imageUrl, "message", "Profile picture uploaded successfully"));
    } catch (Exception e) {
      LOGGER.error("Error uploading profile picture: ", e);
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile picture", e);
    }
  }

  @DeleteMapping("/delete-picture")
  public ResponseEntity<Map<String, String>> deleteProfilePicture(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    userService.deleteProfilePicture(email);
    return ResponseEntity.ok(Map.of("message", "Profile picture deleted"));
  }

  @GetMapping("/search")
  public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String query) {
    // Basic validation
    if (query == null || query.trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Search query cannot be empty"));
    }

    // Process query - remove special chars and normalize
    String processedQuery = query.replaceAll("[^a-zA-Z0-9\\s]", "").toLowerCase().trim();
    if (processedQuery.isEmpty()) {
      return ResponseEntity.ok(Map.of("results", List.of(), "total", 0));
    }

    List<UserDto> results = userService.fuzzySearchUsers(processedQuery);

    return ResponseEntity.ok(Map.of("results", results, "total", results.size()));
  }

  @GetMapping("/me/followers")
  public List<UserDto> getFollowers(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    return userService.getFollowersByEmail(email);
  }

  @GetMapping("/me/following")
  public List<UserDto> getFollowing(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    return userService.getFollowingByEmail(email);
  }

  @GetMapping("/me/card")
  public ResponseEntity<Map<String, Object>> getDashboardCardData(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    UserDto user = userService.getUserByEmail(email);

    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
    }

    Map<String, Object> cardData =
        Map.of(
            "username",
            user.getUsername() != null ? user.getUsername() : "",
            "bio",
            user.getBio() != null ? user.getBio() : "",
            "profilePicture",
            user.getProfilePicture() != null ? user.getProfilePicture() : "",
            "followersCount",
            user.getFollowers() == null ? 0 : user.getFollowers().size(),
            "followingCount",
            user.getFollowing() == null ? 0 : user.getFollowing().size(),
            "badges",
            user.getBadges() == null ? List.of() : user.getBadges());

    return ResponseEntity.ok(cardData);
  }

  @GetMapping("/me/full")
  public ResponseEntity<UserDto> getFullCurrentUser(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    return ResponseEntity.ok(userService.getUserByEmail(email));
  }

  // Forgot password: send email
  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    User user = userService.findByEmail(email);
    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }
    String token = java.util.UUID.randomUUID().toString();
    user.setResetToken(token);
    userService.save(user);

    String resetLink = "https://your-frontend-url/reset-password?token=" + token;
    mailService.sendMail(email, "Password Reset", "Reset your password: " + resetLink);

    return ResponseEntity.ok(Map.of("message", "Reset email sent"));
  }

  // Reset password: use token
  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
    String token = body.get("token");
    String newPassword = body.get("newPassword");
    User user = userService.findByResetToken(token);
    if (user == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid token"));
    }
    user.setPasswordHash(userService.encodePassword(newPassword));
    user.setResetToken(null);
    userService.save(user);
    return ResponseEntity.ok(Map.of("message", "Password reset successful"));
  }

  @PostMapping("/change-password")
  public ResponseEntity<?> changePassword(
      HttpServletRequest request, @RequestBody Map<String, String> body) {
    String email = extractEmailFromCookie(request);
    String currentPassword = body.get("currentPassword");
    String newPassword = body.get("newPassword");
    User user = userService.findByEmail(email);
    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }
    if (!userService.matchesPassword(currentPassword, user.getPasswordHash())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Current password incorrect"));
    }
    user.setPasswordHash(userService.encodePassword(newPassword));
    userService.save(user);
    return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
  }

  @GetMapping("/discover")
  public ResponseEntity<Map<String, Object>> getDiscoverableUsers(HttpServletRequest request) {
    String currentUserEmail = extractEmailFromCookie(request);
    List<UserDto> users = userService.getAllUsersExceptCurrent(currentUserEmail);

    List<Map<String, Object>> formattedUsers =
        users.stream()
            .map(
                user -> {
                  Map<String, Object> userMap = new HashMap<>();

                  userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
                  userMap.put("bio", user.getBio() != null ? user.getBio() : "");
                  userMap.put(
                      "profilePicture",
                      user.getProfilePicture() != null ? user.getProfilePicture() : "");
                  userMap.put(
                      "followersCount",
                      user.getFollowers() != null ? user.getFollowers().size() : 0);
                  userMap.put(
                      "followingCount",
                      user.getFollowing() != null ? user.getFollowing().size() : 0);

                  return userMap;
                })
            .collect(Collectors.toList());

    return ResponseEntity.ok(Map.of("count", formattedUsers.size(), "users", formattedUsers));
  }
}
