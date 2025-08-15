package com.fiveOps.promptforge.user.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.fiveOps.promptforge.S3Bucket.service.S3Service;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import com.fiveOps.promptforge.user_profile.service.UserService;

class UserServiceTest {

  private UserRepository userRepository;
  private PasswordEncoder passwordEncoder;
  private UserService userService;
  private S3Service s3Service;

  @BeforeEach
  void setup() {
    userRepository = mock(UserRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    s3Service = mock(S3Service.class);
    userService = new UserService(userRepository, passwordEncoder);

    // Use ReflectionTestUtils to set the autowired field
    ReflectionTestUtils.setField(userService, "s3Service", s3Service);
  }

  // deleteProfilePicture tests
  @Test
  void deleteProfilePicture_success() {
    String email = "test@example.com";
    User user = new User();
    user.setProfilePictureUrl("picture-url");

    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    userService.deleteProfilePicture(email);

    assertNull(user.getProfilePictureUrl());
    verify(s3Service).deleteFile("picture-url");
    verify(userRepository).save(user);
  }

  // deleteUser tests
  @Test
  void deleteUser_userExists_shouldDelete() {
    UUID userId = UUID.randomUUID();
    when(userRepository.existsById(userId)).thenReturn(true);

    userService.deleteUser(userId);

    verify(userRepository).deleteById(userId);
  }

  @Test
  void deleteUser_userNotFound_shouldThrowException() {
    UUID userId = UUID.randomUUID();
    when(userRepository.existsById(userId)).thenReturn(false);

    assertThrows(RuntimeException.class, () -> userService.deleteUser(userId));
  }

  // getUserById tests
  @Test
  void testGetUserById_success() {
    UUID id = UUID.randomUUID();
    User mockUser = new User();
    mockUser.setUserId(id);
    mockUser.setUsername("john");
    mockUser.setEmail("john@example.com");

    when(userRepository.findById(id)).thenReturn(Optional.of(mockUser));

    UserDto dto = userService.getUserById(id);

    assertEquals("john", dto.getUsername());
    assertEquals("john@example.com", dto.getEmail());
  }

  @Test
  void testGetUserById_userNotFound() {
    UUID id = UUID.randomUUID();
    when(userRepository.findById(id)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> userService.getUserById(id));
  }

  @Test
  void testGetUserById_shouldMapAllFields() {
    UUID id = UUID.randomUUID();
    User user = new User();
    user.setUserId(id);
    user.setUsername("testUser");
    user.setEmail("test@example.com");
    user.setProfilePictureUrl("http://example.com/pic.jpg");
    user.setBio("Test bio");
    user.setRole("USER");
    user.setIsVerified(true);
    user.setIsActive(true);
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    user.setBadges(new UUID[] { UUID.randomUUID() });
    user.setFollowers(new UUID[] { UUID.randomUUID() });
    user.setFollowing(new UUID[] { UUID.randomUUID() });

    when(userRepository.findById(id)).thenReturn(Optional.of(user));

    UserDto dto = userService.getUserById(id);

    assertEquals(user.getUserId(), dto.getUserId());
    assertEquals(user.getUsername(), dto.getUsername());
    assertEquals(user.getEmail(), dto.getEmail());
    assertEquals(user.getProfilePictureUrl(), dto.getProfilePicture());
    assertEquals(user.getBio(), dto.getBio());
    assertEquals(user.getRole(), dto.getRole());
    assertTrue(dto.isVerified());
    assertTrue(dto.isActive());
    assertEquals(1, dto.getBadges().size());
    assertEquals(1, dto.getFollowers().size());
    assertEquals(1, dto.getFollowing().size());
  }

  @Test
  void testGetUserById_withNullArrays() {
    UUID id = UUID.randomUUID();
    User user = new User();
    user.setUserId(id);
    user.setUsername("testUser");
    user.setEmail("test@example.com");
    user.setBadges(null);
    user.setFollowers(null);
    user.setFollowing(null);

    when(userRepository.findById(id)).thenReturn(Optional.of(user));

    UserDto dto = userService.getUserById(id);

    assertEquals(0, dto.getBadges().size());
    assertEquals(0, dto.getFollowers().size());
    assertEquals(0, dto.getFollowing().size());
  }

  // saveProfilePicture tests
  @Test
  void saveProfilePicture_success() throws IOException {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "image.jpg",
        "test-image.jpg",
        "image/jpeg",
        "test data".getBytes());

    User user = new User();
    user.setEmail(email);
    String oldPictureUrl = "old-picture-url";
    user.setProfilePictureUrl(oldPictureUrl);

    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
    when(s3Service.uploadFile(file)).thenReturn("new-picture-url");

    String result = userService.saveProfilePicture(email, file);

    assertEquals("new-picture-url", result);
    verify(s3Service).deleteFile(oldPictureUrl);
    verify(userRepository).save(user);
  }

  @Test
  void saveProfilePicture_shouldValidateAndSaveImage() throws IOException {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "image.jpg",
        "test-image.jpg",
        "image/jpeg",
        "test data".getBytes());

    User user = new User();
    user.setEmail(email);

    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
    when(s3Service.uploadFile(file)).thenReturn("new-url");

    String result = userService.saveProfilePicture(email, file);

    assertEquals("new-url", result);
    verify(userRepository).save(user);
  }

  @Test
  void saveProfilePicture_shouldThrowExceptionForInvalidImage() throws IOException {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "file.txt",
        "test.txt",
        "text/plain",
        "test data".getBytes());

    User user = new User();
    user.setEmail(email);

    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    assertThrows(RuntimeException.class, () -> userService.saveProfilePicture(email, file));
    verify(s3Service, never()).uploadFile(any());
  }

  @Test
  void saveProfilePicture_withEmptyFile() {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "image.jpg",
        "image.jpg",
        "image/jpeg",
        new byte[0]);

    User user = new User();
    user.setEmail(email);
    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    assertThrows(RuntimeException.class, () -> userService.saveProfilePicture(email, file));
  }

  @Test
  void saveProfilePicture_withNullContentType() {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "image.jpg",
        "image.jpg",
        null,
        "test data".getBytes());

    User user = new User();
    user.setEmail(email);
    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    assertThrows(RuntimeException.class, () -> userService.saveProfilePicture(email, file));
  }

  @Test
  void saveProfilePicture_withNullFilename() {
    String email = "test@example.com";
    MockMultipartFile file = new MockMultipartFile(
        "image",
        null,
        "image/jpeg",
        "test data".getBytes());

    User user = new User();
    user.setEmail(email);
    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    assertThrows(RuntimeException.class, () -> userService.saveProfilePicture(email, file));
  }

  @Test
  void saveProfilePicture_withOversizedFile() {
    String email = "test@example.com";
    byte[] oversizedContent = new byte[6 * 1024 * 1024]; // 6MB
    MockMultipartFile file = new MockMultipartFile(
        "image.jpg",
        "image.jpg",
        "image/jpeg",
        oversizedContent);

    User user = new User();
    user.setEmail(email);
    when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

    assertThrows(RuntimeException.class, () -> userService.saveProfilePicture(email, file));
  }

  // updateUser tests
  @Test
  void testUpdateUser_success() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);
    existingUser.setUsername("oldName");
    existingUser.setEmail("old@example.com");
    existingUser.setPasswordHash("oldHash");

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setUsername("newName");
    dto.setEmail("new@example.com");
    dto.setPassword("newPassword");

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
    when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    UserDto result = userService.updateUser(id, dto);

    assertEquals("newName", result.getUsername());
    assertEquals("new@example.com", result.getEmail());
    verify(userRepository).save(any(User.class));
  }

  @Test
  void testUpdateUser_userNotFound() {
    UUID id = UUID.randomUUID();
    UpdateProfileDto dto = new UpdateProfileDto();

    when(userRepository.findById(id)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> userService.updateUser(id, dto));
  }

  @Test
  void testUpdateUser_shouldUpdateAllFields() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);
    existingUser.setEmail("old@example.com");
    existingUser.setUsername("oldUsername");

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setEmail("new@example.com");
    dto.setUsername("newUsername");
    dto.setBio("new bio");
    dto.setPassword("newPassword");

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
    when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
    when(userRepository.existsByUsername("newUsername")).thenReturn(false);
    when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

    UserDto result = userService.updateUser(id, dto);

    assertEquals("new@example.com", result.getEmail());
    assertEquals("newUsername", result.getUsername());
    assertEquals("new bio", result.getBio());
  }

  @Test
  void testUpdateUser_shouldRejectDuplicateEmail() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);
    existingUser.setEmail("old@example.com");

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setEmail("taken@example.com");

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
    when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

    assertThrows(RuntimeException.class, () -> userService.updateUser(id, dto));
  }

  @Test
  void testUpdateUser_withEmptyFields() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);
    existingUser.setEmail("old@example.com");
    existingUser.setUsername("oldUsername");

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setEmail("");
    dto.setUsername("");
    dto.setBio("");
    dto.setPassword("");

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
    when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

    UserDto result = userService.updateUser(id, dto);

    assertEquals("old@example.com", result.getEmail());
    assertEquals("oldUsername", result.getUsername());
  }

  @Test
  void testUpdateUser_withShortPassword() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setPassword("12345"); // Less than 6 characters

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));

    assertThrows(RuntimeException.class, () -> userService.updateUser(id, dto));
  }

  @Test
  void testUpdateUser_withDuplicateUsername() {
    UUID id = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setUserId(id);
    existingUser.setUsername("oldUsername");

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setUsername("takenUsername");

    when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
    when(userRepository.existsByUsername("takenUsername")).thenReturn(true);

    assertThrows(RuntimeException.class, () -> userService.updateUser(id, dto));
  }
}
