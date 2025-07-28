package com.fiveOps.promptforge.prompts.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class UniversalTaggingService {
    
    private final WebClient aiWebClient;
    
    public UniversalTaggingService(WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }
    
    public Map<String, Object> predictTags(String text) {
        return aiWebClient.post()
            .uri("/classify")
            .bodyValue(Map.of("text", text))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }
    
}