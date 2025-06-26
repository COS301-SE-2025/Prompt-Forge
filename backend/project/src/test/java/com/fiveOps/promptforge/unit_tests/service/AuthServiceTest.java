package com.fiveOps.promptforge.unit_tests.service;

import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

        String actualToken = authService.login(loginRequest);
        assertEquals(expectedToken, actualToken);
    }

    @Test
    void testLogin_InvalidEmail() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("notfound@example.com");
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword() {
        String email = "test@example.com";
        String wrongPassword = "wrongPassword";
        String storedEncodedPassword = "encodedPassword";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(storedEncodedPassword);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(wrongPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(wrongPassword, storedEncodedPassword)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void testSignup_Successful() {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@example.com");
        request.setUsername("newuser");
        request.setPassword("securePassword");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");

        // no exception should be thrown
        authService.signup(request);

        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals("new@example.com") &&
            user.getUsername().equals("newuser") &&
            user.getPasswordHash().equals("encodedPassword") &&
            user.getIsVerified() == false &&
            user.getIsActive() == true &&
            user.getRole().equals("buyer")
        ));
    }

    @Test
    void testSignup_EmailAlreadyExists() {
        SignupRequest request = new SignupRequest();
        request.setEmail("existing@example.com");
        request.setUsername("uniqueuser");
        request.setPassword("password");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signup(request);
        });

        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    void testSignup_UsernameAlreadyTaken() {
        SignupRequest request = new SignupRequest();
        request.setEmail("unique@example.com");
        request.setUsername("takenusername");
        request.setPassword("password");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(true);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.signup(request);
        });

        assertEquals("Username already taken", exception.getMessage());
    }
}
