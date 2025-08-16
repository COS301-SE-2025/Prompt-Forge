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

  // Helper method to setup authenticated request
  private void setupAuthenticatedRequest() {
    Cookie[] cookies = new Cookie[1];
    cookies[0] = new Cookie("token", testToken);
    when(request.getCookies()).thenReturn(cookies);
    when(jwtUtil.extractUsername(testToken)).thenReturn(testEmail);
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


  // ============== Update User ======================

  @Test
  void updateUser_ShouldReturnUpdatedUserDto() {
    // Arrange
    when(userService.updateUser(testUserId, testUpdateDto)).thenReturn(testUserDto);

    // Act
    UserDto result = userController.updateUser(testUserId, testUpdateDto);

    // Assert
    assertNotNull(result);
    assertEquals(testUserId, result.getUserId());
    verify(userService).updateUser(testUserId, testUpdateDto);
  }

  // ============== Delete User ======================

  @Test
  void deleteUser_ShouldCallService() {
    // Arrange
    doNothing().when(userService).deleteUser(testUserId);

    // Act
    userController.deleteUser(testUserId);

    // Assert
    verify(userService).deleteUser(testUserId);
  }


  // ============== Get current user ======================

  @Test
  void getCurrentUser_ShouldReturnUserDto() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.getUserByEmail(testEmail)).thenReturn(testUserDto);

    // Act
    ResponseEntity<UserDto> response = userController.getCurrentUser(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(testUserId, response.getBody().getUserId());
    verify(userService).getUserByEmail(testEmail);
  }

  @Test
  void getCurrentUser_NoTokenCookie_ShouldThrowException() {
    // Arrange
    Cookie[] cookies = new Cookie[1];
    cookies[0] = new Cookie("other", "value");
    when(request.getCookies()).thenReturn(cookies);

    // Act & Assert
    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> userController.getCurrentUser(request));
    assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    assertEquals("Authentication token not found", exception.getReason());
  }


  // ============== Get full current user ======================

  @Test
  void getFullCurrentUser_ShouldReturnUserDto() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.getUserByEmail(testEmail)).thenReturn(testUserDto);

    // Act
    ResponseEntity<UserDto> response = userController.getFullCurrentUser(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(testUserId, response.getBody().getUserId());
    verify(userService).getUserByEmail(testEmail);
  }


  // ============== Get current user ID ======================

  @Test
  void getCurrentUserId_ShouldReturnUserId() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.getUserIdByEmail(testEmail)).thenReturn(testUserId);

    // Act
    Map<String, UUID> result = userController.getCurrentUserId(request);

    // Assert
    assertNotNull(result);
    assertEquals(testUserId, result.get("userId"));
    verify(userService).getUserIdByEmail(testEmail);
  }


  // ============== Update current user ======================

  @Test
  void updateCurrentUser_ShouldReturnUpdatedUserDto() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.updateUserByEmail(testEmail, testUpdateDto)).thenReturn(testUserDto);

    // Act
    UserDto result = userController.updateCurrentUser(request, testUpdateDto);

    // Assert
    assertNotNull(result);
    assertEquals(testUserId, result.getUserId());
    verify(userService).updateUserByEmail(testEmail, testUpdateDto);
  }

  
  // ============== Upload profile picture ======================

  @Test
  void uploadProfilePicture_ShouldReturnSuccessResponse() {
    // Arrange
    setupAuthenticatedRequest();
    MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".getBytes());
    String imageUrl = "https://example.com/uploaded-image.jpg";
    when(userService.saveProfilePicture(testEmail, file)).thenReturn(imageUrl);

    // Act
    ResponseEntity<Map<String, String>> response = userController.uploadProfilePicture(file, request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(imageUrl, response.getBody().get("url"));
    assertEquals("Profile picture uploaded successfully", response.getBody().get("message"));
    verify(userService).saveProfilePicture(testEmail, file);
  }

  @Test
  void uploadProfilePicture_ServiceException_ShouldThrowException() {
    // Arrange
    setupAuthenticatedRequest();
    MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".getBytes());
    when(userService.saveProfilePicture(testEmail, file))
        .thenThrow(new RuntimeException("Upload failed"));

    // Act & Assert
    ResponseStatusException exception = assertThrows(
        ResponseStatusException.class,
        () -> userController.uploadProfilePicture(file, request));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    assertEquals("Failed to upload profile picture", exception.getReason());
  }


  // ============== Delete Profile Picture ======================

  @Test
  void deleteProfilePicture_ShouldReturnSuccessResponse() {
    // Arrange
    setupAuthenticatedRequest();
    doNothing().when(userService).deleteProfilePicture(testEmail);

    // Act
    ResponseEntity<Map<String, String>> response = userController.deleteProfilePicture(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Profile picture deleted", response.getBody().get("message"));
    verify(userService).deleteProfilePicture(testEmail);
  }
}
