// package com.fiveOps.promptforge.prompts.controller;

// import java.time.LocalDateTime;
// import java.util.Arrays;
// import java.util.List;
// import java.util.UUID;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.eq;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import static org.mockito.Mockito.when;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.setup.MockMvcBuilders;

// import com.fiveOps.promptforge.prompts.model.Prompt;
// import com.fiveOps.promptforge.prompts.service.PromptService;

// @ExtendWith(MockitoExtension.class)
// class PromptControllerTest {

//     @Mock
//     private PromptService promptService;

//     @InjectMocks
//     private PromptController promptController;

//     private MockMvc mockMvc;
//     private Prompt testPrompt;
//     private UUID testId;
//     private UUID authorId;

//     @BeforeEach
//     void setUp() {
//         mockMvc = MockMvcBuilders.standaloneSetup(promptController).build();
        
//         testId = UUID.randomUUID();
//         authorId = UUID.randomUUID();
//         testPrompt = new Prompt();
//         testPrompt.setId(testId);
//         testPrompt.setAuthorId(authorId);
//         testPrompt.setTitle("Test Prompt");
//         testPrompt.setContent("Test Content");
//         testPrompt.setPrice(0.0);
//         testPrompt.setVisibility("private");
//         testPrompt.setCreatedAt(LocalDateTime.now());
//     }

//     @Test
//     void getAllPrompts_ShouldReturnAllPrompts() {
//         // Arrange
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.getAllPrompts()).thenReturn(prompts);

//         // Act
//         ResponseEntity<List<Prompt>> response = promptController.getAllPrompts();

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(prompts, response.getBody());
//     }

//     @Test
//     void getPromptsByAuthor_ShouldReturnAuthorPrompts() {
//         // Arrange
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.getPromptsByAuthor(authorId)).thenReturn(prompts);

//         // Act
//         ResponseEntity<List<Prompt>> response = promptController.getPromptsByAuthor(authorId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(prompts, response.getBody());
//     }

//     @Test
//     void getPromptById_ShouldReturnPromptWhenExists() {
//         // Arrange
//         when(promptService.getPromptById(testId)).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.getPromptById(testId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testPrompt, response.getBody());
//     }

//     @Test
//     void getPromptById_ShouldReturnNotFoundWhenNotExists() {
//         // Arrange
//         when(promptService.getPromptById(testId)).thenReturn(null);

//         // Act
//         ResponseEntity<Prompt> response = promptController.getPromptById(testId);

//         // Assert
//         assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//     }

//     @Test
//     void createPrompt_ShouldCreateNewPrompt() {
//         // Arrange
//         when(promptService.createPrompt(any(Prompt.class))).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.createPrompt(testPrompt);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testPrompt, response.getBody());
//     }

//     @Test
//     void createPrompt_ShouldSetDefaultPriceWhenNull() {
//         // Arrange
//         testPrompt.setPrice(null);
//         when(promptService.createPrompt(any(Prompt.class))).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.createPrompt(testPrompt);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(0.0, response.getBody().getPrice());
//     }

//     @Test
//     void updatePrompt_ShouldUpdateExistingPrompt() {
//         // Arrange
//         when(promptService.updatePrompt(eq(testId), any(Prompt.class))).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.updatePrompt(testId, testPrompt);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testPrompt, response.getBody());
//     }

//     @Test
//     void updatePrompt_ShouldReturnNotFoundWhenPromptNotExists() {
//         // Arrange
//         when(promptService.updatePrompt(eq(testId), any(Prompt.class))).thenReturn(null);

//         // Act
//         ResponseEntity<Prompt> response = promptController.updatePrompt(testId, testPrompt);

//         // Assert
//         assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//     }

//     @Test
//     void publishPrompt_ShouldPublishPrompt() {
//         // Arrange
//         when(promptService.publishPrompt(testId)).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.publishPrompt(testId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testPrompt, response.getBody());
//     }

//     @Test
//     void unpublishPrompt_ShouldUnpublishPrompt() {
//         // Arrange
//         when(promptService.unpublishPrompt(testId)).thenReturn(testPrompt);

//         // Act
//         ResponseEntity<Prompt> response = promptController.unpublishPrompt(testId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testPrompt, response.getBody());
//     }

//     @Test
//     void deletePrompt_ShouldDeletePrompt() {
//         // Arrange
//         when(promptService.deletePrompt(testId)).thenReturn(true);

//         // Act
//         ResponseEntity<?> response = promptController.deletePrompt(testId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//     }

//     @Test
//     void deletePrompt_ShouldReturnNotFoundWhenPromptNotExists() {
//         // Arrange
//         when(promptService.deletePrompt(testId)).thenReturn(false);

//         // Act
//         ResponseEntity<?> response = promptController.deletePrompt(testId);

//         // Assert
//         assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//     }

//     @Test
//     void getPromptsByTagName_ShouldReturnPromptsWithTag() {
//         // Arrange
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.getPromptsByTagName("test")).thenReturn(prompts);

//         // Act
//         ResponseEntity<List<Prompt>> response = promptController.getByTagName("test");

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(prompts, response.getBody());
//     }

//     @Test
//     void searchPrompts_ShouldSearchAllPrompts() {
//         // Arrange
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.searchByTitle("query")).thenReturn(prompts);

//         // Act
//         ResponseEntity<List<Prompt>> response = promptController.searchPrompts("query", null);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(prompts, response.getBody());
//     }

//     @Test
//     void searchPrompts_ShouldSearchPublicPrompts() {
//         // Arrange
//         List<Prompt> prompts = Arrays.asList(testPrompt);
//         when(promptService.searchPublicByTitle("query")).thenReturn(prompts);

//         // Act
//         ResponseEntity<List<Prompt>> response = promptController.searchPrompts("query", true);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(prompts, response.getBody());
//     }
// }