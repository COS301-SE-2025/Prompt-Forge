
package com.fiveOps.promptforge.intergration_tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import com.fiveOps.promptforge.user_profile.model.User;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;

    private static final String EMAIL = "usercontroller@test.com";
    private static final String PASSWORD = "securePass123";
    private static String authCookie;

    private static UUID createdUserId;

    @BeforeAll
    static void init() {
        authCookie = null;
    }

    @BeforeEach
    void setupUser() throws Exception {
        Optional<User> existing = userRepository.findByEmail(EMAIL);
        if (existing.isEmpty()) {
            SignupRequest signup = new SignupRequest();
            signup.setEmail(EMAIL);
            signup.setPassword(PASSWORD);
            signup.setUsername("UserCtrl");

            mockMvc.perform(post("/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());
        }

        // Login and store auth cookie
        LoginRequest login = new LoginRequest();
        login.setEmail(EMAIL);
        login.setPassword(PASSWORD);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andReturn();

        String setCookie = result.getResponse().getHeader("Set-Cookie");
        authCookie = setCookie.split(";")[0];

        // Store userId for deletion test
        MvcResult idRes = mockMvc.perform(get("/user/me/id")
                .header("Cookie", authCookie))
            .andExpect(status().isOk())
            .andReturn();

        String json = idRes.getResponse().getContentAsString();
        createdUserId = UUID.fromString(objectMapper.readTree(json).get("userId").asText());
    }

    private String auth() {
        return authCookie;
    }

    // ----------------- ✅ AUTH TESTS -------------------

    @Test
    @Order(1)
    void shouldGetCurrentUser() throws Exception {
        mockMvc.perform(get("/user/me").header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    @Order(2)
    void shouldUpdateCurrentUser() throws Exception {
        UpdateProfileDto dto = new UpdateProfileDto();
        dto.setUsername("UpdatedUsername");
        dto.setBio("New bio");

        mockMvc.perform(patch("/user/me")
                .header("Cookie", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("UpdatedUsername"))
            .andExpect(jsonPath("$.bio").value("New bio"));
    }

    @Test
    @Order(3)
    void shouldGetCurrentUserId() throws Exception {
        mockMvc.perform(get("/user/me/id").header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").isNotEmpty());
    }

    @Test
    @Order(4)
    void shouldReturnDashboardCard() throws Exception {
        mockMvc.perform(get("/user/me/card").header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").isNotEmpty())
            .andExpect(jsonPath("$.badges").isArray());
    }

    @Test
    @Order(5)
    void shouldReturnFullUser() throws Exception {
        mockMvc.perform(get("/user/me/full").header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    @Order(6)
    void shouldUploadAndDeletePicture() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "pic.jpg", "image/jpeg", "mock".getBytes());

        mockMvc.perform(multipart("/user/upload-picture")
                .file(file)
                .header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.url").exists());

        mockMvc.perform(delete("/user/delete-picture").header("Cookie", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Profile picture deleted"));
    }

    @Test
    @Order(7)
    void shouldSearchUsers() throws Exception {
        mockMvc.perform(get("/user/search").param("query", "UserCtrl"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(8)
    void shouldGetFollowersAndFollowing() throws Exception {
        mockMvc.perform(get("/user/me/followers").header("Cookie", auth()))
            .andExpect(status().isOk());

        mockMvc.perform(get("/user/me/following").header("Cookie", auth()))
            .andExpect(status().isOk());
    }

    // ----------------- 🔐 SECURITY NEGATIVE TESTS -------------------

    @Test
    @Order(9)
    void unauthenticatedAccessShouldFail() throws Exception {
        mockMvc.perform(get("/user/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(10)
    void tamperedTokenShouldBeRejected() throws Exception {
        mockMvc.perform(get("/user/me")
                .header("Cookie", "token=invalid-token"))
            .andExpect(status().isUnauthorized());
    }

    // ----------------- 🗑️ DELETE USER (Future admin case) -------------------

    @Test
    @Order(11)
    void deleteUserById_shouldSucceed() throws Exception {
        mockMvc.perform(delete("/user/" + createdUserId))
            .andExpect(status().isOk());

        assertThat(userRepository.findById(createdUserId)).isEmpty();
    }
}
