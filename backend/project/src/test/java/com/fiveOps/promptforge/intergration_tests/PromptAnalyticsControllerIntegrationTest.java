package com.fiveOps.promptforge.intergration_tests;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PromptAnalyticsControllerIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private static final String TEST_EMAIL = "analyticsuser@integration.com";
  private static final String TEST_PASSWORD = "analyticsPass123";
  private static final String TEST_USERNAME = "AnalyticsUser";
  private static final String TEST_PROMPT_CONTENT = "Test analytics prompt content";

  private static UUID userId;
  private static String authToken;
  private static UUID publicPromptId;
  private static UUID featuredPromptId;

  @BeforeAll
  static void setup(@Autowired UserRepository userRepository) {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  private String setupUserAndGetToken() throws Exception {
    // Create test
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

    MvcResult result =
        mockMvc
            .perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("token"))
            .andReturn();

    Cookie tokenCookie = result.getResponse().getCookie("token");
    authToken = tokenCookie.getValue();
    return authToken;
  }

  @BeforeEach
  void setupTestData() throws Exception {
    setupUserAndGetToken();

    // Create a public test prompt
    Prompt prompt = new Prompt();
    prompt.setTitle("Public Test Prompt");
    prompt.setContent(TEST_PROMPT_CONTENT);
    prompt.setDescription("Public test description");
    prompt.setVisibility("public");

    MvcResult result =
        mockMvc
            .perform(
                post("/api/prompts")
                    .cookie(new Cookie("token", authToken))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(prompt)))
            .andExpect(status().isOk())
            .andReturn();

    Prompt createdPrompt =
        objectMapper.readValue(result.getResponse().getContentAsString(), Prompt.class);
    publicPromptId = createdPrompt.getId();

    // Publish the prompt
    mockMvc
        .perform(
            post("/api/prompts/" + publicPromptId + "/publish")
                .cookie(new Cookie("token", authToken)))
        .andExpect(status().isOk());

    // Create a featured test prompt
    Prompt featuredPrompt = new Prompt();
    featuredPrompt.setTitle("Featured Test Prompt");
    featuredPrompt.setContent(TEST_PROMPT_CONTENT);
    featuredPrompt.setDescription("Featured test description");
    featuredPrompt.setVisibility("public");
    featuredPrompt.setFeatured(true);

    result =
        mockMvc
            .perform(
                post("/api/prompts")
                    .cookie(new Cookie("token", authToken))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(featuredPrompt)))
            .andExpect(status().isOk())
            .andReturn();

    Prompt createdFeaturedPrompt =
        objectMapper.readValue(result.getResponse().getContentAsString(), Prompt.class);
    featuredPromptId = createdFeaturedPrompt.getId();

    // Publish the featured prompt
    mockMvc
        .perform(
            post("/api/prompts/" + featuredPromptId + "/publish")
                .cookie(new Cookie("token", authToken)))
        .andExpect(status().isOk());
  }

  @AfterEach
  void cleanup() {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  @Test
  void whenGetTrendingPrompts_thenReturnList() throws Exception {
    mockMvc
        .perform(get("/api/analytics/trending"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());
  }

  @Test
  void whenGetFeaturedPrompts_thenReturnList() throws Exception {
    mockMvc
        .perform(get("/api/analytics/featured"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].promptId").exists())
        .andExpect(jsonPath("$[0].title").exists());
  }

  @Test
  void whenGetTopRankingPrompts_thenReturnList() throws Exception {
    mockMvc
        .perform(get("/api/analytics/top-ranking"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());
  }

  @Test
  void whenGetAnalyticsWithoutToken_thenSuccess() throws Exception {
    mockMvc.perform(get("/api/analytics/trending")).andExpect(status().isOk());

    mockMvc.perform(get("/api/analytics/featured")).andExpect(status().isOk());

    mockMvc.perform(get("/api/analytics/top-ranking")).andExpect(status().isOk());
  }

  @Test
  void whenGetAnalyticsWithInvalidToken_thenSuccess() throws Exception {
    mockMvc
        .perform(get("/api/analytics/trending").cookie(new Cookie("token", "invalid-token")))
        .andExpect(status().isOk());
  }
}
