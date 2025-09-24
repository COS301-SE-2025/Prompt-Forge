package com.fiveOps.promptforge.user_profile.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
  public List<UserDto> searchUsers(@RequestParam String query) {
    return userService.searchUsers(query);
  }

  // Paginated endpoints for social features
  @GetMapping("/paginated")
  public ResponseEntity<Map<String, Object>> getUsersPaginated(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String search) {

    org.springframework.data.domain.Page<UserDto> usersPage =
        userService.getUsersPaginated(page, size, search);

    Map<String, Object> response =
        Map.of(
            "content", usersPage.getContent(),
            "totalPages", usersPage.getTotalPages(),
            "totalElements", usersPage.getTotalElements(),
            "size", usersPage.getSize(),
            "number", usersPage.getNumber());

    return ResponseEntity.ok(response);
  }

  @GetMapping("/discover")
  public ResponseEntity<Map<String, Object>> getDiscoverUsersPaginated(Authentication authentication,
      HttpServletRequest request,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String search) {

    String email;
    
    search = (search == null)? "" : search;

    if (authentication != null
        && authentication.getName() != null
        && !authentication.getName().trim().isEmpty()) {
      email = authentication.getName();
    } else {
      email = extractEmailFromCookie(request);
    }
      
    if(email.trim() == ""){
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Unauthenticated"));
    }

    UUID currentUserId = userService.getUserIdByEmail(email);

    org.springframework.data.domain.Page<UserDto> usersPage =
        userService.discoverUsersPaginated(search, currentUserId, page, size);

    Map<String, Object> response =
        Map.of(
            "content", usersPage.getContent(),
            "totalPages", usersPage.getTotalPages(),
            "totalElements", usersPage.getTotalElements(),
            "size", usersPage.getSize(),
            "number", usersPage.getNumber());

    return ResponseEntity.ok(response);
  }

  @GetMapping("/me/followers")
  public List<UserDto> getFollowers(Authentication authentication, HttpServletRequest request) {
    String email;

    // Try Authentication first, then fall back to cookies
    if (authentication != null
        && authentication.getName() != null
        && !authentication.getName().trim().isEmpty()) {
      email = authentication.getName();
    } else {
      email = extractEmailFromCookie(request);
    }

    return userService.getFollowersByEmail(email);
  }

  @GetMapping("/me/followers/paginated")
  public ResponseEntity<Map<String, Object>> getFollowersPaginated(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      Authentication authentication,
      HttpServletRequest request) {

    try {
      String email;

      // Try Authentication first, then fall back to cookies
      if (authentication != null
          && authentication.getName() != null
          && !authentication.getName().trim().isEmpty()) {
        email = authentication.getName();
      } else {
        email = extractEmailFromCookie(request);
      }

      org.springframework.data.domain.Page<UserDto> followersPage =
          userService.getFollowersPaginated(email, page, size);

      Map<String, Object> response =
          Map.of(
              "content", followersPage.getContent(),
              "totalPages", followersPage.getTotalPages(),
              "totalElements", followersPage.getTotalElements(),
              "size", followersPage.getSize(),
              "number", followersPage.getNumber());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      LOGGER.error("Error getting followers paginated: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to get followers", "error", e.getMessage()));
    }
  }

  @GetMapping("/me/following")
  public List<UserDto> getFollowing(Authentication authentication, HttpServletRequest request) {
    String email;

    // Try Authentication first, then fall back to cookies
    if (authentication != null
        && authentication.getName() != null
        && !authentication.getName().trim().isEmpty()) {
      email = authentication.getName();
    } else {
      email = extractEmailFromCookie(request);
    }

    return userService.getFollowingByEmail(email);
  }

  @GetMapping("/me/following/paginated")
  public ResponseEntity<Map<String, Object>> getFollowingPaginated(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      Authentication authentication,
      HttpServletRequest request) {

    try {
      String email;

      // Try Authentication first, then fall back to cookies
      if (authentication != null
          && authentication.getName() != null
          && !authentication.getName().trim().isEmpty()) {
        email = authentication.getName();
      } else {
        email = extractEmailFromCookie(request);
      }

      org.springframework.data.domain.Page<UserDto> followingPage =
          userService.getFollowingPaginated(email, page, size);

      Map<String, Object> response =
          Map.of(
              "content", followingPage.getContent(),
              "totalPages", followingPage.getTotalPages(),
              "totalElements", followingPage.getTotalElements(),
              "size", followingPage.getSize(),
              "number", followingPage.getNumber());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      LOGGER.error("Error getting following paginated: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to get following", "error", e.getMessage()));
    }
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

  @GetMapping("/profile/{username}")
  public ResponseEntity<Map<String, Object>> getUserData(
      @PathVariable String username, Authentication authentication) {
    // String email = extractEmailFromCookie(request);
    if (authentication == null
        || authentication.getName() == null
        || authentication.getName().trim().equals("")) {
      return ResponseEntity.status(401).build();
    }

    String userEmail = authentication.getName();
    UUID currentUserId = userService.getUserIdByEmail(userEmail);

    UserDto user = userService.getUserByUsername(username);

    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
    }

    Map<String, Object> cardData =
        Map.of(
            "userId",
            user.getUserId() != null ? user.getUserId() : "",
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
            user.getBadges() == null ? List.of() : user.getBadges(),
            "isFollowing",
            user.getFollowers().contains(currentUserId),
            "isFollowedBy",
            user.getFollowing().contains(currentUserId));

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

  // Follow/Unfollow endpoints
  @PostMapping("/{targetUserId}/follow")
  public ResponseEntity<Map<String, Object>> followUser(
      @PathVariable UUID targetUserId, Authentication authentication, HttpServletRequest request) {
    try {
      String email;

      // Try Authentication first, then fall back to cookies
      if (authentication != null
          && authentication.getName() != null
          && !authentication.getName().trim().isEmpty()) {
        email = authentication.getName();
      } else {
        email = extractEmailFromCookie(request);
      }

      UUID currentUserId = userService.getUserIdByEmail(email);
      userService.followUser(currentUserId, targetUserId);

      return ResponseEntity.ok(
          Map.of("message", "Successfully followed user", "isFollowing", true));
    } catch (Exception e) {
      LOGGER.error("Error following user: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to follow user", "error", e.getMessage()));
    }
  }

  @DeleteMapping("/{targetUserId}/follow")
  public ResponseEntity<Map<String, Object>> unfollowUser(
      @PathVariable UUID targetUserId, Authentication authentication, HttpServletRequest request) {
    try {
      String email;

      // Try Authentication first, then fall back to cookies
      if (authentication != null
          && authentication.getName() != null
          && !authentication.getName().trim().isEmpty()) {
        email = authentication.getName();
      } else {
        email = extractEmailFromCookie(request);
      }

      UUID currentUserId = userService.getUserIdByEmail(email);
      userService.unfollowUser(currentUserId, targetUserId);

      return ResponseEntity.ok(
          Map.of("message", "Successfully unfollowed user", "isFollowing", false));
    } catch (Exception e) {
      LOGGER.error("Error unfollowing user: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to unfollow user", "error", e.getMessage()));
    }
  }

  @GetMapping("/{targetUserId}/follow-status")
  public ResponseEntity<Map<String, Object>> getFollowStatus(
      @PathVariable UUID targetUserId, Authentication authentication, HttpServletRequest request) {
    try {
      String email;

      // Try Authentication first, then fall back to cookies
      if (authentication != null
          && authentication.getName() != null
          && !authentication.getName().trim().isEmpty()) {
        email = authentication.getName();
      } else {
        email = extractEmailFromCookie(request);
      }

      UUID currentUserId = userService.getUserIdByEmail(email);

      boolean isFollowing = userService.isFollowing(currentUserId, targetUserId);

      return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    } catch (Exception e) {
      LOGGER.error("Error checking follow status: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to check follow status", "error", e.getMessage()));
    }
  }
}
