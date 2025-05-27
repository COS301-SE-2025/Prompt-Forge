package com.example.promptforge.unit_tests.service;
import com.example.promptforge.user_profile.service.UserService;
import com.example.promptforge.user_profile.dto.UpdateProfileDto;
import com.example.promptforge.user_profile.dto.UserDto;
import com.example.promptforge.user_profile.model.User;
import com.example.promptforge.user_profile.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userService = new UserService(userRepository,passwordEncoder);
        // Inject the mocked repository manually since @Autowired won't work in tests
    }

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
    void testGetUserById_userNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(id));
    }

    @Test
    void testUpdateUser_userNotFound() {
        UUID id = UUID.randomUUID();
        UpdateProfileDto dto = new UpdateProfileDto();

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.updateUser(id, dto));
    }
}
