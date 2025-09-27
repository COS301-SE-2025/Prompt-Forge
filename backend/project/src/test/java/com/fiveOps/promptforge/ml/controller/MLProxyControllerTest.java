package com.fiveOps.promptforge.ml.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MLProxyControllerTest {

  @Mock private RestTemplate restTemplate;

  @InjectMocks private MLProxyController controller;

  private static final String ML_SERVICE_URL = "http://localhost:8001";

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(controller, "restTemplate", restTemplate);
  }

  @Test
  @DisplayName("Health check - Success")
  void health_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/health";
    ResponseEntity<String> mockResponse = ResponseEntity.ok("healthy");
    when(restTemplate.getForEntity(url, String.class)).thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.health();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("healthy", response.getBody());
    verify(restTemplate, times(1)).getForEntity(url, String.class);
  }

  @Test
  @DisplayName("Health check - Service Unavailable")
  void health_ServiceUnavailable() {
    // Arrange
    String url = ML_SERVICE_URL + "/health";
    when(restTemplate.getForEntity(url, String.class))
        .thenThrow(new RestClientException("Connection refused"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.health());

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).getForEntity(url, String.class);
  }

  @Test
  @DisplayName("Validate token - Success")
  void validateToken_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/validate-token";
    ResponseEntity<String> mockResponse = ResponseEntity.ok("valid");
    when(restTemplate.getForEntity(url, String.class)).thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.validateToken();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("valid", response.getBody());
    verify(restTemplate, times(1)).getForEntity(url, String.class);
  }

  @Test
  @DisplayName("Validate token - Service Unavailable")
  void validateToken_ServiceUnavailable() {
    // Arrange
    String url = ML_SERVICE_URL + "/validate-token";
    when(restTemplate.getForEntity(url, String.class))
        .thenThrow(new RestClientException("Service unavailable"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.validateToken());

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).getForEntity(url, String.class);
  }

  @Test
  @DisplayName("Optimize - Success")
  void optimize_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize";
    String requestBody = "{\"prompt\":\"test prompt\"}";
    String responseBody = "{\"optimized\":\"optimized prompt\"}";
    ResponseEntity<String> mockResponse = ResponseEntity.ok(responseBody);

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.optimize(requestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(responseBody, response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("Optimize - Service Unavailable")
  void optimize_ServiceUnavailable() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize";
    String requestBody = "{\"prompt\":\"test prompt\"}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new RestClientException("Service unavailable"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.optimize(requestBody));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("Optimize - Invalid Request Body")
  void optimize_InvalidRequestBody() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize";
    String invalidRequestBody = "invalid json";
    ResponseEntity<String> mockResponse = ResponseEntity.badRequest().body("Invalid request");

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.optimize(invalidRequestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Invalid request", response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("Analyze - Success")
  void analyze_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/analyze";
    String requestBody = "{\"text\":\"test prompt\"}";
    String responseBody = "{\"metrics\":{\"clarity\":85}}";
    ResponseEntity<String> mockResponse = ResponseEntity.ok(responseBody);

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.analyze(requestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(responseBody, response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("Analyze - Service Unavailable")
  void analyze_ServiceUnavailable() {
    // Arrange
    String url = ML_SERVICE_URL + "/analyze";
    String requestBody = "{\"text\":\"test prompt\"}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new RestClientException("Service unavailable"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.analyze(requestBody));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithGoals - Success")
  void optimizeWithGoals_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-goals";
    String requestBody = "{\"text\":\"test prompt\",\"goals\":{\"tone\":\"professional\"}}";
    String responseBody = "{\"optimized_prompt\":\"optimized prompt\"}";
    ResponseEntity<String> mockResponse = ResponseEntity.ok(responseBody);

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.optimizeWithGoals(requestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(responseBody, response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithGoals - Service Unavailable")
  void optimizeWithGoals_ServiceUnavailable() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-goals";
    String requestBody = "{\"text\":\"test prompt\",\"goals\":{\"tone\":\"professional\"}}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new RestClientException("Service unavailable"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> controller.optimizeWithGoals(requestBody));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithStructure - Success")
  void optimizeWithStructure_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-structure";
    String requestBody =
        "{\"text\":\"test prompt\",\"structure_options\":{\"usesBulletPoints\":true}}";
    String responseBody = "{\"structured_prompt\":\"structured prompt\"}";
    ResponseEntity<String> mockResponse = ResponseEntity.ok(responseBody);

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.optimizeWithStructure(requestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(responseBody, response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithStructure - HTTP Client Error")
  void optimizeWithStructure_HttpClientError() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-structure";
    String requestBody =
        "{\"text\":\"test prompt\",\"structure_options\":{\"usesBulletPoints\":true}}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> controller.optimizeWithStructure(requestBody));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertTrue(exception.getReason().contains("Invalid request to ML service"));
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithStructure - HTTP Server Error")
  void optimizeWithStructure_HttpServerError() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-structure";
    String requestBody =
        "{\"text\":\"test prompt\",\"structure_options\":{\"usesBulletPoints\":true}}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> controller.optimizeWithStructure(requestBody));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertTrue(exception.getReason().contains("ML service error"));
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithStructure - Resource Access Error")
  void optimizeWithStructure_ResourceAccessError() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-structure";
    String requestBody =
        "{\"text\":\"test prompt\",\"structure_options\":{\"usesBulletPoints\":true}}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new ResourceAccessException("Connection timeout"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> controller.optimizeWithStructure(requestBody));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertTrue(exception.getReason().contains("Cannot connect to ML service"));
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithContext - Success")
  void optimizeWithContext_Success() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-context";
    String requestBody = "{\"text\":\"test prompt\",\"context_options\":{\"domain\":\"business\"}}";
    String responseBody = "{\"context_enhanced_prompt\":\"enhanced prompt\"}";
    ResponseEntity<String> mockResponse = ResponseEntity.ok(responseBody);

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<String> response = controller.optimizeWithContext(requestBody);

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(responseBody, response.getBody());
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithContext - Empty Request Body")
  void optimizeWithContext_EmptyRequestBody() {
    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.optimizeWithContext(""));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Request body cannot be empty", exception.getReason());
    verify(restTemplate, never())
        .postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithContext - Null Request Body")
  void optimizeWithContext_NullRequestBody() {
    // Act & Assert
    ResponseStatusException exception =
        assertThrows(ResponseStatusException.class, () -> controller.optimizeWithContext(null));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Request body cannot be empty", exception.getReason());
    verify(restTemplate, never())
        .postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
  }

  @Test
  @DisplayName("OptimizeWithContext - Unexpected Error")
  void optimizeWithContext_UnexpectedError() {
    // Arrange
    String url = ML_SERVICE_URL + "/optimize-with-context";
    String requestBody = "{\"text\":\"test prompt\",\"context_options\":{\"domain\":\"business\"}}";

    when(restTemplate.postForEntity(eq(url), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new RuntimeException("Unexpected error"));

    // Act & Assert
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> controller.optimizeWithContext(requestBody));

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    assertTrue(exception.getReason().contains("Unexpected error"));
    verify(restTemplate, times(1)).postForEntity(eq(url), any(HttpEntity.class), eq(String.class));
  }
}
