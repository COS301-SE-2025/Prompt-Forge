package com.fiveOps.promptforge;

import com.fiveOps.promptforge.authentication.service.RateLimitingService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import java.time.Duration;
import java.util.Map;
import java.util.HashMap;

@TestConfiguration
@Profile("test")
public class TestRateLimitConfig {

    @Bean
    @Primary
    public RateLimitingService testRateLimitingService() {
        return new RateLimitingService() {
            @Override
            public boolean tryConsume(String key) {
                return true; // Always allow
            }

            @Override
            public Bucket resolveBucket(String key) {
                Bandwidth unlimited = Bandwidth.classic(1000, Refill.greedy(1000, Duration.ofSeconds(1)));
                return Bucket.builder().addLimit(unlimited).build();
            }

            @Override
            public Map<String, String> getRateLimitHeaders(String key) {
                Map<String, String> headers = new HashMap<>();
                headers.put("X-Rate-Limit-Limit", "1000");
                headers.put("X-Rate-Limit-Remaining", "999");
                headers.put("X-Rate-Limit-Reset", "0");
                return headers;
            }
        };
    }
}
