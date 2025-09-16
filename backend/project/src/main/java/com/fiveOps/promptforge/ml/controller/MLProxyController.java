package com.fiveOps.promptforge.ml.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "*")
public class MLProxyController {

  private static final Logger LOGGER = LoggerFactory.getLogger(MLProxyController.class);
  private final String mlServiceUrl = "http://localhost:8000";
  private final RestTemplate restTemplate = new RestTemplate();

  @GetMapping("/health")
  public ResponseEntity<String> health() {
    try {
      String url = mlServiceUrl + "/health";
      ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
      return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service unavailable", e);
    }
  }

  @GetMapping("/validate-token")
  public ResponseEntity<String> validateToken() {
    try {
      String url = mlServiceUrl + "/validate-token";
      ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
      return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service unavailable", e);
    }
  }

  @PostMapping("/analyze")
  public ResponseEntity<String> analyze(@RequestBody String body) {
    try {
      String url = mlServiceUrl + "/analyze";
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<String> entity = new HttpEntity<>(body, headers);
      ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
      return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service unavailable", e);
    }
  }

  @PostMapping("/optimize")
  public ResponseEntity<String> optimize(@RequestBody String body) {
    try {
      String url = mlServiceUrl + "/optimize";
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<String> entity = new HttpEntity<>(body, headers);
      ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
      return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service unavailable", e);
    }
  }

  @PostMapping("/optimize-with-goals")
  public ResponseEntity<String> optimizeWithGoals(@RequestBody String body) {
    try {
      String url = mlServiceUrl + "/optimize-with-goals";
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<String> entity = new HttpEntity<>(body, headers);
      ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
      return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service unavailable", e);
    }
  }

  @PostMapping("/optimize-with-structure")
  public ResponseEntity<String> optimizeWithStructure(@RequestBody String body) {
    LOGGER.info("=== STRUCTURE OPTIMIZATION PROXY START ===");
    LOGGER.info("Request body length: {}", body != null ? body.length() : 0);
    LOGGER.debug(
        "Request body preview: {}",
        body != null && body.length() > 100 ? body.substring(0, 100) + "..." : body);

    validateRequestBody(body);

    try {
      String url = mlServiceUrl + "/optimize-with-structure";
      LOGGER.info("Proxying request to ML service: {}", url);

      HttpEntity<String> entity = createHttpEntity(body);
      LOGGER.info("Sending request to ML service...");

      ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

      return handleSuccessfulResponse(response);

    } catch (org.springframework.web.client.HttpClientErrorException e) {
      return handleHttpClientError(e);
    } catch (org.springframework.web.client.HttpServerErrorException e) {
      return handleHttpServerError(e);
    } catch (org.springframework.web.client.ResourceAccessException e) {
      return handleResourceAccessError(e);
    } catch (Exception e) {
      return handleUnexpectedError(e);
    }
  }

  private void validateRequestBody(String body) {
    if (body == null || body.trim().isEmpty()) {
      LOGGER.error("Empty or null request body");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body cannot be empty");
    }
  }

  private HttpEntity<String> createHttpEntity(String body) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
    restTemplate.getInterceptors().clear();
    return new HttpEntity<>(body, headers);
  }

  private ResponseEntity<String> handleSuccessfulResponse(ResponseEntity<String> response) {
    LOGGER.info("✅ Received response from ML service");
    LOGGER.info("Response status: {}", response.getStatusCode());
    LOGGER.info(
        "Response body length: {}", response.getBody() != null ? response.getBody().length() : 0);
    LOGGER.debug(
        "Response body preview: {}",
        response.getBody() != null && response.getBody().length() > 200
            ? response.getBody().substring(0, 200) + "..."
            : response.getBody());

    validateResponse(response);
    return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
  }

  private void validateResponse(ResponseEntity<String> response) {
    if (!response.getStatusCode().is2xxSuccessful()) {
      LOGGER.error("ML service returned error status: {}", response.getStatusCode());
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "ML service returned error: " + response.getStatusCode());
    }

    if (response.getBody() == null || response.getBody().trim().isEmpty()) {
      LOGGER.error("ML service returned empty response");
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "ML service returned empty response");
    }
  }

  private ResponseEntity<String> handleHttpClientError(
      org.springframework.web.client.HttpClientErrorException e) {
    LOGGER.error("❌ HTTP client error: {}", e.getMessage());
    LOGGER.error("Response body: {}", e.getResponseBodyAsString());
    throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST, "Invalid request to ML service: " + e.getMessage());
  }

  private ResponseEntity<String> handleHttpServerError(
      org.springframework.web.client.HttpServerErrorException e) {
    LOGGER.error("❌ HTTP server error: {}", e.getMessage());
    LOGGER.error("Response body: {}", e.getResponseBodyAsString());
    throw new ResponseStatusException(
        HttpStatus.SERVICE_UNAVAILABLE, "ML service error: " + e.getMessage());
  }

  private ResponseEntity<String> handleResourceAccessError(
      org.springframework.web.client.ResourceAccessException e) {
    LOGGER.error("❌ Resource access error: {}", e.getMessage());
    throw new ResponseStatusException(
        HttpStatus.SERVICE_UNAVAILABLE, "Cannot connect to ML service: " + e.getMessage());
  }

  private ResponseEntity<String> handleUnexpectedError(Exception e) {
    LOGGER.error("❌ Unexpected error in ML service request", e);
    LOGGER.error("Error type: {}", e.getClass().getSimpleName());
    LOGGER.error("Error message: {}", e.getMessage());

    throw new ResponseStatusException(
        HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage());
  }
}
