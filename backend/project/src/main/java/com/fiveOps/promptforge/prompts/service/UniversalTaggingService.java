package com.fiveOps.promptforge.prompts.service;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

@Service
public class UniversalTaggingService {

  private static final Logger LOGGER = LoggerFactory.getLogger(UniversalTaggingService.class);
  private final WebClient aiWebClient;

  public UniversalTaggingService(WebClient aiWebClient) {
    this.aiWebClient = aiWebClient;
  }

  public Map<String, Object> predictTags(String text) {
    try {
      LOGGER.info("Calling AI service for tag prediction with text length: {}", text.length());
      
      @SuppressWarnings("unchecked")
      Map<String, Object> result = aiWebClient
          .post()
          .uri("/classify")
          .bodyValue(Map.of("text", text))
          .retrieve()
          .bodyToMono(Map.class)
          .block();
      
      LOGGER.info("AI service responded successfully");
      return result;
      
    } catch (WebClientException e) {
      LOGGER.error("Failed to call AI service for tag prediction: {}", e.getMessage());
      
      // Return fallback response
      Map<String, Object> fallback = new HashMap<>();
      fallback.put("categories", new String[]{"general"});
      fallback.put("scores", new double[]{0.5});
      fallback.put("confidence", 0.5);
      fallback.put("note", "AI service unavailable - using fallback");
      
      return fallback;
    } catch (Exception e) {
      LOGGER.error("Unexpected error during tag prediction: {}", e.getMessage(), e);
      
      // Return fallback response
      Map<String, Object> fallback = new HashMap<>();
      fallback.put("categories", new String[]{"general"});
      fallback.put("scores", new double[]{0.5});
      fallback.put("confidence", 0.5);
      fallback.put("note", "Error occurred - using fallback");
      
      return fallback;
    }
  }
}
