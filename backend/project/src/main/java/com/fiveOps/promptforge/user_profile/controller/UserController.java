package com.fiveOps.promptforge.user_profile.controller;
import java.util.Map;

import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
