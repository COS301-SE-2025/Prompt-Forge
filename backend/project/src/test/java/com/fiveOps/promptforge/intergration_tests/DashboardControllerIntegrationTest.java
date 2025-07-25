// package com.fiveOps.promptforge.intergration_tests;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.UUID;

// import jakarta.servlet.http.Cookie;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.MvcResult;
// import org.springframework.transaction.annotation.Transactional;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fiveOps.promptforge.authentication.dto.LoginRequest;
// import com.fiveOps.promptforge.prompts.model.Prompt;
// import com.fiveOps.promptforge.prompts.service.PromptService;
// import com.fiveOps.promptforge.user_profile.model.User;
// import com.fiveOps.promptforge.user_profile.repository.UserRepository;
// import org.junit.jupiter.api.AfterEach;
// import org.junit.jupiter.api.BeforeAll;
// import org.junit.jupiter.api.MethodOrderer;
// import org.junit.jupiter.api.Order;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.TestMethodOrder;

// @SpringBootTest
// @AutoConfigureMockMvc
// @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
// @Transactional
// class DashboardControllerIntegrationTest {

//   @Autowired private MockMvc mockMvc;

//   @Autowired private ObjectMapper objectMapper;

//   @Autowired private UserRepository userRepository;

//   @Autowired private PasswordEncoder passwordEncoder;

//   @Autowired private PromptService promptService;

//   private static final String TEST_EMAIL = "dashboarduser@integration.com";
//   private static final String TEST_PASSWORD = "dashboardPass123";
//   private static final String TEST_USERNAME = "DashboardUser";
//   private static final String TEST_PROMPT_CONTENT = "Test prompt content";

//   private static UUID userId;
//   private static String authToken;

//   @BeforeAll
//   static void setup(@Autowired UserRepository userRepository) {
//     userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
//   }

//   private String setupUserAndGetToken() throws Exception {
//     if (userRepository.findByEmail(TEST_EMAIL).isEmpty()) {
//       User user = new User();
//       user.setUserId(UUID.randomUUID());
//       user.setEmail(TEST_EMAIL);
//       user.setUsername(TEST_USERNAME);
//       user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
//       userRepository.save(user);
//       userId = user.getUserId();

//       // Create a valid test prompt
//       Prompt prompt = new Prompt();
//       prompt.setId(UUID.randomUUID());
//       prompt.setAuthorId(userId);
//       prompt.setCreatedAt(LocalDateTime.now());
//       prompt.setTitle("Test Prompt");
//       prompt.setContent(TEST_PROMPT_CONTENT);
//       prompt.setVisibility("public");
//       promptService.createPrompt(prompt);
//     }

//     // Login to get token
//     LoginRequest login = new LoginRequest();
//     login.setEmail(TEST_EMAIL);
//     login.setPassword(TEST_PASSWORD);

//     MvcResult result =
//         mockMvc
//             .perform(
//                 post("/api/auth/login")
//                     .contentType(MediaType.APPLICATION_JSON)
//                     .content(objectMapper.writeValueAsString(login)))
//             .andExpect(status().isOk())
//             .andExpect(cookie().exists("token"))
//             .andReturn();

//     Cookie tokenCookie = result.getResponse().getCookie("token");
//     authToken = tokenCookie.getValue();
//     return authToken;
//   }

//   @AfterEach
//   void cleanup() {
//     // Get all prompts for the user and delete them
//     List<Prompt> prompts = promptService.getPromptsByAuthor(userId);
//     prompts.forEach(prompt -> promptService.deletePrompt(prompt.getId()));

//     // Clean up user
//     userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
//   }

//   @Test
//   @Order(1)
//   void whenGetDashboardWithValidToken_thenReturnDashboardData() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/dashboard").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.totalPrompts").exists())
//         .andExpect(jsonPath("$.averageRating").isEmpty())
//         .andExpect(jsonPath("$.totalDownloads").isEmpty())
//         .andExpect(jsonPath("$.topPrompts").exists())
//         .andExpect(jsonPath("$.monthlyUsage").exists());
//   }

//   @Test
//   @Order(2)
//   void whenGetDashboardWithoutToken_thenReturnDummyData() throws Exception {
//     mockMvc
//         .perform(get("/api/dashboard"))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.totalPrompts").value(12))
//         .andExpect(jsonPath("$.averageRating").value(4.6))
//         .andExpect(jsonPath("$.totalDownloads").value(3847))
//         .andExpect(jsonPath("$.monthlyUsage").value(1250));
//   }

//   @Test
//   @Order(3)
//   void whenGetDashboardWithInvalidToken_thenReturnDummyData() throws Exception {
//     mockMvc
//         .perform(get("/api/dashboard").cookie(new Cookie("token", "invalid-token")))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.totalPrompts").value(12))
//         .andExpect(jsonPath("$.averageRating").value(4.6))
//         .andExpect(jsonPath("$.totalDownloads").value(3847))
//         .andExpect(jsonPath("$.monthlyUsage").value(1250));
//   }
// }
////////////////////////////////////////////////////////////////////////
package com.fiveOps.promptforge.intergration_tests;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithSourceDTO;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DashboardControllerIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private PromptService promptService;

  private final String TEST_EMAIL = "dashboarduser@integration.com";
  private final String TEST_PASSWORD = "dashboardPass123";
  private final String TEST_USERNAME = "DashboardUser";
  private final String TEST_PROMPT_CONTENT = "Test prompt content";

  private UUID userId;
  private String authToken;

  @BeforeAll
  void setup() {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  private String setupUserAndGetToken() throws Exception {
    if (userRepository.findByEmail(TEST_EMAIL).isEmpty()) {
      User user = new User();
      user.setUserId(UUID.randomUUID());
      user.setEmail(TEST_EMAIL);
      user.setUsername(TEST_USERNAME);
      user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
      userRepository.save(user);
      userId = user.getUserId();

      // Create a valid test prompt
      Prompt prompt = new Prompt();
      prompt.setId(UUID.randomUUID());
      prompt.setAuthorId(userId);
      prompt.setCreatedAt(LocalDateTime.now());
      prompt.setTitle("Test Prompt");
      prompt.setContent(TEST_PROMPT_CONTENT);
      prompt.setVisibility("public");
      promptService.createPrompt(prompt);
    } else {
      userId = userRepository.findByEmail(TEST_EMAIL).get().getUserId();
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

  @AfterEach
  void cleanup() {
    // Get all prompts for the user and delete them
    if (userId != null) {
      Pageable pageable = PageRequest.of(0, 1000);
      Page<PromptWithSourceDTO> page = promptService.getPromptsByAuthor(userId,pageable);
      List<PromptWithSourceDTO> prompts = page.getContent();
      prompts.forEach(prompt -> promptService.deletePrompt(prompt.getId()));
    }
    // Clean up user
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  @Test
  @Order(1)
  void whenGetDashboardWithValidToken_thenReturnDashboardData() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/dashboard").cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPrompts").exists())
        .andExpect(jsonPath("$.averageRating").isEmpty())
        .andExpect(jsonPath("$.totalDownloads").isEmpty())
        .andExpect(jsonPath("$.topPrompts").exists())
        .andExpect(jsonPath("$.monthlyUsage").exists());
  }

  @Test
  @Order(2)
  void whenGetDashboardWithoutToken_thenReturnDummyData() throws Exception {
    mockMvc
        .perform(get("/api/dashboard"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPrompts").value(12))
        .andExpect(jsonPath("$.averageRating").value(4.6))
        .andExpect(jsonPath("$.totalDownloads").value(3847))
        .andExpect(jsonPath("$.monthlyUsage").value(1250));
  }

  @Test
  @Order(3)
  void whenGetDashboardWithInvalidToken_thenReturnDummyData() throws Exception {
    mockMvc
        .perform(get("/api/dashboard").cookie(new Cookie("token", "invalid-token")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPrompts").value(12))
        .andExpect(jsonPath("$.averageRating").value(4.6))
        .andExpect(jsonPath("$.totalDownloads").value(3847))
        .andExpect(jsonPath("$.monthlyUsage").value(1250));
  }
}