package com.fiveOps.promptforge.testingground.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/test/openrouter")
public class OpenRouterTestController {

    private final String model = "deepseek/deepseek-r1-0528-qwen3-8b:free";
    private String apiKey;
    private String baseUrl;
    
    @Autowired
    private Environment env;

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
    public ResponseEntity<?> chat(@RequestBody String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Create the exact request body structure OpenRouter expects
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            System.out.println("Request body: " + requestBody);
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
            );

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}