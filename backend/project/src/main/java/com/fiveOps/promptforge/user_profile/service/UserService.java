package com.fiveOps.promptforge.user_profile.service;

import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
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
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  private final Path uploadDir = Paths.get("uploads/profile-pictures");
  private final PasswordEncoder passwordEncoder;

  public UserService(
    UserRepository userRepository,
    PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserDto getUserById(UUID id) {
    User user = userRepository
      .findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }

  public UserDto getUserByEmail(String email) {
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }

  @Transactional
  public UserDto updateUser(UUID id, UpdateProfileDto dto) {
    User user = userRepository
      .findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return updateUserFields(user, dto);
  }

  @Transactional
  public UserDto updateUserByEmail(String email, UpdateProfileDto dto) {
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return updateUserFields(user, dto);
  }

  private UserDto updateUserFields(User user, UpdateProfileDto dto) {
    if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
      if (userRepository.existsByEmail(dto.getEmail())) {
        throw new RuntimeException("Email is already in use");
      }
      user.setEmail(dto.getEmail());
    }

    if (
      dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())
    ) {
      if (userRepository.existsByUsername(dto.getUsername())) {
        throw new RuntimeException("Username is already taken");
      }
      user.setUsername(dto.getUsername());
    }

    if (dto.getBio() != null) {
      user.setBio(dto.getBio());
    }

    if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
      if (dto.getPassword().length() < 6) {
        throw new RuntimeException("Password must be at least 6 characters");
      }
      user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
    }

    if (dto.getProfilePicture() != null) {
      user.setProfilePictureUrl(dto.getProfilePicture());
    }

    user.setUpdatedAt(LocalDateTime.now());
    User updatedUser = userRepository.save(user);
    return mapToDto(updatedUser);
  }

  public List<UserDto> getAllUsers() {
    return userRepository
      .findAll()
      .stream()
      .map(this::mapToDto)
      .collect(Collectors.toList());
  }

  public void deleteUser(UUID id) {
    if (!userRepository.existsById(id)) {
      throw new RuntimeException("User not found");
    }
    userRepository.deleteById(id);
  }

  private UserDto mapToDto(User user) {
    UserDto dto = new UserDto();
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setProfilePicture(user.getProfilePictureUrl());
    dto.setBio(user.getBio());
    return dto;
  }

  public UUID getUserIdByEmail(String email) {
    return userRepository
      .findByEmail(email)
      .map(User::getUserId)
      .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public String saveProfilePicture(String email, MultipartFile file) {
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));

    if (file.isEmpty()) {
      throw new RuntimeException("Empty file");
    }

    try {
      // You can generate a unique filename, e.g. userId + timestamp + original filename
      String filename =
        user.getUserId().toString() +
        "_" +
        System.currentTimeMillis() +
        "_" +
        file.getOriginalFilename();
      Path filePath = uploadDir.resolve(filename);
      Files.write(filePath, file.getBytes());

      // Save the URL or relative path in the user profile
      // For simplicity, just use the filename (adjust as needed for your front-end)
      user.setProfilePictureUrl("/uploads/profile-pictures/" + filename);
      user.setUpdatedAt(LocalDateTime.now());
      userRepository.save(user);

      return user.getProfilePictureUrl();
    } catch (IOException e) {
      throw new RuntimeException("Failed to save profile picture", e);
    }
  }

  public void deleteProfilePicture(String email) {
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));

    String pictureUrl = user.getProfilePictureUrl();
    if (pictureUrl == null || pictureUrl.isBlank()) {
      throw new RuntimeException("No profile picture to delete");
    }

    try {
      // Assuming pictureUrl is something like "/uploads/profile-pictures/filename.jpg"
      String filename = Paths.get(pictureUrl).getFileName().toString();
      Path filePath = uploadDir.resolve(filename);

      Files.deleteIfExists(filePath);

      user.setProfilePictureUrl(null);
      user.setUpdatedAt(LocalDateTime.now());
      userRepository.save(user);
    } catch (IOException e) {
      throw new RuntimeException("Failed to delete profile picture", e);
    }
  }

  public List<UserDto> searchUsers(String query) {
    List<User> matchedUsers = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      query,
      query
    );
    return matchedUsers
      .stream()
      .map(this::mapToDto)
      .collect(Collectors.toList());
  }

  public List<UserDto> getFollowersByEmail(String email) {
    User user = getUserEntityByEmail(email);
    List<UUID> followerIds = user.getFollowers() != null
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
    List<UUID> followingIds = user.getFollowing() != null
      ? Arrays.asList(user.getFollowing())
      : List.of();

    List<User> following = userRepository.findAllById(followingIds);
    return following.stream().map(this::mapToDto).toList();
  }

  public UserDto getUserByUsername(String username) {
    User user = userRepository
      .findByUsername(username)
      .orElseThrow(() -> new RuntimeException("User not found"));
    return mapToDto(user);
  }
}
