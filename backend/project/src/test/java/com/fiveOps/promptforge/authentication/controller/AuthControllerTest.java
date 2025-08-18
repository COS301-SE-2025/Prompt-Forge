package com.fiveOps.promptforge.authentication.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;
import com.fiveOps.promptforge.user_profile.model.User;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController controller;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setEmail("john.doe@example.com");
        signupRequest.setUsername("johndoe");
        signupRequest.setPassword("password");

        loginRequest = new LoginRequest("john.doe@example.com", "password");

        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("john.doe@example.com");
        user.setUsername("johndoe");
    }

    @Test
    @DisplayName("signup: returns OK with success message and JSON header")
    void signup_Success() {
        // Arrange
        doNothing().when(authService).signup(signupRequest);

        // Act
        ResponseEntity<?> response = controller.signup(signupRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_JSON, response.getHeaders().getContentType());
        assertTrue(((Map<?, ?>) response.getBody()).containsKey("message"));
        assertEquals("Signup successful", ((Map<?, ?>) response.getBody()).get("message"));
        verify(authService, times(1)).signup(signupRequest);
    }
}