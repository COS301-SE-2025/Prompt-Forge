// package com.fiveOps.promptforge.promptstore.service;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// import java.time.LocalDateTime;
// import java.util.*;

// import com.fiveOps.promptforge.promptstore.exception.PurchaseException;
// import com.fiveOps.promptforge.promptstore.model.PromptPurchase;
// import com.fiveOps.promptforge.promptstore.model.PromptReview;
// import com.fiveOps.promptforge.promptstore.repository.PromptPurchaseRepository;
// import com.fiveOps.promptforge.promptstore.repository.PromptReviewRepository;
// import com.fiveOps.promptforge.promptstore.repository.PromptStoreRepository;
// import com.fiveOps.promptforge.prompts.model.Prompt;
// import com.fiveOps.promptforge.prompts.service.PromptService;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;

// @ExtendWith(MockitoExtension.class)
// class PromptStoreServiceTest {

//     @Mock
//     private PromptStoreRepository promptStoreRepository;

//     @Mock
//     private PromptService promptService;

//     @Mock
//     private PromptPurchaseRepository purchaseRepository;

//     @Mock
//     private PromptReviewRepository reviewRepository;

//     @InjectMocks
//     private PromptStoreService promptStoreService;

//     private Prompt testPrompt;
//     private UUID promptId;
//     private UUID userId;

//     @BeforeEach
//     void setUp() {
//         promptId = UUID.randomUUID();
//         userId = UUID.randomUUID();
        
//         testPrompt = new Prompt();
//         testPrompt.setId(promptId);
//         testPrompt.setTitle("Test Prompt");
//         testPrompt.setContent("Test Content");
//         testPrompt.setPrice(10.0);
//         testPrompt.setVisibility("public");
//     }

//     @Test
//     void getAllPublicPrompts_ShouldReturnPublicPrompts() {
//         // Arrange
//         List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
//         when(promptStoreRepository.findByVisibility("public")).thenReturn(expectedPrompts);

//         // Act
//         List<Prompt> result = promptStoreService.getAllPublicPrompts();

//         // Assert
//         assertEquals(expectedPrompts, result);
//         verify(promptStoreRepository).findByVisibility("public");
//     }

//     @Test
//     void searchPublic_ShouldReturnMatchingPublicPrompts() {
//         // Arrange
//         String query = "test";
//         List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
//         when(promptService.searchPublicByTitle(query)).thenReturn(expectedPrompts);

//         // Act
//         List<Prompt> result = promptStoreService.searchPublic(query);

//         // Assert
//         assertEquals(expectedPrompts, result);
//         verify(promptService).searchPublicByTitle(query);
//     }

//     @Test
//     void getPublicUnderPrice_ShouldReturnPromptsUnderMaxPrice() {
//         // Arrange
//         double maxPrice = 15.0;
//         List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
//         when(promptStoreRepository.findPublicUnderPrice(maxPrice)).thenReturn(expectedPrompts);

//         // Act
//         List<Prompt> result = promptStoreService.getPublicUnderPrice(maxPrice);

//         // Assert
//         assertEquals(expectedPrompts, result);
//         verify(promptStoreRepository).findPublicUnderPrice(maxPrice);
//     }

//     @Test
//     void getPublicByTagName_ShouldReturnPublicPromptsWithTag() {
//         // Arrange
//         String tagName = "test";
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.getPromptsByTagName(tagName)).thenReturn(prompts);

//         // Act
//         List<Prompt> result = promptStoreService.getPublicByTagName(tagName);

//         // Assert
//         assertEquals(1, result.size());
//         assertEquals(testPrompt, result.get(0));
//         verify(promptService).getPromptsByTagName(tagName);
//     }

//     @Test
//     void purchasePrompt_ShouldCreatePurchaseWhenNotAlreadyPurchased() {
//         // Arrange
//         when(promptService.getPromptById(promptId)).thenReturn(testPrompt);
//         when(purchaseRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(false);
//         when(purchaseRepository.save(any(PromptPurchase.class))).thenAnswer(invocation -> {
//             PromptPurchase p = invocation.getArgument(0);
//             p.setId(UUID.randomUUID());
//             return p;
//         });

//         // Act
//         PromptPurchase result = promptStoreService.purchasePrompt(promptId, userId);

//         // Assert
//         assertNotNull(result);
//         assertEquals(promptId, result.getPromptId());
//         assertEquals(userId, result.getUserId());
//         assertEquals(testPrompt.getPrice(), result.getPricePaid());
//         verify(purchaseRepository).existsByPromptIdAndUserId(promptId, userId);
//         verify(purchaseRepository).save(any(PromptPurchase.class));
//     }

//     @Test
//     void purchasePrompt_ShouldThrowWhenAlreadyPurchased() {
//         // Arrange
//         when(promptService.getPromptById(promptId)).thenReturn(testPrompt);
//         when(purchaseRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(true);

//         // Act & Assert
//         assertThrows(PurchaseException.class, () -> 
//             promptStoreService.purchasePrompt(promptId, userId));
        
//         verify(purchaseRepository).existsByPromptIdAndUserId(promptId, userId);
//         verify(purchaseRepository, never()).save(any());
//     }

//     @Test
//     void getPromptReviews_ShouldReturnReviewsForPrompt() {
//         // Arrange
//         PromptReview review = new PromptReview();
//         review.setPromptId(promptId);
//         review.setUserId(userId);
//         review.setRating(5.0);
        
//         List<PromptReview> expectedReviews = Arrays.asList(review);
//         when(reviewRepository.findByPromptId(promptId)).thenReturn(expectedReviews);

//         // Act
//         List<PromptReview> result = promptStoreService.getPromptReviews(promptId);

//         // Assert
//         assertEquals(expectedReviews, result);
//         verify(reviewRepository).findByPromptId(promptId);
//     }

//     @Test
//     void createReview_ShouldSaveNewReview() {
//         // Arrange
//         PromptReview review = new PromptReview();
//         review.setPromptId(promptId);
//         review.setUserId(userId);
//         review.setRating(4.5);
        
//         when(reviewRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(false);
//         when(reviewRepository.save(review)).thenReturn(review);

//         // Act
//         PromptReview result = promptStoreService.createReview(review);

//         // Assert
//         assertEquals(review, result);
//         verify(reviewRepository).existsByPromptIdAndUserId(promptId, userId);
//         verify(reviewRepository).save(review);
//     }

//     @Test
//     void createReview_ShouldThrowWhenUserAlreadyReviewed() {
//         // Arrange
//         PromptReview review = new PromptReview();
//         review.setPromptId(promptId);
//         review.setUserId(userId);
        
//         when(reviewRepository.existsByPromptIdAndUserId(promptId, userId)).thenReturn(true);

//         // Act & Assert
//         assertThrows(IllegalArgumentException.class, () -> 
//             promptStoreService.createReview(review));
        
//         verify(reviewRepository).existsByPromptIdAndUserId(promptId, userId);
//         verify(reviewRepository, never()).save(any());
//     }

//     @Test
//     void getAverageRating_ShouldCalculateAverage() {
//         // Arrange
//         double expectedAverage = 4.5;
//         when(reviewRepository.calculateAverageRating(promptId)).thenReturn(expectedAverage);

//         // Act
//         Double result = promptStoreService.getAverageRating(promptId);

//         // Assert
//         assertEquals(expectedAverage, result);
//         verify(reviewRepository).calculateAverageRating(promptId);
//     }

//     @Test
//     void getPublicPromptsByAuthor_ShouldFilterPublicPrompts() {
//         // Arrange
//         UUID authorId = UUID.randomUUID();
//         Prompt privatePrompt = new Prompt();
//         privatePrompt.setVisibility("private");
        
//         List<Prompt> prompts = Arrays.asList(testPrompt, privatePrompt);
//         when(promptService.getPromptsByAuthor(authorId)).thenReturn(prompts);

//         // Act
//         List<Prompt> result = promptStoreService.getPublicPromptsByAuthor(authorId);

//         // Assert
//         assertEquals(1, result.size());
//         assertEquals(testPrompt, result.get(0));
//         verify(promptService).getPromptsByAuthor(authorId);
//     }

//     @Test
//     void deleteListing_ShouldUnpublishPrompt() {
//         // Arrange
//         when(promptService.unpublishPrompt(promptId)).thenReturn(testPrompt);

//         // Act
//         boolean result = promptStoreService.deleteListing(promptId);

//         // Assert
//         assertTrue(result);
//         verify(promptService).unpublishPrompt(promptId);
//     }

//     @Test
//     void getRecentlyPublishedPrompts_ShouldReturnRecentPublicPrompts() {
//         // Arrange
//         List<Prompt> expectedPrompts = Arrays.asList(testPrompt);
//         when(promptStoreRepository.findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc("public"))
//             .thenReturn(expectedPrompts);

//         // Act
//         List<Prompt> result = promptStoreService.getRecentlyPublishedPrompts();

//         // Assert
//         assertEquals(expectedPrompts, result);
//         verify(promptStoreRepository).findByVisibilityAndPublishedAtIsNotNullOrderByPublishedAtDesc("public");
//     }
// }