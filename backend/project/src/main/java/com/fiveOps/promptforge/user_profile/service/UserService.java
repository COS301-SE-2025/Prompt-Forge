package com.fiveOps.promptforge.user_profile.service;

import com.fiveOps.promptforge.S3Bucket.service.S3Service;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

  @Autowired
  private S3Service s3Service;

  @Autowired
  private UserRepository userRepository;

  private final PasswordEncoder passwordEncoder;
  private static final List<String> ALLOWED_MIME_TYPES = List.of(
    "image/jpeg",
    "image/png",
    "image/gif"
  );
  private static final List<String> ALLOWED_EXTENSIONS = List.of(
    ".jpg",
    ".jpeg",
    ".png",
    ".gif"
  );

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
    if (
      dto.getEmail() != null &&
      !dto.getEmail().isBlank() &&
      !dto.getEmail().equals(user.getEmail())
    ) {
      if (userRepository.existsByEmail(dto.getEmail())) {
        throw new RuntimeException("Email is already in use");
      }
      user.setEmail(dto.getEmail());
    }

    if (
      dto.getUsername() != null &&
      !dto.getUsername().isBlank() &&
      !dto.getUsername().equals(user.getUsername())
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
    dto.setUserId(user.getUserId());
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setProfilePicture(user.getProfilePictureUrl());
    dto.setBio(user.getBio());
    dto.setRole(user.getRole());
    dto.setVerified(Boolean.TRUE.equals(user.getIsVerified()));
    dto.setActive(Boolean.TRUE.equals(user.getIsActive()));
    dto.setCreatedAt(user.getCreatedAt());
    dto.setUpdatedAt(user.getUpdatedAt());

    dto.setBadges(
      user.getBadges() != null ? Arrays.asList(user.getBadges()) : List.of()
    );
    dto.setFollowers(
      user.getFollowers() != null
        ? Arrays.asList(user.getFollowers())
        : List.of()
    );
    dto.setFollowing(
      user.getFollowing() != null
        ? Arrays.asList(user.getFollowing())
        : List.of()
    );

    return dto;
  }

  public UUID getUserIdByEmail(String email) {
    return userRepository
      .findByEmail(email)
      .map(User::getUserId)
      .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public String saveProfilePicture(String email, MultipartFile file) {
    validateImageFile(file);
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));

    try {
      String imageUrl = s3Service.uploadFile(file);
      if (user.getProfilePictureUrl() != null) {
        s3Service.deleteFile(user.getProfilePictureUrl());
      }
      user.setProfilePictureUrl(imageUrl);
      userRepository.save(user);
      return imageUrl;
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload image", e);
    }
  }

  public void deleteProfilePicture(String email) {
    User user = userRepository
      .findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));
    if (user.getProfilePictureUrl() != null) {
      s3Service.deleteFile(user.getProfilePictureUrl());
      user.setProfilePictureUrl(null);
      userRepository.save(user);
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
      : List.of();
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

  private void validateImageFile(MultipartFile file) {
    String contentType = file.getContentType();
    String filename = file.getOriginalFilename();

    if (file.isEmpty()) {
      throw new RuntimeException("File is empty");
    }

    if (
      contentType == null ||
      !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())
    ) {
      throw new RuntimeException("Unsupported file type: " + contentType);
    }

    if (
      filename == null ||
      ALLOWED_EXTENSIONS.stream().noneMatch(filename.toLowerCase()::endsWith)
    ) {
      throw new RuntimeException("Invalid file extension");
    }

    if (file.getSize() > 5 * 1024 * 1024) {
      throw new RuntimeException("File size exceeds 5MB limit");
    }
  }

  public User findByEmail(String email) {
    return userRepository.findByEmail(email).orElse(null);
  }

  public User findByResetToken(String token) {
    return userRepository.findByResetToken(token).orElse(null);
  }

  public void save(User user) {
    userRepository.save(user);
  }

  public String encodePassword(String raw) {
    return passwordEncoder.encode(raw);
  }

  public boolean matchesPassword(String raw, String encoded) {
    return passwordEncoder.matches(raw, encoded);
  }

  public List<UserDto> getAllUsersExceptCurrent(String currentUserEmail) {
    return userRepository
      .findAllByEmailNot(currentUserEmail)
      .stream()
      .sorted((user1, user2) -> {
        // Calculate completeness score for each user
        int score1 = calculateCompletenessScore(user1);
        int score2 = calculateCompletenessScore(user2);
        // Sort in descending order (most complete first)
        return Integer.compare(score2, score1);
      })
      .map(this::convertToDto)
      .collect(Collectors.toList());
  }

  private int calculateCompletenessScore(User user) {
    int score = 0;

    // Basic profile fields
    if (user.getUsername() != null && !user.getUsername().isEmpty()) score +=
      10;
    if (user.getBio() != null && !user.getBio().isEmpty()) score += 10;
    if (
      user.getProfilePictureUrl() != null &&
      !user.getProfilePictureUrl().isEmpty()
    ) score += 10;

    // Social connections
    if (user.getFollowers() != null && user.getFollowers().length > 0) score +=
      5;
    if (user.getFollowing() != null && user.getFollowing().length > 0) score +=
      5;

    // Additional profile data
    if (user.getBadges() != null && user.getBadges().length > 0) score += 5;

    return score;
  }

  public List<UserDto> fuzzySearchUsers(String query) {
    // Get all users from repository
    List<User> allUsers = userRepository.findAll();

    // Split query into individual search terms
    String[] searchTerms = query.toLowerCase().split("\\s+");

    return allUsers
      .stream()
      .map(this::convertToDto)
      .filter(user -> matchesSearchTerms(user, searchTerms))
      .sorted(
        Comparator.comparingInt(user ->
          -calculateRelevanceScore(user, searchTerms)
        )
      )
      .collect(Collectors.toList());
  }

  private boolean matchesSearchTerms(UserDto user, String[] terms) {
    String username =
      (user.getUsername() != null ? user.getUsername() : "").toLowerCase();
    String bio = (user.getBio() != null ? user.getBio() : "").toLowerCase();

    return Arrays
      .stream(terms)
      .allMatch(term -> username.contains(term) || bio.contains(term));
  }

  private int calculateRelevanceScore(UserDto user, String[] terms) {
    String username =
      (user.getUsername() != null ? user.getUsername() : "").toLowerCase();
    int score = 0;

    for (String term : terms) {
      if (username.startsWith(term)) {
        score += 3; // Highest score for start of username matches
      } else if (username.contains(term)) {
        score += 2; // Regular username matches
      }

      if (user.getBio() != null && user.getBio().toLowerCase().contains(term)) {
        score += 1; // Bio matches
      }
    }

    if (
      user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()
    ) {
      score += 1; // Profile picture bonus
    }

    return score;
  }

  private UserDto convertToDto(User user) {
    UserDto dto = new UserDto();
    dto.setUserId(user.getUserId());
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setProfilePicture(user.getProfilePictureUrl());
    dto.setBio(user.getBio());
    dto.setRole(user.getRole());
    dto.setVerified(Boolean.TRUE.equals(user.getIsVerified()));
    dto.setActive(Boolean.TRUE.equals(user.getIsActive()));
    dto.setCreatedAt(user.getCreatedAt());
    dto.setUpdatedAt(user.getUpdatedAt());

    dto.setBadges(
      user.getBadges() != null ? Arrays.asList(user.getBadges()) : List.of()
    );
    dto.setFollowers(
      user.getFollowers() != null
        ? Arrays.asList(user.getFollowers())
        : List.of()
    );
    dto.setFollowing(
      user.getFollowing() != null
        ? Arrays.asList(user.getFollowing())
        : List.of()
    );

    return dto;
  }
}
