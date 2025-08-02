package com.fiveOps.promptforge.user_profile.service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fiveOps.promptforge.S3Bucket.service.S3Service;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
public class UserService {

  @Autowired private S3Service s3Service;

  @Autowired private UserRepository userRepository;

  private final Path uploadDir = Paths.get("uploads/profile-pictures");
  private final PasswordEncoder passwordEncoder;
  private static final List<String> ALLOWED_MIME_TYPES =
      List.of("image/jpeg", "image/png", "image/gif");
  private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".gif");

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserDto getUserById(UUID id) {
    User user =
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }

  public UserDto getUserByEmail(String email) {
    User user =
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }

  @Transactional
  public UserDto updateUser(UUID id, UpdateProfileDto dto) {
    User user =
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    return updateUserFields(user, dto);
  }

  @Transactional
  public UserDto updateUserByEmail(String email, UpdateProfileDto dto) {
    User user =
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    return updateUserFields(user, dto);
  }

  private UserDto updateUserFields(User user, UpdateProfileDto dto) {
    // Email update (with uniqueness check)
    if (dto.getEmail() != null
        && !dto.getEmail().isBlank()
        && !dto.getEmail().equals(user.getEmail())) {
      if (userRepository.existsByEmail(dto.getEmail())) {
        throw new RuntimeException("Email is already in use");
      }
      user.setEmail(dto.getEmail());
    }

    // Username update (with uniqueness check)
    if (dto.getUsername() != null
        && !dto.getUsername().isBlank()
        && !dto.getUsername().equals(user.getUsername())) {
      if (userRepository.existsByUsername(dto.getUsername())) {
        throw new RuntimeException("Username is already taken");
      }
      user.setUsername(dto.getUsername());
    }

    // Bio update
    if (dto.getBio() != null) {
      user.setBio(dto.getBio());
    }

    // Password update (only if new password is valid)
    if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
      if (dto.getPassword().length() < 6) {
        throw new RuntimeException("Password must be at least 6 characters");
      }
      user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    }

    // Profile picture update (URL only, not file upload)
    if (dto.getProfilePicture() != null) {
      user.setProfilePictureUrl(dto.getProfilePicture());
    }

    // Update timestamp
    user.setUpdatedAt(LocalDateTime.now());

    User updatedUser = userRepository.save(user);
    return mapToDto(updatedUser);
  }

  public List<UserDto> getAllUsers() {
    return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
  }

  public void deleteUser(UUID id) {
    if (!userRepository.existsById(id)) {
      throw new RuntimeException("User not found");
    }
    userRepository.deleteById(id);
  }

  private UserDto mapToDto(User user) {
    UserDto dto = new UserDto();
    dto.setUserId(user.getUserId());
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setProfilePicture(user.getProfilePictureUrl()); // ✅ Fixed
    dto.setBio(user.getBio());
    dto.setRole(user.getRole());
    dto.setVerified(Boolean.TRUE.equals(user.getIsVerified()));
    dto.setActive(Boolean.TRUE.equals(user.getIsActive()));
    dto.setCreatedAt(user.getCreatedAt());
    dto.setUpdatedAt(user.getUpdatedAt());

    dto.setBadges(user.getBadges() != null ? Arrays.asList(user.getBadges()) : List.of());
    dto.setFollowers(user.getFollowers() != null ? Arrays.asList(user.getFollowers()) : List.of());
    dto.setFollowing(user.getFollowing() != null ? Arrays.asList(user.getFollowing()) : List.of());

    return dto;
  }

  public UUID getUserIdByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .map(User::getUserId)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public String saveProfilePicture(String email, MultipartFile file) {
    User user =
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

    // Optional: delete old picture first
    if (user.getProfilePictureUrl() != null) {
      s3Service.deleteFile(user.getProfilePictureUrl());
    }

    try {
      String imageUrl = s3Service.uploadFile(file);
      user.setProfilePictureUrl(imageUrl);
      userRepository.save(user);
      return imageUrl;
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload image", e);
    }
  }

  public void deleteProfilePicture(String email) {
    User user =
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getProfilePictureUrl() != null) {
      s3Service.deleteFile(user.getProfilePictureUrl());
      user.setProfilePictureUrl(null);
      userRepository.save(user);
    }
  }

  public List<UserDto> searchUsers(String query) {
    List<User> matchedUsers =
        userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    return matchedUsers.stream().map(this::mapToDto).collect(Collectors.toList());
  }

  public List<UserDto> getFollowersByEmail(String email) {
    User user = getUserEntityByEmail(email);
    List<UUID> followerIds =
        user.getFollowers() != null
            ? Arrays.asList(user.getFollowers())
            : List.of(); // handle nulls safely

    List<User> followers = userRepository.findAllById(followerIds);
    return followers.stream().map(this::mapToDto).toList();
  }

  private User getUserEntityByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public List<UserDto> getFollowingByEmail(String email) {
    User user = getUserEntityByEmail(email);
    List<UUID> followingIds =
        user.getFollowing() != null ? Arrays.asList(user.getFollowing()) : List.of();

    List<User> following = userRepository.findAllById(followingIds);
    return following.stream().map(this::mapToDto).toList();
  }

  public UserDto getUserByUsername(String username) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }

  private void validateImageFile(MultipartFile file) {
    String contentType = file.getContentType();
    String filename = file.getOriginalFilename();

    if (file.isEmpty()) {
      throw new RuntimeException("File is empty");
    }

    // Check MIME type
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
      throw new RuntimeException("Unsupported file type: " + contentType);
    }

    // Check file extension
    if (filename == null
        || ALLOWED_EXTENSIONS.stream().noneMatch(filename.toLowerCase()::endsWith)) {
      throw new RuntimeException("Invalid file extension");
    }

    // Optionally: max size (e.g., 5MB)
    if (file.getSize() > 5 * 1024 * 1024) {
      throw new RuntimeException("File size exceeds 5MB limit");
    }
  }

  public User findByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElse(null); // Return null if not found, let controller handle it
  }
}
