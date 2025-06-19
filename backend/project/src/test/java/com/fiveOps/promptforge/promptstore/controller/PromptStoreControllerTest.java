package com.fiveOps.promptforge.promptstore.controller;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
import com.fiveOps.promptforge.promptstore.model.PromptReview;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;

@ExtendWith(MockitoExtension.class)
class PromptStoreControllerTest {

    @Mock
    private PromptStoreService promptStoreService;

    @InjectMocks
    private PromptStoreController promptStoreController;

    private MockMvc mockMvc;
    private Prompt testPrompt;
    private UUID promptId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(promptStoreController).build();
        
        promptId = UUID.randomUUID();
        userId = UUID.randomUUID();
        
        testPrompt = new Prompt();
        testPrompt.setId(promptId);
        testPrompt.setTitle("Test Prompt");
        testPrompt.setContent("Test Content");
    }

    @Test
    void getAllPublicPrompts_ShouldReturnPublicPrompts() {
        // Arrange
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.getAllPublicPrompts()).thenReturn(expectedPrompts);

        // Act
        List<Prompt> result = promptStoreController.getAllPublicPrompts();

        // Assert
        assertEquals(expectedPrompts, result);
        verify(promptStoreService).getAllPublicPrompts();
    }

    @Test
    void purchasePrompt_ShouldReturnPurchase() {
        // Arrange
        PromptPurchase purchase = new PromptPurchase();
        purchase.setPromptId(promptId);
        purchase.setUserId(userId);
        
        when(promptStoreService.purchasePrompt(promptId, userId)).thenReturn(purchase);

        // Act
        ResponseEntity<PromptPurchase> response = promptStoreController.purchasePrompt(promptId, userId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(purchase, response.getBody());
        verify(promptStoreService).purchasePrompt(promptId, userId);
    }

    @Test
    void getPromptReviews_ShouldReturnReviews() {
        // Arrange
        PromptReview review = new PromptReview();
        review.setPromptId(promptId);
        
        List<PromptReview> expectedReviews = Arrays.asList(review);
        when(promptStoreService.getPromptReviews(promptId)).thenReturn(expectedReviews);

        // Act
        ResponseEntity<List<PromptReview>> response = promptStoreController.getPromptReviews(promptId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedReviews, response.getBody());
        verify(promptStoreService).getPromptReviews(promptId);
    }

    @Test
    void searchPublic_ShouldReturnMatchingPrompts() {
        // Arrange
        String query = "test";
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.searchPublic(query)).thenReturn(expectedPrompts);

        // Act
        List<Prompt> result = promptStoreController.searchPublic(query);

        // Assert
        assertEquals(expectedPrompts, result);
        verify(promptStoreService).searchPublic(query);
    }

    @Test
    void getUnderPrice_ShouldReturnPromptsUnderMaxPrice() {
        // Arrange
        double maxPrice = 15.0;
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.getPublicUnderPrice(maxPrice)).thenReturn(expectedPrompts);

        // Act
        List<Prompt> result = promptStoreController.getUnderPrice(maxPrice);

        // Assert
        assertEquals(expectedPrompts, result);
        verify(promptStoreService).getPublicUnderPrice(maxPrice);
    }

    @Test
    void getByTagName_ShouldReturnPromptsWithTag() {
        // Arrange
        String tagName = "test";
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.getPublicByTagName(tagName)).thenReturn(expectedPrompts);

        // Act
        List<Prompt> result = promptStoreController.getByTagName(tagName);

        // Assert
        assertEquals(expectedPrompts, result);
        verify(promptStoreService).getPublicByTagName(tagName);
    }

    @Test
    void getPublicPromptsByAuthor_ShouldReturnPublicPrompts() {
        // Arrange
        UUID authorId = UUID.randomUUID();
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.getPublicPromptsByAuthor(authorId)).thenReturn(expectedPrompts);

        // Act
        List<Prompt> result = promptStoreController.getPublicPromptsByAuthor(authorId);

        // Assert
        assertEquals(expectedPrompts, result);
        verify(promptStoreService).getPublicPromptsByAuthor(authorId);
    }

    @Test
    void deleteListing_ShouldReturnNoContentWhenSuccessful() {
        // Arrange
        when(promptStoreService.deleteListing(promptId)).thenReturn(true);

        // Act
        ResponseEntity<Void> response = promptStoreController.deleteListing(promptId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(promptStoreService).deleteListing(promptId);
    }

    @Test
    void deleteListing_ShouldReturnNotFoundWhenFailed() {
        // Arrange
        when(promptStoreService.deleteListing(promptId)).thenReturn(false);

        // Act
        ResponseEntity<Void> response = promptStoreController.deleteListing(promptId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(promptStoreService).deleteListing(promptId);
    }

    @Test
    void getRecentlyPublishedPrompts_ShouldReturnRecentPrompts() {
        // Arrange
        List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
        when(promptStoreService.getRecentlyPublishedPrompts()).thenReturn(expectedPrompts);

        // Act
        ResponseEntity<List<Prompt>> response = promptStoreController.getRecentlyPublishedPrompts();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPrompts, response.getBody());
        verify(promptStoreService).getRecentlyPublishedPrompts();
    }
}