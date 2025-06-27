
package com.fiveOps.promptforge.prompts.controller;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.service.PromptService;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class PromptControllerTest {

    @Mock
    private PromptService promptService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private PromptController promptController;

    private Prompt testPrompt;
    private UUID testPromptId;
    private UUID testAuthorId;
    private String validToken;
    private String userEmail;
    private User testUser;

    @BeforeEach
    void setUp() {
        testPromptId = UUID.randomUUID();
        testAuthorId = UUID.randomUUID();
        validToken = "valid.token.here";
        userEmail = "test@example.com";

        testPrompt = new Prompt();
        testPrompt.setId(testPromptId);
        testPrompt.setAuthorId(testAuthorId);
        testPrompt.setTitle("Test Prompt");
        testPrompt.setContent("Test content");
        testPrompt.setPrice(9.99);

        testUser = new User();
        testUser.setUserId(testAuthorId);
        testUser.setEmail(userEmail);
    }

    @Test
    void getAllPrompts_ShouldReturnAllPrompts() {
        // Arrange
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptService.getAllPrompts()).thenReturn(expectedPrompts);

        // Act
        ResponseEntity<List<Prompt>> response = promptController.getAllPrompts();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPrompts, response.getBody());
        verify(promptService).getAllPrompts();
    }

    @Test
    void getPromptsByAuthor_ShouldReturnAuthorPrompts() {
        // Arrange
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptService.getPromptsByAuthor(testAuthorId)).thenReturn(expectedPrompts);

        // Act
        ResponseEntity<List<Prompt>> response = promptController.getPromptsByAuthor(testAuthorId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPrompts, response.getBody());
        verify(promptService).getPromptsByAuthor(testAuthorId);
    }

    @Test
    void getPromptById_ShouldReturnPrompt_WhenExists() {
        // Arrange
        when(promptService.getPromptById(testPromptId)).thenReturn(testPrompt);

        // Act
        ResponseEntity<Prompt> response = promptController.getPromptById(testPromptId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPrompt, response.getBody());
        verify(promptService).getPromptById(testPromptId);
    }

    @Test
    void getPromptById_ShouldReturnNotFound_WhenNotExists() {
        // Arrange
        when(promptService.getPromptById(testPromptId)).thenReturn(null);

        // Act
        ResponseEntity<Prompt> response = promptController.getPromptById(testPromptId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(promptService).getPromptById(testPromptId);
    }

    @Test
    void createPrompt_ShouldReturnUnauthorized_WhenNoToken() {
        // Arrange
        when(request.getCookies()).thenReturn(null);

        // Act
        ResponseEntity<?> response = promptController.createPrompt(testPrompt, request);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(request).getCookies();
    }

    @Test
    void createPrompt_ShouldReturnUnauthorized_WhenInvalidToken() {
        // Arrange
        Cookie cookie = new Cookie("token", "invalid.token");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
        when(jwtUtil.validateToken("invalid.token")).thenReturn(false);

        // Act
        ResponseEntity<?> response = promptController.createPrompt(testPrompt, request);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtUtil).validateToken("invalid.token");
    }

    @Test
    void createPrompt_ShouldCreatePrompt_WhenValidToken() {
        // Arrange
        Cookie cookie = new Cookie("token", validToken);
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.extractUsername(validToken)).thenReturn(userEmail);
        when(userService.findByEmail(userEmail)).thenReturn(testUser);
        when(promptService.createPrompt(any(Prompt.class))).thenReturn(testPrompt);

        // Act
        ResponseEntity<?> response = promptController.createPrompt(testPrompt, request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPrompt, response.getBody());
        verify(jwtUtil).validateToken(validToken);
        verify(jwtUtil).extractUsername(validToken);
        verify(userService).findByEmail(userEmail);
        verify(promptService).createPrompt(any(Prompt.class));
    }

    @Test
    void updatePrompt_ShouldUpdatePrompt_WhenExists() {
        // Arrange
        when(promptService.updatePrompt(testPromptId, testPrompt)).thenReturn(testPrompt);

        // Act
        ResponseEntity<Prompt> response = promptController.updatePrompt(testPromptId, testPrompt);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPrompt, response.getBody());
        verify(promptService).updatePrompt(testPromptId, testPrompt);
    }

    @Test
    void updatePrompt_ShouldReturnNotFound_WhenNotExists() {
        // Arrange
        when(promptService.updatePrompt(testPromptId, testPrompt)).thenReturn(null);

        // Act
        ResponseEntity<Prompt> response = promptController.updatePrompt(testPromptId, testPrompt);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(promptService).updatePrompt(testPromptId, testPrompt);
    }

    @Test
    void publishPrompt_ShouldPublishPrompt_WhenExists() {
        // Arrange
        when(promptService.publishPrompt(testPromptId)).thenReturn(testPrompt);

        // Act
        ResponseEntity<Prompt> response = promptController.publishPrompt(testPromptId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPrompt, response.getBody());
        verify(promptService).publishPrompt(testPromptId);
    }

    @Test
    void unpublishPrompt_ShouldUnpublishPrompt_WhenExists() {
        // Arrange
        when(promptService.unpublishPrompt(testPromptId)).thenReturn(testPrompt);

        // Act
        ResponseEntity<Prompt> response = promptController.unpublishPrompt(testPromptId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPrompt, response.getBody());
        verify(promptService).unpublishPrompt(testPromptId);
    }

    @Test
    void deletePrompt_ShouldReturnOk_WhenDeleted() {
        // Arrange
        when(promptService.deletePrompt(testPromptId)).thenReturn(true);

        // Act
        ResponseEntity<?> response = promptController.deletePrompt(testPromptId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(promptService).deletePrompt(testPromptId);
    }

    @Test
    void deletePrompt_ShouldReturnNotFound_WhenNotExists() {
        // Arrange
        when(promptService.deletePrompt(testPromptId)).thenReturn(false);

        // Act
        ResponseEntity<?> response = promptController.deletePrompt(testPromptId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(promptService).deletePrompt(testPromptId);
    }

    @Test
    void getPromptsByTagName_ShouldReturnTaggedPrompts() {
        // Arrange
        String tagName = "test-tag";
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptService.getPromptsByTagName(tagName)).thenReturn(expectedPrompts);

        // Act
        ResponseEntity<List<Prompt>> response = promptController.getByTagName(tagName);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPrompts, response.getBody());
        verify(promptService).getPromptsByTagName(tagName);
    }

    @Test
    void searchPrompts_ShouldReturnPublicPrompts_WhenOnlyPublicTrue() {
        // Arrange
        String query = "test";
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptService.searchPublicByTitle(query)).thenReturn(expectedPrompts);

        // Act
        ResponseEntity<List<Prompt>> response = promptController.searchPrompts(query, true);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPrompts, response.getBody());
        verify(promptService).searchPublicByTitle(query);
    }

    @Test
    void searchPrompts_ShouldReturnAllPrompts_WhenOnlyPublicFalseOrNull() {
        // Arrange
        String query = "test";
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptService.searchByTitle(query)).thenReturn(expectedPrompts);

        // Act - Test with onlyPublic=false
        ResponseEntity<List<Prompt>> response1 = promptController.searchPrompts(query, false);
        // Test with onlyPublic=null
        ResponseEntity<List<Prompt>> response2 = promptController.searchPrompts(query, null);

        // Assert
        assertEquals(HttpStatus.OK, response1.getStatusCode());
        assertEquals(expectedPrompts, response1.getBody());
        assertEquals(HttpStatus.OK, response2.getStatusCode());
        assertEquals(expectedPrompts, response2.getBody());
        verify(promptService, times(2)).searchByTitle(query);
    }
}
