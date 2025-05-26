package com.example.promptforge.user_profile.service;
import java.util.UUID;
import com.example.promptforge.user_profile.dto.UpdateProfileDto;
import com.example.promptforge.user_profile.dto.UserDto;
import com.example.promptforge.user_profile.model.User;
import com.example.promptforge.user_profile.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDto getUserById( UUID id) {
        User user = userRepository.findById(id).orElseThrow();
        return mapToDto(user);
    }

    public UserDto updateUser( UUID id, UpdateProfileDto dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setAvatarUrl(dto.getProfilePicture());
        user.setPasswordHash(dto.getPassword());
        user.setBio(dto.getBio());
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
