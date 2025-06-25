package com.fiveOps.promptforge.intergration_tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;
import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserControllerIntegrationTest {

    @Autowired 
    private MockMvc mockMvc;
    
    @Autowired 
    private ObjectMapper objectMapper;
    
    @Autowired 
    private UserRepository userRepository;
    
    @Autowired 
    private PasswordEncoder passwordEncoder;

    private static final String TEST_EMAIL = "testuser@integration.com";
    private static final String TEST_PASSWORD = "securePass123";
    private static final String TEST_USERNAME = "IntegrationUser";

    private static UUID userId;
    private static String authToken;

    @BeforeAll
    static void setup(@Autowired UserRepository userRepository, 
                     @Autowired PasswordEncoder passwordEncoder) {
        // Clean up any existing test user
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }

    private String setupUserAndGetToken() throws Exception {
        // Create test user if not exists
        if (userRepository.findByEmail(TEST_EMAIL).isEmpty()) {
            User user = new User();
            user.setUserId(UUID.randomUUID());
            user.setEmail(TEST_EMAIL);
            user.setUsername(TEST_USERNAME);
            user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            userRepository.save(user);
            userId = user.getUserId();
        }

        // Login to get token
        LoginRequest login = new LoginRequest();
        login.setEmail(TEST_EMAIL);
        login.setPassword(TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("token"))
                .andReturn();

        Cookie tokenCookie = result.getResponse().getCookie("token");
        assertNotNull(tokenCookie, "Authentication token cookie should not be null");
        authToken = tokenCookie.getValue();
        return authToken;
    }

    @AfterAll
    static void cleanup(@Autowired UserRepository userRepository) {
        // Clean up test data
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @Order(1)
    void whenGetCurrentUserWithValidToken_thenReturnUserData() throws Exception {
        String token = setupUserAndGetToken();

        mockMvc.perform(get("/user/me")
                .cookie(new Cookie("token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));
    }

    @Test
    @Order(2)
    void whenGetCurrentUserIdWithValidToken_thenReturnUserId() throws Exception {
        String token = setupUserAndGetToken();

        mockMvc.perform(get("/user/me/id")
                .cookie(new Cookie("token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));
    }

    @Test
    @Order(3)
    void whenGetUserByIdWithValidToken_thenReturnUser() throws Exception {
        String token = setupUserAndGetToken();

        mockMvc.perform(get("/user/" + userId)
                .cookie(new Cookie("token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));
    }

    @Test
    @Order(4)
    void whenGetDashboardCardWithValidToken_thenReturnDashboardData() throws Exception {
        String token = setupUserAndGetToken();

        mockMvc.perform(get("/user/me/card")
                .cookie(new Cookie("token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME))
                .andExpect(jsonPath("$.followersCount").isNumber())
                .andExpect(jsonPath("$.followingCount").isNumber());
    }

    @Test
    @Order(5)
    void whenGetFullCurrentUserWithValidToken_thenReturnCompleteUserInfo() throws Exception {
        String token = setupUserAndGetToken();

        mockMvc.perform(get("/user/me/full")
                .cookie(new Cookie("token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.username").value(TEST_USERNAME))
                .andExpect(jsonPath("$.userId").value(userId.toString()));
    }
}