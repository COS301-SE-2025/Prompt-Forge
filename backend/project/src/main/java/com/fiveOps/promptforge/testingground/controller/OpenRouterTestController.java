package com.fiveOps.promptforge.testingground.controller;

import java.util.Map;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/test/openrouter")
public class OpenRouterTestController {

  private String apiKey;
  private String baseUrl;

  @Autowired private Environment env;

  @PostConstruct
  public void init() {
    this.apiKey = env.getProperty("OPENROUTER_API_KEY");
    this.baseUrl = env.getProperty("OPENROUTER_BASE_URL");

    if (apiKey == null || baseUrl == null) {
      throw new IllegalStateException("OPENROUTER_API_KEY and OPENROUTER_BASE_URL must be set");
    }
    System.out.println("OpenRouter configuration loaded - API Key present: " + (apiKey != null));
    System.out.println("Base URL: " + baseUrl);
  }

  @PostMapping("/chat")
  public ResponseEntity<?> chat(@RequestBody Map<String, Object> requestBody) {
    try {
      // Validate model is present
      if (!requestBody.containsKey("model")) {
        return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", "Model field is required"));
      }
      
      RestTemplate restTemplate = new RestTemplate();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("Authorization", "Bearer " + apiKey);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

      System.out.println("Request body: " + requestBody);
      
      try {
        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/chat/completions", 
            HttpMethod.POST, 
            entity, 
            Map.class
        );
        return ResponseEntity.ok(response.getBody());
      } catch (HttpClientErrorException e) {
        // Pass through client errors (4xx) with their original status code
        return ResponseEntity
            .status(e.getStatusCode())
            .body(Map.of("error", e.getResponseBodyAsString()));
      } catch (HttpServerErrorException e) {
        // For 503 errors, add more context about model unavailability
        if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
          String model = (String) requestBody.get("model");
          return ResponseEntity
            .status(e.getStatusCode())
            .body(Map.of(
              "error", e.getResponseBodyAsString(),
              "userMessage", "The model " + model + 
              " is currently unavailable. Please try another model."
            ));
        }
        return ResponseEntity
            .status(e.getStatusCode())
            .body(Map.of("error", e.getResponseBodyAsString()));
      }
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }
}
