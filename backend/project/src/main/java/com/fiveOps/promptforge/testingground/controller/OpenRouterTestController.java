package com.fiveOps.promptforge.testingground.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
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
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/test/openrouter")
public class OpenRouterTestController {

  private String apiKey;
  private String baseUrl = "https://openrouter.ai/api/v1";
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Autowired private Environment env;

  @PostConstruct
  public void init() {
    this.apiKey = env.getProperty("OPENROUTER_API_KEY");

    if (apiKey == null) {
      throw new IllegalStateException("OPENROUTER_API_KEY must be set");
    }
    System.out.println("OpenRouter configuration loaded - API Key present: " + (apiKey != null));
    System.out.println("Base URL: " + baseUrl);
  }

  @PostMapping("/chat")
  public ResponseEntity<?> chat(@RequestBody Map<String, Object> requestBody) {
    try {
      // Validate model is present
      if (!requestBody.containsKey("model")) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", "Model field is required"));
      }

      // Check if streaming is requested
      boolean isStreaming =
          requestBody.containsKey("stream")
              && requestBody.get("stream") != null
              && Boolean.TRUE.equals(requestBody.get("stream"));

      System.out.println("\n================= API REQUEST =================");
      System.out.println("Streaming: " + isStreaming);
      System.out.println("Model: " + requestBody.get("model"));

      if (isStreaming) {
        // Redirect to streaming endpoint
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
            .header("Location", "/api/test/openrouter/chat/stream")
            .body(Map.of("message", "Use /chat/stream endpoint for streaming requests"));
      } else {
        // Handle regular request
        return handleRegularRequest(requestBody);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  // Add this new streaming-specific endpoint:
  @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<StreamingResponseBody> chatStream(
      @RequestBody Map<String, Object> requestBody) {
    // Validate model is present
    if (!requestBody.containsKey("model")) {
      StreamingResponseBody errorBody =
          outputStream -> {
            String errorMsg = "data: {\"error\":{\"message\":\"Model field is required\"}}\n\n";
            outputStream.write(errorMsg.getBytes(StandardCharsets.UTF_8));
            outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
          };

      return ResponseEntity.badRequest()
          .header("Cache-Control", "no-cache")
          .header("Connection", "keep-alive")
          .header("X-Accel-Buffering", "no")
          .body(errorBody);
    }

    // Ensure stream is set to true
    requestBody.put("stream", true);

    System.out.println("\n================= STREAMING API REQUEST =================");
    System.out.println("Model: " + requestBody.get("model"));

    try {
      System.out.println("Request JSON: " + objectMapper.writeValueAsString(requestBody));
    } catch (Exception e) {
      System.out.println("Failed to serialize request: " + e.getMessage());
    }

    System.out.println("========================================================\n");

    return ResponseEntity.ok()
        .header("Cache-Control", "no-cache")
        .header("Connection", "keep-alive")
        .header("X-Accel-Buffering", "no")
        .header("X-Stream-Timeout", "300000") // ✅ 5 minute timeout
        .contentType(MediaType.TEXT_EVENT_STREAM)
        .body(createStreamingResponse(requestBody));
  }

  private ResponseEntity<?> handleRegularRequest(Map<String, Object> requestBody) {
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + apiKey);
    headers.set("HTTP-Referer", "https://promptforge.ai");
    headers.set("X-Title", "Prompt Forge");

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

    try {
      ResponseEntity<Map> response =
          restTemplate.exchange(baseUrl + "/chat/completions", HttpMethod.POST, entity, Map.class);
      return ResponseEntity.ok(response.getBody());
    } catch (HttpClientErrorException e) {
      // Pass through client errors (4xx) with their original status code
      return ResponseEntity.status(e.getStatusCode())
          .body(Map.of("error", e.getResponseBodyAsString()));
    } catch (HttpServerErrorException e) {
      // For 503 errors, add more context about model unavailability
      if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {
        String model = (String) requestBody.get("model");
        String userMessage =
            "The model " + model + " is currently unavailable. Please try another model.";

        return ResponseEntity.status(e.getStatusCode())
            .body(Map.of("error", e.getResponseBodyAsString(), "userMessage", userMessage));
      }
      return ResponseEntity.status(e.getStatusCode())
          .body(Map.of("error", e.getResponseBodyAsString()));
    }
  }

  // Add a test endpoint to verify the API key and connectivity
  @PostMapping("/test-connection")
  public ResponseEntity<?> testConnection() {
    try {
      URL url = new URL(baseUrl + "/chat/completions");
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setRequestMethod("POST");
      connection.setRequestProperty("Content-Type", "application/json");
      connection.setRequestProperty("Authorization", "Bearer " + apiKey);
      connection.setRequestProperty("HTTP-Referer", "https://promptforge.ai");
      connection.setRequestProperty("X-Title", "Prompt Forge");
      connection.setDoOutput(true);

      // Create a simple test request
      String testBody =
          "{\"model\":\"deepseek/deepseek-r1-0528-qwen3-8b:free\","
              + "\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}";

      try (OutputStream os = connection.getOutputStream()) {
        os.write(testBody.getBytes(StandardCharsets.UTF_8));
        os.flush();
      }

      int responseCode = connection.getResponseCode();
      StringBuilder response = new StringBuilder();

      try (BufferedReader br =
          new BufferedReader(
              new InputStreamReader(
                  responseCode >= 400
                      ? connection.getErrorStream()
                      : connection.getInputStream()))) {
        String line;
        while ((line = br.readLine()) != null) {
          response.append(line);
        }
      }

      return ResponseEntity.ok(
          Map.of(
              "status",
              responseCode,
              "response",
              response.toString(),
              "apiKeyLength",
              apiKey != null ? apiKey.length() : 0));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500)
          .body(
              Map.of(
                  "error", e.getMessage(),
                  "type", e.getClass().getName()));
    }
  }

  // Extract the streaming content handling to reduce method complexity
  private void processStreamContent(
      OutputStream outputStream, String line, int[] contentLines, boolean[] hasContent)
      throws IOException {
    String dataContent = line.substring(6); // Remove "data: " prefix

    // Skip empty data lines
    if (dataContent.trim().isEmpty()) {
      return;
    }

    try {
      // Parse to verify it's valid JSON and has actual content
      Map<String, Object> parsed = objectMapper.readValue(dataContent, Map.class);

      // Only send if it has actual content (delta with content)
      if (parsed.containsKey("choices")) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) parsed.get("choices");

        if (!choices.isEmpty()) {
          Map<String, Object> choice = choices.get(0);
          if (choice.containsKey("delta")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> delta = (Map<String, Object>) choice.get("delta");

            // Only forward if delta has actual content
            if (delta.containsKey("content") && delta.get("content") != null) {
              String content = (String) delta.get("content");
              if (!content.isEmpty()) {
                // Proper SSE formatting with double newlines
                outputStream.write((line + "\n\n").getBytes(StandardCharsets.UTF_8));
                outputStream.flush(); // This is crucial for immediate sending

                hasContent[0] = true;
                contentLines[0]++;

                System.out.println("Streaming content: \"" + content + "\"");
              }
            }
          }
        }
      }
    } catch (Exception parseError) {
      // If parsing fails, still forward the line (might be an error message)
      outputStream.write((line + "\n\n").getBytes(StandardCharsets.UTF_8));
      outputStream.flush();
      System.out.println("Non-parseable data line: " + line);
    }
  }

  // Handle error responses from OpenRouter
  private void handleOpenRouterError(
      OutputStream outputStream, HttpURLConnection connection, int responseCode)
      throws IOException {
    System.out.println("Error response from OpenRouter: " + responseCode);

    StringBuilder errorBuilder = new StringBuilder();
    try (InputStream errorStream = connection.getErrorStream();
        BufferedReader reader =
            new BufferedReader(new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {

      String line;
      while ((line = reader.readLine()) != null) {
        errorBuilder.append(line);
      }
    }

    String errorResponse = errorBuilder.toString();
    String escapedError = errorResponse.replace("\"", "\\\"");
    String errorJson =
        "data: {\"error\":{\"message\":\"OpenRouter error: " + escapedError + "\"}}\n\n";
    outputStream.write(errorJson.getBytes(StandardCharsets.UTF_8));
    outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
    outputStream.flush();
  }

  // Create the streaming response
  private StreamingResponseBody createStreamingResponse(Map<String, Object> requestBody) {
    return outputStream -> {
      HttpURLConnection connection = null;
      try {
        // Keep connection alive with initial comment
        outputStream.write(": connection established\n\n".getBytes(StandardCharsets.UTF_8));
        outputStream.flush();

        System.out.println("\n===== STARTING STREAMING REQUEST =====");
        System.out.println("Model: " + requestBody.get("model"));

        // Ensure the stream parameter is set to true
        requestBody.put("stream", true);

        // Create direct connection to OpenRouter
        URL url = new URL(baseUrl + "/chat/completions");
        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Authorization", "Bearer " + apiKey);
        connection.setRequestProperty("HTTP-Referer", "https://promptforge.ai");
        connection.setRequestProperty("X-Title", "Prompt Forge");
        connection.setRequestProperty("Accept", "text/event-stream");
        connection.setRequestProperty("Cache-Control", "no-cache"); // ✅ Prevent caching
        connection.setDoOutput(true);

        // Send the request body
        try (OutputStream os = connection.getOutputStream()) {
          String jsonRequest = objectMapper.writeValueAsString(requestBody);
          byte[] input = jsonRequest.getBytes(StandardCharsets.UTF_8);
          os.write(input, 0, input.length);
          os.flush();
        }

        // Get response
        int responseCode = connection.getResponseCode();
        System.out.println("OpenRouter response code: " + responseCode);

        if (responseCode >= 200 && responseCode < 300) {
          processSuccessResponse(outputStream, connection);
        } else {
          handleOpenRouterError(outputStream, connection, responseCode);
        }

        System.out.println("===== STREAMING REQUEST COMPLETED =====");

      } catch (Exception e) {
        System.err.println("ERROR IN STREAMING: " + e.getMessage());
        e.printStackTrace();

        try {
          String escapedError =
              e.getMessage() != null ? e.getMessage().replace("\"", "\\\"") : "Unknown error";
          String errorMsg = "data: {\"error\":{\"message\":\"" + escapedError + "\"}}\n\n";
          outputStream.write(errorMsg.getBytes(StandardCharsets.UTF_8));
          outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
          outputStream.flush();
        } catch (IOException ioe) {
          System.err.println("Failed to write error response: " + ioe.getMessage());
        }
      } finally {
        if (connection != null) {
          connection.disconnect();
        }
      }
    };
  }

  // Process successful response from OpenRouter
  private void processSuccessResponse(OutputStream outputStream, HttpURLConnection connection)
      throws IOException {
    try (InputStream inputStream = connection.getInputStream();
        BufferedReader reader =
            new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

      String line;
      boolean[] hasContent = {false};
      int[] contentLines = {0};

      while ((line = reader.readLine()) != null) {
        // ONLY forward actual data lines that contain content
        if (line.startsWith("data: ") && !line.equals("data: [DONE]")) {
          processStreamContent(outputStream, line, contentLines, hasContent);
        }
        // Forward the [DONE] marker to signal completion
        else if (line.equals("data: [DONE]")) {
          outputStream.write((line + "\n\n").getBytes(StandardCharsets.UTF_8));
          outputStream.flush();
          System.out.println("Stream completed after " + contentLines[0] + " content chunks");
          break;
        }
        // Skip all other lines (comments, metadata, empty lines)
        // This includes lines starting with ":" and empty "data: " lines
      }

      // If no content was received, send an error
      if (!hasContent[0]) {
        System.out.println("No content received from OpenRouter");
        String errorMsg =
            "data: {\"error\":{\"message\":\"No content generated by the model\"}}\n\n";
        outputStream.write(errorMsg.getBytes(StandardCharsets.UTF_8));
        outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
      }
    }
  }
}
