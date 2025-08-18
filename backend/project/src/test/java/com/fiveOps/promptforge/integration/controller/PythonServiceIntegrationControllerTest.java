package com.fiveOps.promptforge.integration.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class PythonServiceIntegrationControllerTest {

  @Mock private RestTemplate restTemplate;

  @InjectMocks private PythonServiceIntegrationController controller;

  private static final String AI_SERVICE_URL = "http://ai-service:8000";
  private static final String ML_SERVICE_URL = "http://ml-service:8001";

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(controller, "aiServiceUrl", AI_SERVICE_URL);
    ReflectionTestUtils.setField(controller, "mlServiceUrl", ML_SERVICE_URL);
    ReflectionTestUtils.setField(controller, "restTemplate", restTemplate);
  }

  @Test
  @DisplayName("Test AI service health check - success")
  void testAiHealth_Success() {
    // Arrange
    Map<String, Object> expectedResponse = Map.of("status", "healthy", "service", "ai");
    ResponseEntity<Object> mockResponse = ResponseEntity.ok(expectedResponse);

    when(restTemplate.getForEntity(AI_SERVICE_URL + "/health", Object.class))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<Map<String, Object>> result = controller.testAiHealth();

    // Assert
    assertNotNull(result);
    assertEquals(HttpStatus.OK, result.getStatusCode());
    
    Map<String, Object> body = result.getBody();
    assertNotNull(body);
    assertEquals("success", body.get("status"));
    
    @SuppressWarnings("unchecked")
    Map<String, Object> aiService = (Map<String, Object>) body.get("aiService");
    assertNotNull(aiService);
    assertEquals(AI_SERVICE_URL + "/health", aiService.get("url"));
    assertEquals(200, aiService.get("statusCode"));
    assertEquals(expectedResponse, aiService.get("response"));

    verify(restTemplate, times(1)).getForEntity(AI_SERVICE_URL + "/health", Object.class);
  }

  @Test
  @DisplayName("Test AI service health check - failure")
  void testAiHealth_Failure() {
    // Arrange
    when(restTemplate.getForEntity(AI_SERVICE_URL + "/health", Object.class))
        .thenThrow(new RestClientException("Connection refused"));

    // Act
    ResponseEntity<Map<String, Object>> result = controller.testAiHealth();

    // Assert
    assertNotNull(result);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
    
    Map<String, Object> body = result.getBody();
    assertNotNull(body);
    assertEquals("error", body.get("status"));
    
    @SuppressWarnings("unchecked")
    Map<String, Object> aiService = (Map<String, Object>) body.get("aiService");
    assertNotNull(aiService);
    assertEquals(AI_SERVICE_URL + "/health", aiService.get("url"));
    assertEquals("Connection refused", aiService.get("error"));

    verify(restTemplate, times(1)).getForEntity(AI_SERVICE_URL + "/health", Object.class);
  }

  @Test
  @DisplayName("Test ML service health check - success")
  void testMlHealth_Success() {
    // Arrange
    Map<String, Object> expectedResponse = Map.of("status", "healthy", "service", "ml");
    ResponseEntity<Object> mockResponse = ResponseEntity.ok(expectedResponse);

    when(restTemplate.getForEntity(ML_SERVICE_URL + "/health", Object.class))
        .thenReturn(mockResponse);

    // Act
    ResponseEntity<Map<String, Object>> result = controller.testMlHealth();

    // Assert
    assertNotNull(result);
    assertEquals(HttpStatus.OK, result.getStatusCode());
    
    Map<String, Object> body = result.getBody();
    assertNotNull(body);
    assertEquals("success", body.get("status"));
    
    @SuppressWarnings("unchecked")
    Map<String, Object> mlService = (Map<String, Object>) body.get("mlService");
    assertNotNull(mlService);
    assertEquals(ML_SERVICE_URL + "/health", mlService.get("url"));
    assertEquals(200, mlService.get("statusCode"));
    assertEquals(expectedResponse, mlService.get("response"));

    verify(restTemplate, times(1)).getForEntity(ML_SERVICE_URL + "/health", Object.class);
  }

  @Test
  @DisplayName("Test ML service health check - failure")
  void testMlHealth_Failure() {
    // Arrange
    when(restTemplate.getForEntity(ML_SERVICE_URL + "/health", Object.class))
        .thenThrow(new RestClientException("Service unavailable"));

    // Act
    ResponseEntity<Map<String, Object>> result = controller.testMlHealth();

    // Assert
    assertNotNull(result);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
    
    Map<String, Object> body = result.getBody();
    assertNotNull(body);
    assertEquals("error", body.get("status"));
    
    @SuppressWarnings("unchecked")
    Map<String, Object> mlService = (Map<String, Object>) body.get("mlService");
    assertNotNull(mlService);
    assertEquals(ML_SERVICE_URL + "/health", mlService.get("url"));
    assertEquals("Service unavailable", mlService.get("error"));

    verify(restTemplate, times(1)).getForEntity(ML_SERVICE_URL + "/health", Object.class);
  }
}
