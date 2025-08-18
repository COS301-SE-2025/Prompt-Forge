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

  @Mock
  private RestTemplate restTemplate;

  @InjectMocks
  private MLProxyController controller;

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
    ResponseStatusException exception = assertThrows(
      ResponseStatusException.class,
      () -> controller.health()
    );

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    assertEquals("ML service unavailable", exception.getReason());
    verify(restTemplate, times(1)).getForEntity(url, String.class);
  }
}