// package com.fiveOps.promptforge.intergration_tests;

// import static org.junit.jupiter.api.Assertions.assertNotNull;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// import java.util.UUID;

// import jakarta.servlet.http.Cookie;

// import org.junit.jupiter.api.AfterAll;
// import org.junit.jupiter.api.BeforeAll;
// import org.junit.jupiter.api.MethodOrderer;
// import org.junit.jupiter.api.Order;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.TestMethodOrder;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.MvcResult;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fiveOps.promptforge.authentication.dto.LoginRequest;
// import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
// import com.fiveOps.promptforge.user_profile.model.User;
// import com.fiveOps.promptforge.user_profile.repository.UserRepository;

// @SpringBootTest
// @AutoConfigureMockMvc
// @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
// class UserControllerIntegrationTest {

//   @Autowired private MockMvc mockMvc;

//   @Autowired private ObjectMapper objectMapper;

//   @Autowired private UserRepository userRepository;

//   @Autowired private PasswordEncoder passwordEncoder;

//   private static final String TEST_EMAIL = "testuser@integration.com";
//   private static final String TEST_PASSWORD = "securePass123";
//   private static final String TEST_USERNAME = "IntegrationUser";

//   private static UUID userId;
//   private static String authToken;

//   @BeforeAll
//   static void setup(
//       @Autowired UserRepository userRepository, @Autowired PasswordEncoder passwordEncoder) {
//     // Clean up any existing test user
//     userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
//   }

//   private String setupUserAndGetToken() throws Exception {
//     // Create test user if not exists
//     if (userRepository.findByEmail(TEST_EMAIL).isEmpty()) {
//       User user = new User();
//       user.setUserId(UUID.randomUUID());
//       user.setEmail(TEST_EMAIL);
//       user.setUsername(TEST_USERNAME);
//       user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
//       userRepository.save(user);
//       userId = user.getUserId();
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
//     assertNotNull(tokenCookie, "Authentication token cookie should not be null");
//     authToken = tokenCookie.getValue();
//     return authToken;
//   }

//   @AfterAll
//   static void cleanup(@Autowired UserRepository userRepository) {
//     // Clean up test data
//     userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
//   }

//   @Test
//   @Order(1)
//   void whenGetCurrentUserWithValidToken_thenReturnUserData() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.email").value(TEST_EMAIL))
//         .andExpect(jsonPath("$.username").value(TEST_USERNAME));
//   }

//   @Test
//   @Order(2)
//   void whenGetCurrentUserIdWithValidToken_thenReturnUserId() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me/id").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.userId").value(userId.toString()));
//   }

//   @Test
//   @Order(3)
//   void whenGetUserByIdWithValidToken_thenReturnUser() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/" + userId).cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.email").value(TEST_EMAIL))
//         .andExpect(jsonPath("$.username").value(TEST_USERNAME));
//   }

//   @Test
//   @Order(4)
//   void whenGetDashboardCardWithValidToken_thenReturnDashboardData() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me/card").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.username").value(TEST_USERNAME))
//         .andExpect(jsonPath("$.followersCount").isNumber())
//         .andExpect(jsonPath("$.followingCount").isNumber());
//   }

//   @Test
//   @Order(5)
//   void whenGetFullCurrentUserWithValidToken_thenReturnCompleteUserInfo() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me/full").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.email").value(TEST_EMAIL))
//         .andExpect(jsonPath("$.username").value(TEST_USERNAME))
//         .andExpect(jsonPath("$.userId").value(userId.toString()));
//   }

//   @Test
//   @Order(6)
//   void whenUpdateUserById_thenReturnUpdatedUser() throws Exception {
//     String token = setupUserAndGetToken();

//     UpdateProfileDto updateDto = new UpdateProfileDto();
//     updateDto.setUsername("UpdatedUser");

//     mockMvc
//         .perform(
//             patch("/api/user/" + userId)
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(objectMapper.writeValueAsString(updateDto))
//                 .cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.username").value("UpdatedUser"));
//   }

//   @Test
//   @Order(7)
//   void whenUpdateCurrentUser_thenReturnUpdatedUser() throws Exception {
//     String token = setupUserAndGetToken();

//     UpdateProfileDto updateDto = new UpdateProfileDto();
//     updateDto.setUsername("UpdatedCurrentUser");

//     mockMvc
//         .perform(
//             patch("/api/user/me")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(objectMapper.writeValueAsString(updateDto))
//                 .cookie(new Cookie("token", token)))
//         .andExpect(status().isOk())
//         .andExpect(jsonPath("$.username").value("UpdatedCurrentUser"));
//   }

//   @Test
//   @Order(8)
//   void whenGetFollowers_thenReturnList() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me/followers").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk());
//   }

//   @Test
//   @Order(9)
//   void whenGetFollowing_thenReturnList() throws Exception {
//     String token = setupUserAndGetToken();

//     mockMvc
//         .perform(get("/api/user/me/following").cookie(new Cookie("token", token)))
//         .andExpect(status().isOk());
//   }
// }

///////////////////////////////////////////////////////////////////////////////////////////
package com.fiveOps.promptforge.intergration_tests;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UserControllerIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private final String TEST_EMAIL = "testuser@integration.com";
  private final String TEST_PASSWORD = "securePass123";
  private final String TEST_USERNAME = "IntegrationUser";

  private UUID userId;
  private String authToken;

  @BeforeAll
  void setup() {
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
    assertNotNull(tokenCookie, "Authentication token cookie should not be null");
    authToken = tokenCookie.getValue();
    return authToken;
  }

  @AfterAll
  void cleanup() {
    // Clean up test data
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
  }

  @Test
  @Order(1)
  void whenGetCurrentUserWithValidToken_thenReturnUserData() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me").cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(TEST_EMAIL))
        .andExpect(jsonPath("$.username").value(TEST_USERNAME));
  }

  @Test
  @Order(2)
  void whenGetCurrentUserIdWithValidToken_thenReturnUserId() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me/id").cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.userId").value(userId.toString()));
  }

  @Test
  @Order(3)
  void whenGetUserByIdWithValidToken_thenReturnUser() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/" + userId).cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(TEST_EMAIL))
        .andExpect(jsonPath("$.username").value(TEST_USERNAME));
  }

  @Test
  @Order(4)
  void whenGetDashboardCardWithValidToken_thenReturnDashboardData() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me/card").cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value(TEST_USERNAME))
        .andExpect(jsonPath("$.followersCount").isNumber())
        .andExpect(jsonPath("$.followingCount").isNumber());
  }

  @Test
  @Order(5)
  void whenGetFullCurrentUserWithValidToken_thenReturnCompleteUserInfo() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me/full").cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(TEST_EMAIL))
        .andExpect(jsonPath("$.username").value(TEST_USERNAME))
        .andExpect(jsonPath("$.userId").value(userId.toString()));
  }

  @Test
  @Order(6)
  void whenUpdateUserById_thenReturnUpdatedUser() throws Exception {
    String token = setupUserAndGetToken();

    UpdateProfileDto updateDto = new UpdateProfileDto();
    updateDto.setUsername("UpdatedUser");

    mockMvc
        .perform(
            patch("/api/user/" + userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto))
                .cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("UpdatedUser"));
  }

  @Test
  @Order(7)
  void whenUpdateCurrentUser_thenReturnUpdatedUser() throws Exception {
    String token = setupUserAndGetToken();

    UpdateProfileDto updateDto = new UpdateProfileDto();
    updateDto.setUsername("UpdatedCurrentUser");

    mockMvc
        .perform(
            patch("/api/user/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto))
                .cookie(new Cookie("token", token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("UpdatedCurrentUser"));
  }

  @Test
  @Order(8)
  void whenGetFollowers_thenReturnList() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me/followers").cookie(new Cookie("token", token)))
        .andExpect(status().isOk());
  }

  @Test
  @Order(9)
  void whenGetFollowing_thenReturnList() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
        .perform(get("/api/user/me/following").cookie(new Cookie("token", token)))
        .andExpect(status().isOk());
  }
} 
