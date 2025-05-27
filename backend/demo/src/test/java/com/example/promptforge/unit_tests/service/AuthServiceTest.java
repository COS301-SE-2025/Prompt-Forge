package com.example.promptforge.unit_tests.service;
import com.example.promptforge.auth.service.AuthService;
import com.example.promptforge.SecurityConfig.JwtUtil;
import com.example.promptforge.auth.dto.LoginRequest;
import com.example.promptforge.user_profile.model.User;
import com.example.promptforge.user_profile.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private AuthService authService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtil = mock(JwtUtil.class);
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil);
    }

    @Test
    void testLogin_Successful() {
        // Arrange
        String email = "test@example.com";
        String password = "password123";
        String encodedPassword = "encodedPassword123";
        String expectedToken = "jwt-token";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(encodedPassword);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, encodedPassword)).thenReturn(true);
        when(jwtUtil.generateToken(email)).thenReturn(expectedToken);

        // Act
        String actualToken = authService.login(loginRequest);

        // Assert
        assertEquals(expectedToken, actualToken);
    }

    @Test
    void testLogin_InvalidEmail() {
        // Arrange
        String email = "wrong@example.com";
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword() {
        // Arrange
        String email = "test@example.com";
        String correctEncodedPassword = "encodedPassword";
        String wrongPassword = "wrongPass";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(correctEncodedPassword);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(wrongPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(wrongPassword, correctEncodedPassword)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }
}
