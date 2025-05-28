package com.example.promptforge.user_profile.service;

import com.example.promptforge.user_profile.dto.UpdateProfileDto;
import com.example.promptforge.user_profile.dto.UserDto;
import com.example.promptforge.user_profile.model.User;
import com.example.promptforge.user_profile.repository.UserRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  @Autowired
  private  UserRepository userRepository;

  private final PasswordEncoder passwordEncoder;

  public UserService(
    UserRepository userRepository,
    PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserDto getUserById(UUID id) {
    User user = userRepository.findById(id).orElseThrow();
    return mapToDto(user);
  }

  public UserDto updateUser(UUID id, UpdateProfileDto dto) {
    User user = userRepository
      .findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));

    if (dto.getUsername() != null) user.setUsername(dto.getUsername());
    if (dto.getEmail() != null) user.setEmail(dto.getEmail());
    if (dto.getBio() != null) user.setBio(dto.getBio());
    if (dto.getPassword() != null) user.setPasswordHash(
      passwordEncoder.encode(dto.getPassword())
    );
    if (dto.getProfilePicture() != null) user.setAvatarUrl(
      dto.getProfilePicture()
    );
    return mapToDto(userRepository.save(user));
  }

  private UserDto mapToDto(User user) {
    UserDto dto = new UserDto();
    dto.setUsername(user.getUsername());
    dto.setEmail(user.getEmail());
    dto.setProfilePicture(user.getAvatarUrl());
    dto.setBio(user.getBio());
    return dto;
  }
}
