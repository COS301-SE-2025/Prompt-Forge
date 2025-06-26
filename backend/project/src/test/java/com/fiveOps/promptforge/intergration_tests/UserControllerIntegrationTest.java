package com.fiveOps.promptforge.intergration_tests;


import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles("test")
@TestPropertySource(
  properties = {
    "spring.security.rate-limiter.enabled=false",
    "bucket4j.enabled=false", // Disable rate limiting in tests
    "spring.servlet.multipart.enabled=false",
  }
)
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
  private static final String TEST_EMAIL_2 = "testuser2@integration.com";
  private static final String TEST_PASSWORD = "securePass123";
  private static final String TEST_USERNAME = "IntegrationUser";
  private static final String TEST_USERNAME_2 = "IntegrationUser2";
  private static final String INVALID_TOKEN = "invalid.jwt.token";
  private static final String EXPIRED_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";

  private static UUID userId;
  private static UUID userId2;
  private static String authToken;

  @BeforeAll
  void setup() {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    userRepository.findByEmail(TEST_EMAIL_2).ifPresent(userRepository::delete);
  }

  private String setupUserAndGetToken() throws Exception {
    return setupUserAndGetToken(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);
  }

  private String setupUserAndGetToken(
    String email,
    String username,
    String password
  ) throws Exception {
    // Create test user if not exists
    if (userRepository.findByEmail(email).isEmpty()) {
      User user = new User();
      user.setUserId(UUID.randomUUID());
      user.setEmail(email);
      user.setUsername(username);
      user.setPasswordHash(passwordEncoder.encode(password));
      userRepository.save(user);

      if (email.equals(TEST_EMAIL)) {
        userId = user.getUserId();
      } else if (email.equals(TEST_EMAIL_2)) {
        userId2 = user.getUserId();
      }
    }

    // Login to get token
    LoginRequest login = new LoginRequest();
    login.setEmail(email);
    login.setPassword(password);

    MvcResult result = mockMvc
      .perform(
        post("/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(login))
      )
      .andExpect(status().isOk())
      .andExpect(cookie().exists("token"))
      .andReturn();

    Cookie tokenCookie = result.getResponse().getCookie("token");
    assertNotNull(
      tokenCookie,
      "Authentication token cookie should not be null"
    );

    if (email.equals(TEST_EMAIL)) {
      authToken = tokenCookie.getValue();
    }

    return tokenCookie.getValue();
  }

  @AfterAll
  void cleanup() {
    userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    userRepository.findByEmail(TEST_EMAIL_2).ifPresent(userRepository::delete);
  }

  @Test
  void whenLoginWithValidCredentials_thenReceiveTokenCookie() throws Exception {
    // Ensure test user exists
    if (userRepository.findByEmail(TEST_EMAIL).isEmpty()) {
      User user = new User();
      user.setUserId(UUID.randomUUID());
      user.setEmail(TEST_EMAIL);
      user.setUsername(TEST_USERNAME);
      user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
      userRepository.save(user);
    }

    LoginRequest login = new LoginRequest();
    login.setEmail(TEST_EMAIL);
    login.setPassword(TEST_PASSWORD);

    MvcResult result = mockMvc
      .perform(
        post("/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(login))
      )
      .andExpect(status().isOk())
      .andExpect(cookie().exists("token"))
      .andReturn();

    Cookie tokenCookie = result.getResponse().getCookie("token");
    assertNotNull(tokenCookie);
    System.out.println("🟢 Token from login: " + tokenCookie.getValue());
  }

  @Test
  void whenRequestWithToken_thenGetCurrentUser() throws Exception {
    // Get a token
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.email").value(TEST_EMAIL))
      .andExpect(jsonPath("$.username").value(TEST_USERNAME));
  }

  //Positive test cases
  @Test
  @Order(1)
  void whenGetCurrentUserWithValidToken_thenReturnUserData() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.email").value(TEST_EMAIL))
      .andExpect(jsonPath("$.username").value(TEST_USERNAME));
  }

  @Test
  @Order(2)
  void whenGetCurrentUserIdWithValidToken_thenReturnUserId() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me/id").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.userId").value(userId.toString()));
  }

  @Test
  @Order(3)
  void whenGetUserByIdWithValidToken_thenReturnUser() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/" + userId).cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.email").value(TEST_EMAIL))
      .andExpect(jsonPath("$.username").value(TEST_USERNAME));
  }

  @Test
  @Order(4)
  void whenGetDashboardCardWithValidToken_thenReturnDashboardData()
    throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me/card").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.username").value(TEST_USERNAME))
      .andExpect(jsonPath("$.followersCount").isNumber())
      .andExpect(jsonPath("$.followingCount").isNumber());
  }

  @Test
  @Order(5)
  void whenGetFullCurrentUserWithValidToken_thenReturnCompleteUserInfo()
    throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me/full").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.email").value(TEST_EMAIL))
      .andExpect(jsonPath("$.username").value(TEST_USERNAME))
      .andExpect(jsonPath("$.userId").value(userId.toString()));
  }

  // Negative test cases - Authentication failures
  @Test
  @Order(6)
  void whenGetCurrentUserWithoutToken_thenReturnUnauthorized()
    throws Exception {
    mockMvc
      .perform(get("/user/me"))
      .andExpect(status().isUnauthorized())
      .andExpect(content().string("Missing token")); // or don't assert on body
  }

  @Test
  @Order(7)
  void whenGetCurrentUserWithInvalidToken_thenReturnUnauthorized()
    throws Exception {
    mockMvc
      .perform(get("/user/me").cookie(new Cookie("token", INVALID_TOKEN)))
      .andExpect(status().isUnauthorized());
  }

  @Test
  @Order(8)
  void whenGetCurrentUserWithExpiredToken_thenReturnUnauthorized()
    throws Exception {
    mockMvc
      .perform(get("/user/me").cookie(new Cookie("token", EXPIRED_TOKEN)))
      .andExpect(status().isUnauthorized())
      .andExpect(content().string("Invalid token"));
  }

  @Test
  @Order(9)
  void whenGetCurrentUserIdWithoutToken_thenReturnUnauthorized()
    throws Exception {
    mockMvc.perform(get("/user/me/id")).andExpect(status().isUnauthorized());
  }

  @Test
  @Order(10)
  void whenGetAllUsersWithValidToken_thenReturnUserList() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user").cookie(new Cookie("token", token)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[*].email").isNotEmpty());
  }

  @Test
  @Order(11)
  void whenDeleteUser_thenUserIsRemoved() throws Exception {
    String token = setupUserAndGetToken(
      TEST_EMAIL_2,
      TEST_USERNAME_2,
      TEST_PASSWORD
    );

    mockMvc
      .perform(delete("/user/" + userId2).cookie(new Cookie("token", token)))
      .andExpect(status().isOk());

    assertTrue(userRepository.findByEmail(TEST_EMAIL_2).isEmpty());
  }

  @Test
  @Order(12)
  void whenUploadProfilePicture_thenReturnUrl() throws Exception {
    String token = setupUserAndGetToken();
    MockMultipartFile file = new MockMultipartFile(
      "file",
      "profile.jpg",
      "image/jpeg",
      "dummyimage".getBytes()
    );

    mockMvc
      .perform(
        multipart("/user/upload-picture")
          .file(file)
          .cookie(new Cookie("token", token))
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.url").exists());
  }

  @Test
  @Order(13)
  void whenDeleteProfilePicture_thenSuccessMessage() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(
        delete("/user/delete-picture").cookie(new Cookie("token", token))
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.message").value("Profile picture deleted"));
  }

  @Test
  @Order(14)
  void whenSearchUsers_thenReturnMatchingUsers() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(
        get("/user/search")
          .param("query", "IntegrationUser")
          .cookie(new Cookie("token", token))
      )
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].username").value(TEST_USERNAME));
  }

  @Test
  @Order(15)
  void whenGetFollowers_thenReturnFollowerList() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me/followers").cookie(new Cookie("token", token)))
      
      .andExpect(status().isOk());
  }

  @Test
  @Order(16)
  void whenGetFollowing_thenReturnFollowingList() throws Exception {
    String token = setupUserAndGetToken();

    mockMvc
      .perform(get("/user/me/following").cookie(new Cookie("token", token)))
      .andExpect(status().isOk());
  }
}
