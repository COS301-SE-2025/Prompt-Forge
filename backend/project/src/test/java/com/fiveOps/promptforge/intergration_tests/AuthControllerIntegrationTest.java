package com.fiveOps.promptforge.intergration_tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static final String TEST_EMAIL = "integration@test.com";
    private static final String TEST_PASSWORD = "securePass123";

    @BeforeEach
    @Transactional
    @Rollback
    void cleanUpBeforeEach() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }

    private void registerTestUser() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(TEST_EMAIL);
        signupRequest.setPassword(TEST_PASSWORD);
        signupRequest.setUsername("integrationUser");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Signup successful"));
    }

    @Test
    @Order(1)
    void signup_shouldRegisterNewUser() throws Exception {
        registerTestUser();
    }

    @Test
    @Order(2)
    void login_shouldReturnTokenAndUserData() throws Exception {
        registerTestUser();

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(TEST_EMAIL);
        loginRequest.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("token"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.email").value(TEST_EMAIL));
    }

    @Test
    @Order(3)
    void login_withWrongPassword_shouldFail() throws Exception {
        registerTestUser();

        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail(TEST_EMAIL);
        badLogin.setPassword("wrongPass");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @Order(4)
    void logout_shouldClearAuthCookie() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout successful"))
                .andExpect(cookie().maxAge("token", 0)); // <- this confirms cookie is cleared
    }
}
