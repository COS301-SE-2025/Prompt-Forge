package com.fiveOps.promptforge.user_profile.controller;

import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
public class UserController {

  @Autowired
  private UserService userService;

  @Autowired
  private JwtUtil jwtUtil;

  @GetMapping("/{id}")
  public UserDto getUser(@PathVariable UUID id) {
    return userService.getUserById(id);
  }

  @PatchMapping("/{id}")
  public UserDto updateUser(
    @PathVariable UUID id,
    @RequestBody UpdateProfileDto dto
  ) {
    return userService.updateUser(id, dto);
  }

  // Get own user profile
  @GetMapping("/me")
  public UserDto getCurrentUser(HttpServletRequest request) {
    String email = extractEmailFromCookie(request);
    return userService.getUserByEmail(email);
  }

  // Update own profile
  @PatchMapping("/me")
  public UserDto updateCurrentUser(
    HttpServletRequest request,
    @RequestBody UpdateProfileDto dto
  ) {
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
    if (request.getCookies() == null) throw new RuntimeException(
      "No cookies found"
    );

    for (Cookie cookie : request.getCookies()) {
      if (cookie.getName().equals("token")) {
        return jwtUtil.extractUsername(cookie.getValue()); // email stored as subject
      }
    }
    throw new RuntimeException("Token not found");
  }

  @PostMapping(
    value = "/upload-picture",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
  )
  public ResponseEntity<Map<String, String>> uploadProfilePicture(
    @RequestParam("file") MultipartFile file,
    HttpServletRequest request
  ) {
    String email = extractEmailFromCookie(request);
    String imageUrl = userService.saveProfilePicture(email, file);
    return ResponseEntity.ok(Map.of("url", imageUrl));
  }

  @DeleteMapping("/delete-picture")
  public ResponseEntity<Map<String, String>> deleteProfilePicture(
    HttpServletRequest request
  ) {
    String email = extractEmailFromCookie(request);
    userService.deleteProfilePicture(email);
    return ResponseEntity.ok(Map.of("message", "Profile picture deleted"));
  }

  @GetMapping("/search")
  public List<UserDto> searchUsers(@RequestParam String query) {
    return userService.searchUsers(query);
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
public ResponseEntity<Map<String, Object>> getDashboardCardData(
  HttpServletRequest request
) {
    String email = extractEmailFromCookie(request);
    UserDto user = userService.getUserByEmail(email);

    Map<String, Object> cardData = Map.of(
        "username", user.getUsername(),
        "bio", user.getBio(),
        "profilePicture", user.getProfilePicture(),
        "followersCount", user.getFollowers() != null ? user.getFollowers().size() : 0,
        "followingCount", user.getFollowing() != null ? user.getFollowing().size() : 0,
        "badges", user.getBadges() != null ? user.getBadges() : List.of() // add badges
    );

    return ResponseEntity.ok(cardData);
}


  @GetMapping("/me/full")
  public ResponseEntity<UserDto> getFullCurrentUser(
    HttpServletRequest request
  ) {
    String email = extractEmailFromCookie(request);
    return ResponseEntity.ok(userService.getUserByEmail(email));
  }
}
