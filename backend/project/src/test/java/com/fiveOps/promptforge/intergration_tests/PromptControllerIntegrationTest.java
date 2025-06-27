package com.fiveOps.promptforge.intergration_tests;



import com.fasterxml.jackson.databind.ObjectMapper;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.prompts.model.Prompt;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PromptControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String TEST_EMAIL = "promptuser@integration.com";
    private static final String TEST_PASSWORD = "promptPass123";
    private static final String TEST_USERNAME = "PromptUser";
    private static final String TEST_PROMPT_CONTENT = "this is my test prompt";

    private static UUID userId;
    private static String authToken;
    private static UUID promptId;

    @BeforeAll
    void setup() {
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
        authToken = tokenCookie.getValue();
        return authToken;
    }

    @BeforeEach
    void setupTestData() throws Exception {
        setupUserAndGetToken();
        
        // Create a test prompt
        Prompt prompt = new Prompt();
        prompt.setTitle("Test Prompt");
        prompt.setContent(TEST_PROMPT_CONTENT);
        prompt.setDescription("Test description");
        prompt.setVisibility("private");
        
        MvcResult result = mockMvc.perform(post("/prompts")
                .cookie(new Cookie("token", authToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prompt)))
                .andExpect(status().isOk())
                .andReturn();
        
        Prompt createdPrompt = objectMapper.readValue(result.getResponse().getContentAsString(), Prompt.class);
        promptId = createdPrompt.getId();
    }

    @AfterEach
    void cleanup() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    void whenCreatePromptWithValidToken_thenSuccess() throws Exception {
        Prompt newPrompt = new Prompt();
        newPrompt.setTitle("New Test Prompt");
        newPrompt.setContent("New content");
        newPrompt.setDescription("New description");
        
        mockMvc.perform(post("/prompts")
                .cookie(new Cookie("token", authToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPrompt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("New Test Prompt"))
                .andExpect(jsonPath("$.authorId").value(userId.toString()));
    }

    @Test
    void whenCreatePromptWithoutToken_thenUnauthorized() throws Exception {
        Prompt newPrompt = new Prompt();
        newPrompt.setTitle("Unauthorized Prompt");
        newPrompt.setContent("Unauthorized content");
        
        mockMvc.perform(post("/prompts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPrompt)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void whenGetPromptById_thenReturnPrompt() throws Exception {
        mockMvc.perform(get("/prompts/" + promptId)
                .cookie(new Cookie("token", authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(promptId.toString()))
                .andExpect(jsonPath("$.title").value("Test Prompt"));
    }

    @Test
    void whenUpdatePromptWithValidToken_thenSuccess() throws Exception {
        Prompt updatedPrompt = new Prompt();
        updatedPrompt.setTitle("Updated Title");
        updatedPrompt.setContent("Updated content");
        
        mockMvc.perform(put("/prompts/" + promptId)
                .cookie(new Cookie("token", authToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPrompt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    void whenPublishPrompt_thenChangeVisibility() throws Exception {
        mockMvc.perform(post("/prompts/" + promptId + "/publish")
                .cookie(new Cookie("token", authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visibility").value("public"));
    }

    @Test
    void whenDeletePrompt_thenSuccess() throws Exception {
        mockMvc.perform(delete("/prompts/" + promptId)
                .cookie(new Cookie("token", authToken)))
                .andExpect(status().isOk());
        
        mockMvc.perform(get("/prompts/" + promptId)
                .cookie(new Cookie("token", authToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void whenGetPromptsByAuthor_thenReturnList() throws Exception {
        mockMvc.perform(get("/prompts/author/" + userId)
                .cookie(new Cookie("token", authToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(promptId.toString()))
                .andExpect(jsonPath("$[0].authorId").value(userId.toString()));
    }
}