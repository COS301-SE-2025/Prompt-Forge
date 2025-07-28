package com.fiveOps.promptforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiServiceConfig {
  @Value("${ai.service.url:http://localhost:8000}")
  private String aiServiceUrl;

  @Bean
  public WebClient aiWebClient() {
    return WebClient.builder()
        .baseUrl(aiServiceUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }
}
