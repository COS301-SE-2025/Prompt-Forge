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
}
