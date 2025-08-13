package com.fiveOps.promptforge.ml.controller;

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

  private final String mlServiceUrl = "http://localhost:8001";
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
}
