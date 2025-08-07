package com.fiveOps.promptforge.integration.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/** Controller for testing integration between Java backend and Python services */
@RestController
@RequestMapping("/api/integration")
public class PythonServiceIntegrationController {

  private final RestTemplate restTemplate;

  @Value("${ai.service.url:http://ai-service:8000}")
  private String aiServiceUrl;

  @Value("${ml.service.url:http://ml-service:8001}")
  private String mlServiceUrl;

  public PythonServiceIntegrationController() {
    this.restTemplate = new RestTemplate();
  }

  /** Test AI service health from backend */
  @GetMapping("/test-ai-health")
  public ResponseEntity<Map<String, Object>> testAiHealth() {
    Map<String, Object> result = new HashMap<>();

    try {
      ResponseEntity<Object> response =
          restTemplate.getForEntity(aiServiceUrl + "/health", Object.class);

      result.put("status", "success");
      result.put(
          "aiService",
          Map.of(
              "url", aiServiceUrl + "/health",
              "statusCode", response.getStatusCode().value(),
              "response", response.getBody()));

      return ResponseEntity.ok(result);

    } catch (Exception e) {
      result.put("status", "error");
      result.put("aiService", Map.of("url", aiServiceUrl + "/health", "error", e.getMessage()));

      return ResponseEntity.status(500).body(result);
    }
  }

  /** Test ML service health from backend */
  @GetMapping("/test-ml-health")
  public ResponseEntity<Map<String, Object>> testMlHealth() {
    Map<String, Object> result = new HashMap<>();

    try {
      ResponseEntity<Object> response =
          restTemplate.getForEntity(mlServiceUrl + "/health", Object.class);

      result.put("status", "success");
      result.put(
          "mlService",
          Map.of(
              "url", mlServiceUrl + "/health",
              "statusCode", response.getStatusCode().value(),
              "response", response.getBody()));

      return ResponseEntity.ok(result);

    } catch (Exception e) {
      result.put("status", "error");
      result.put("mlService", Map.of("url", mlServiceUrl + "/health", "error", e.getMessage()));

      return ResponseEntity.status(500).body(result);
    }
  }

  /** Test both services health from backend */
  @GetMapping("/test-all-health")
  public ResponseEntity<Map<String, Object>> testAllHealth() {
    Map<String, Object> result = new HashMap<>();
    Map<String, Object> services = new HashMap<>();

    // Test AI Service
    try {
      ResponseEntity<Object> aiResponse =
          restTemplate.getForEntity(aiServiceUrl + "/health", Object.class);
      services.put(
          "aiService",
          Map.of(
              "status", "healthy",
              "statusCode", aiResponse.getStatusCode().value(),
              "response", aiResponse.getBody()));
    } catch (Exception e) {
      services.put("aiService", Map.of("status", "unhealthy", "error", e.getMessage()));
    }

    // Test ML Service
    try {
      ResponseEntity<Object> mlResponse =
          restTemplate.getForEntity(mlServiceUrl + "/health", Object.class);
      services.put(
          "mlService",
          Map.of(
              "status", "healthy",
              "statusCode", mlResponse.getStatusCode().value(),
              "response", mlResponse.getBody()));
    } catch (Exception e) {
      services.put("mlService", Map.of("status", "unhealthy", "error", e.getMessage()));
    }

    result.put("services", services);
    result.put("timestamp", System.currentTimeMillis());

    return ResponseEntity.ok(result);
  }

  /** Test AI classification from backend */
  @PostMapping("/test-ai-classify")
  public ResponseEntity<Map<String, Object>> testAiClassify(
      @RequestBody Map<String, Object> request) {
    Map<String, Object> result = new HashMap<>();

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);

      // Prepare classification request
      Map<String, Object> classifyRequest = new HashMap<>();
      classifyRequest.put("text", request.getOrDefault("prompt", "Create a sorting algorithm"));

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(classifyRequest, headers);

      ResponseEntity<Object> response =
          restTemplate.postForEntity(aiServiceUrl + "/classify", entity, Object.class);

      result.put("status", "success");
      result.put("classification", response.getBody());
      result.put("request", classifyRequest);

      return ResponseEntity.ok(result);

    } catch (Exception e) {
      result.put("status", "error");
      result.put("error", e.getMessage());
      result.put("request", request);

      return ResponseEntity.status(500).body(result);
    }
  }

  /** Test ML optimization from backend */
  @PostMapping("/test-ml-optimize")
  public ResponseEntity<Map<String, Object>> testMlOptimize(
      @RequestBody Map<String, Object> request) {
    Map<String, Object> result = new HashMap<>();

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);

      // Prepare optimization request
      Map<String, Object> optimizeRequest = new HashMap<>();
      optimizeRequest.put(
          "original_prompt", request.getOrDefault("original_prompt", "make a website"));
      optimizeRequest.put("context", request.getOrDefault("context", "web development"));
      optimizeRequest.put("user_level", request.getOrDefault("user_level", "beginner"));

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(optimizeRequest, headers);

      ResponseEntity<Object> response =
          restTemplate.postForEntity(mlServiceUrl + "/optimize", entity, Object.class);

      result.put("status", "success");
      result.put("optimization", response.getBody());
      result.put("request", optimizeRequest);

      return ResponseEntity.ok(result);

    } catch (Exception e) {
      result.put("status", "error");
      result.put("error", e.getMessage());
      result.put("request", request);

      return ResponseEntity.status(500).body(result);
    }
  }

  /** Test full integration workflow */
  @PostMapping("/test-full-workflow")
  public ResponseEntity<Map<String, Object>> testFullWorkflow(
      @RequestBody Map<String, Object> request) {
    Map<String, Object> result = new HashMap<>();
    Map<String, Object> workflow = new HashMap<>();

    String prompt =
        (String) request.getOrDefault("prompt", "Create a React component for user authentication");
    String context = (String) request.getOrDefault("context", "Frontend development");

    // Step 1: Classify the prompt
    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);

      Map<String, Object> classifyRequest = Map.of("text", prompt);

      HttpEntity<Map<String, Object>> classifyEntity = new HttpEntity<>(classifyRequest, headers);
      ResponseEntity<Object> classifyResponse =
          restTemplate.postForEntity(aiServiceUrl + "/classify", classifyEntity, Object.class);

      workflow.put(
          "step1_classification",
          Map.of("status", "success", "response", classifyResponse.getBody()));

    } catch (Exception e) {
      workflow.put("step1_classification", Map.of("status", "error", "error", e.getMessage()));
    }

    // Step 2: Optimize the prompt
    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);

      Map<String, Object> optimizeRequest =
          Map.of(
              "original_prompt", prompt,
              "context", context,
              "user_level", request.getOrDefault("user_level", "intermediate"));

      HttpEntity<Map<String, Object>> optimizeEntity = new HttpEntity<>(optimizeRequest, headers);
      ResponseEntity<Object> optimizeResponse =
          restTemplate.postForEntity(mlServiceUrl + "/optimize", optimizeEntity, Object.class);

      workflow.put(
          "step2_optimization",
          Map.of("status", "success", "response", optimizeResponse.getBody()));

    } catch (Exception e) {
      workflow.put("step2_optimization", Map.of("status", "error", "error", e.getMessage()));
    }

    result.put("workflow", workflow);
    result.put("originalRequest", request);
    result.put("timestamp", System.currentTimeMillis());

    return ResponseEntity.ok(result);
  }
}
