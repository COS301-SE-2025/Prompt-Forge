package com.fiveOps.promptforge.authentication.service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
public class AuthService {

  private static final org.slf4j.Logger LOGGER =
      org.slf4j.LoggerFactory.getLogger(AuthService.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
  }

  public void signup(SignupRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("Email already exists");
    }

    if (userRepository.existsByUsername(request.getUsername())) {
      throw new IllegalArgumentException("Username already taken");
    }

    User user = new User();
    user.setUserId(UUID.randomUUID());
    user.setEmail(request.getEmail());
    user.setUsername(request.getUsername());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setIsVerified(false);
    user.setIsActive(true);
    user.setRole("buyer");
    user.setBadges(new UUID[] {});
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());

    userRepository.save(user);
  }

  public String login(LoginRequest request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid email or password");
    }

    LOGGER.info("JWT generated for user: {}", user.getUsername());
    return jwtUtil.generateToken(user.getEmail());
  }

  public void forgotPassword(String email) {
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    // Logic to handle forgot password (e.g., send reset link)
    // This is a placeholder for actual implementation
  }

  public User getUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
  }

  public String googleLogin(String googleId, String email, String name, String pictureUrl) {
    Optional<User> userOpt = userRepository.findByGoogleId(googleId);
    User user;
    if (userOpt.isPresent()) {
      user = userOpt.get();
    } else {
      // If not found by googleId, try by email (for users who signed up with email first)
      userOpt = userRepository.findByEmail(email);
      if (userOpt.isPresent()) {
        user = userOpt.get();
        user.setGoogleId(googleId);
        user.setOauthProvider("google");
        userRepository.save(user);
      } else {
        // Create new user
        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail(email);
        user.setGoogleId(googleId);
        user.setOauthProvider("google");
        user.setUsername(name);
        user.setProfilePictureUrl(pictureUrl);
        user.setIsActive(true);
        userRepository.save(user);
      }
    }
    // Generate and return JWT token
    return jwtUtil.generateToken(user.getEmail());
  }

  public void logoutUser(String token, String username) {
       
    }
}
