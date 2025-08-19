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
}
