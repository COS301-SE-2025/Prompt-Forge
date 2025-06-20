package com.fiveOps.promptforge.user_profile.service;

import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateUser(UUID id, UpdateProfileDto dto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return updateUserFields(user, dto);
    }

    @Transactional
    public UserDto updateUserByEmail(String email, UpdateProfileDto dto) {
        User user = userRepository.findByEmail(email)
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

        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
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
        return userRepository.findAll().stream()
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
        return userRepository.findByEmail(email)
            .map(User::getUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
}
