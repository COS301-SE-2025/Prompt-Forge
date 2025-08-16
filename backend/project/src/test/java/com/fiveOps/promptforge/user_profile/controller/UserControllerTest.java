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


  // ============== Change Password ======================

  @Test
  void changePassword_ValidCurrentPassword_ShouldReturnSuccess() {
    // Arrange
    setupAuthenticatedRequest();
    String currentPassword = "currentPassword";
    String newPassword = "newPassword";
    Map<String, String> body = Map.of("currentPassword", currentPassword, "newPassword", newPassword);
    when(userService.findByEmail(testEmail)).thenReturn(testUser);
    when(userService.matchesPassword(currentPassword, "encodedPassword")).thenReturn(true);
    when(userService.encodePassword(newPassword)).thenReturn("newEncodedPassword");
    doNothing().when(userService).save(any(User.class));

    // Act
    ResponseEntity<?> response = userController.changePassword(request, body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Password changed successfully", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByEmail(testEmail);
    verify(userService).matchesPassword(currentPassword, "encodedPassword");
    verify(userService).encodePassword(newPassword);
    verify(userService).save(any(User.class));
  }

  @Test
  void changePassword_UserNotFound_ShouldReturnNotFound() {
    // Arrange
    setupAuthenticatedRequest();
    String currentPassword = "currentPassword";
    String newPassword = "newPassword";
    Map<String, String> body = Map.of("currentPassword", currentPassword, "newPassword", newPassword);
    when(userService.findByEmail(testEmail)).thenReturn(null);

    // Act
    ResponseEntity<?> response = userController.changePassword(request, body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("User not found", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByEmail(testEmail);
    verify(userService, never()).matchesPassword(anyString(), anyString());
    verify(userService, never()).encodePassword(anyString());
    verify(userService, never()).save(any(User.class));
  }

  @Test
  void changePassword_InvalidCurrentPassword_ShouldReturnUnauthorized() {
    // Arrange
    setupAuthenticatedRequest();
    String currentPassword = "wrongPassword";
    String newPassword = "newPassword";
    Map<String, String> body = Map.of("currentPassword", currentPassword, "newPassword", newPassword);
    when(userService.findByEmail(testEmail)).thenReturn(testUser);
    when(userService.matchesPassword(currentPassword, "encodedPassword"))
        .thenReturn(false);

    // Act
    ResponseEntity<?> response = userController.changePassword(request, body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Current password incorrect", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByEmail(testEmail);
    verify(userService).matchesPassword(currentPassword, "encodedPassword");
    verify(userService, never()).encodePassword(anyString());
    verify(userService, never()).save(any(User.class));
  }

  
  // ============== Forgot Password ======================

  @Test
  void forgotPassword_UserExists_ShouldReturnSuccess() {
    // Arrange
    String email = "test@example.com";
    Map<String, String> body = Map.of("email", email);
    when(userService.findByEmail(email)).thenReturn(testUser);
    doNothing().when(userService).save(any(User.class));
    doNothing().when(mailService).sendMail(eq(email), anyString(), anyString());

    // Act
    ResponseEntity<?> response = userController.forgotPassword(body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Reset email sent", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByEmail(email);
    verify(userService).save(any(User.class));
    verify(mailService).sendMail(eq(email), anyString(), anyString());
  }

  @Test
  void forgotPassword_UserNotFound_ShouldReturnNotFound() {
    // Arrange
    String email = "nonexistent@example.com";
    Map<String, String> body = Map.of("email", email);
    when(userService.findByEmail(email)).thenReturn(null);

    // Act
    ResponseEntity<?> response = userController.forgotPassword(body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("User not found", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByEmail(email);
    verify(userService, never()).save(any(User.class));
    verify(mailService, never()).sendMail(anyString(), anyString(), anyString());
  }


  // ============== Reset password ======================

  @Test
  void resetPassword_ValidToken_ShouldReturnSuccess() {
    // Arrange
    String token = "valid-token";
    String newPassword = "newpassword";
    Map<String, String> body = Map.of("token", token, "newPassword", newPassword);
    when(userService.findByResetToken(token)).thenReturn(testUser);
    when(userService.encodePassword(newPassword)).thenReturn("encodedPassword");
    doNothing().when(userService).save(any(User.class));

    // Act
    ResponseEntity<?> response = userController.resetPassword(body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Password reset successful", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByResetToken(token);
    verify(userService).encodePassword(newPassword);
    verify(userService).save(any(User.class));
  }

  @Test
  void resetPassword_InvalidToken_ShouldReturnBadRequest() {
    // Arrange
    String token = "invalid-token";
    String newPassword = "newpassword";
    Map<String, String> body = Map.of("token", token, "newPassword", newPassword);
    when(userService.findByResetToken(token)).thenReturn(null);

    // Act
    ResponseEntity<?> response = userController.resetPassword(body);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Invalid token", ((Map<?, ?>) response.getBody()).get("message"));
    verify(userService).findByResetToken(token);
    verify(userService, never()).encodePassword(anyString());
    verify(userService, never()).save(any(User.class));
  }


  // ============== Get dashboard card data ======================

  @Test
  void getDashboardCardData_ShouldReturnCardData() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.getUserByEmail(testEmail)).thenReturn(testUserDto);

    // Act
    ResponseEntity<Map<String, Object>> response = userController.getDashboardCardData(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());

    Map<String, Object> cardData = response.getBody();
    assertEquals("testuser", cardData.get("username"));
    assertEquals("Test bio", cardData.get("bio"));
    assertEquals("https://example.com/picture.jpg", cardData.get("profilePicture"));
    assertEquals(1, cardData.get("followersCount"));
    assertEquals(1, cardData.get("followingCount"));
    assertEquals(1, ((List<?>) cardData.get("badges")).size());

    verify(userService).getUserByEmail(testEmail);
  }

  @Test
  void getDashboardCardData_UserNotFound_ShouldReturnNotFound() {
    // Arrange
    setupAuthenticatedRequest();
    when(userService.getUserByEmail(testEmail)).thenReturn(null);

    // Act
    ResponseEntity<Map<String, Object>> response = userController.getDashboardCardData(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("User not found", response.getBody().get("error"));
  }

  @Test
  void getDashboardCardData_NullFields_ShouldHandleGracefully() {
    // Arrange
    setupAuthenticatedRequest();
    UserDto userWithNulls = new UserDto();
    userWithNulls.setUserId(testUserId);
    when(userService.getUserByEmail(testEmail)).thenReturn(userWithNulls);

    // Act
    ResponseEntity<Map<String, Object>> response = userController.getDashboardCardData(request);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());

    Map<String, Object> cardData = response.getBody();
    assertEquals("", cardData.get("username"));
    assertEquals("", cardData.get("bio"));
    assertEquals("", cardData.get("profilePicture"));
    assertEquals(0, cardData.get("followersCount"));
    assertEquals(0, cardData.get("followingCount"));
    assertEquals(0, ((List<?>) cardData.get("badges")).size());
  }

  
  // ============== Get followers ======================

  @Test
  void getFollowers_ShouldReturnFollowersList() {
    // Arrange
    setupAuthenticatedRequest();
    List<UserDto> followers = Arrays.asList(testUserDto);
    when(userService.getFollowersByEmail(testEmail)).thenReturn(followers);

    // Act
    List<UserDto> result = userController.getFollowers(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(testUserId, result.get(0).getUserId());
    verify(userService).getFollowersByEmail(testEmail);
  }

  
  // ============== Get following ======================

  @Test
  void getFollowing_ShouldReturnFollowingList() {
    // Arrange
    setupAuthenticatedRequest();
    List<UserDto> following = Arrays.asList(testUserDto);
    when(userService.getFollowingByEmail(testEmail)).thenReturn(following);

    // Act
    List<UserDto> result = userController.getFollowing(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(testUserId, result.get(0).getUserId());
    verify(userService).getFollowingByEmail(testEmail);
  }
  
  
}
