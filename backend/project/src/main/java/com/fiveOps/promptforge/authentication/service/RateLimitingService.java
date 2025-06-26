package com.fiveOps.promptforge.authentication.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConfigurationBuilder;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import io.github.bucket4j.ConsumptionProbe;

@Service
public class RateLimitingService {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
            return Bucket.builder()
                .addLimit(limit)
                .build();
        });
    }

    
    public boolean tryConsume(String key) {
        Bucket bucket = resolveBucket(key);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        return probe.isConsumed();
    }
    
    public Map<String, String> getRateLimitHeaders(String key) {
        Bucket bucket = resolveBucket(key);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(0); // Peek without consuming
        
        Map<String, String> headers = new HashMap<>();
        headers.put("X-Rate-Limit-Limit", "10");
        headers.put("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
        headers.put("X-Rate-Limit-Reset", String.valueOf(
            probe.getNanosToWaitForRefill() / 1_000_000_000));
        return headers;
    }
}