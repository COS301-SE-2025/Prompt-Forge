package com.fiveOps.promptforge.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiServiceConfig {

  private static final Logger LOGGER = LoggerFactory.getLogger(AiServiceConfig.class);

  @Value("${ai.service.url:http://localhost:8000}")
  private String aiServiceUrl;

  @Bean
  public WebClient aiWebClient() {
    LOGGER.info("=== AI SERVICE CONFIGURATION DEBUG ===");
    LOGGER.info("Configuring AI WebClient with URL: {}", aiServiceUrl);
    LOGGER.info("Environment AI_SERVICE_URL: {}", System.getenv("AI_SERVICE_URL"));
    LOGGER.info("System property ai.service.url: {}", System.getProperty("ai.service.url"));
    LOGGER.info(
        "System property spring.profiles.active: {}", System.getProperty("spring.profiles.active"));
    LOGGER.info("Environment SPRING_PROFILES_ACTIVE: {}", System.getenv("SPRING_PROFILES_ACTIVE"));

    // Additional debugging for all environment variables
    System.getenv().entrySet().stream()
        .filter(entry -> entry.getKey().contains("SERVICE") || entry.getKey().contains("PROFILE"))
        .forEach(entry -> LOGGER.info("Env {}: {}", entry.getKey(), entry.getValue()));

    LOGGER.info("=== END AI SERVICE CONFIGURATION DEBUG ===");

    return WebClient.builder()
        .baseUrl(aiServiceUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }
}
