package com.fiveOps.promptforge.user_profile.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;
import com.fiveOps.promptforge.util.service.MailService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

  @Mock private UserService userService;
  @Mock private JwtUtil jwtUtil;
  @Mock private MailService mailService;
  @Mock private HttpServletRequest request;

  @InjectMocks private UserController userController;

  private UUID testUserId;
  private String testEmail;
  private String testToken;
  private UserDto testUserDto;
  private UpdateProfileDto testUpdateDto;
  private User testUser;

  @BeforeEach
  void setUp() {
    testUserId = UUID.randomUUID();
    testEmail = "test@example.com";
    testToken = "test-jwt-token";

    testUserDto = new UserDto();
    testUserDto.setUserId(testUserId);
    testUserDto.setUsername("testuser");
    testUserDto.setEmail(testEmail);
    testUserDto.setBio("Test bio");
    testUserDto.setProfilePicture("https://example.com/picture.jpg");
    testUserDto.setRole("USER");
    testUserDto.setVerified(true);
    testUserDto.setActive(true);
    testUserDto.setCreatedAt(LocalDateTime.now());
    testUserDto.setUpdatedAt(LocalDateTime.now());
    testUserDto.setBadges(Arrays.asList(UUID.randomUUID()));
    testUserDto.setFollowers(Arrays.asList(UUID.randomUUID()));
    testUserDto.setFollowing(Arrays.asList(UUID.randomUUID()));

    testUpdateDto = new UpdateProfileDto();
    testUpdateDto.setUsername("newusername");
    testUpdateDto.setEmail("newemail@example.com");
    testUpdateDto.setBio("New bio");
    testUpdateDto.setPassword("newpassword");

    testUser = new User();
    testUser.setUserId(testUserId);
    testUser.setEmail(testEmail);
    testUser.setPasswordHash("encodedPassword");
  }

  // ============== Get all Users ======================

  @Test
  void getAllUsers_ShouldReturnUserList() {
    // Arrange
    List<UserDto> users = Arrays.asList(testUserDto);
    when(userService.getAllUsers()).thenReturn(users);

    // Act
    List<UserDto> result = userController.getAllUsers();

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(testUserId, result.get(0).getUserId());
    verify(userService).getAllUsers();
  }


  // ============== Get User ======================

  @Test
  void getUser_ShouldReturnUserDto() {
    // Arrange
    when(userService.getUserById(testUserId)).thenReturn(testUserDto);

    // Act
    UserDto result = userController.getUser(testUserId);

    // Assert
    assertNotNull(result);
    assertEquals(testUserId, result.getUserId());
    assertEquals(testEmail, result.getEmail());
    verify(userService).getUserById(testUserId);
  }


  // ============== Search users ======================

  @Test
  void searchUsers_ShouldReturnUserList() {
    // Arrange
    String query = "test";
    List<UserDto> users = Arrays.asList(testUserDto);
    when(userService.searchUsers(query)).thenReturn(users);

    // Act
    List<UserDto> result = userController.searchUsers(query);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(testUserId, result.get(0).getUserId());
    verify(userService).searchUsers(query);
  }


  
}
