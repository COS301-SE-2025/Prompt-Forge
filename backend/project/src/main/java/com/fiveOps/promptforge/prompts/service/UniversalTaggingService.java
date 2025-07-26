package com.fiveOps.promptforge.prompts.service;

import java.util.List;
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
            .uri("/predict")
            .bodyValue(Map.of("text", text))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }
    
    public void addDomain(String domain, List<String> terms) {
        aiWebClient.post()
            .uri("/domains")
            .bodyValue(Map.of(
                "domain", domain,
                "terms", terms
            ))
            .retrieve()
            .toBodilessEntity()
            .block();
    }
}