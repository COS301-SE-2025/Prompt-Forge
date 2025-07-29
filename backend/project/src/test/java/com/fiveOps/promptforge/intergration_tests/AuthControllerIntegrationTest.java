
package com.fiveOps.promptforge.intergration_tests;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AuthControllerIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  private final String TEST_EMAIL = "integration@test.com";
  private final String TEST_PASSWORD = "securePass123";

  @BeforeEach
  @Transactional
  void cleanUpBeforeEach() {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  private void registerTestUser() throws Exception {
    SignupRequest signupRequest = new SignupRequest();
    signupRequest.setEmail(TEST_EMAIL);
    signupRequest.setPassword(TEST_PASSWORD);
    signupRequest.setUsername("integrationUser");

    mockMvc
        .perform(
            post("/api/auth/signup")
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

    mockMvc
        .perform(
            post("/api/auth/login")
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

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").exists());
  }

  @Test
  @Order(4)
  void logout_shouldClearAuthCookie() throws Exception {
    mockMvc
        .perform(post("/api/auth/logout"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Logout successful"))
        .andExpect(cookie().maxAge("token", 0)); // confirms cookie is cleared
  }
}
