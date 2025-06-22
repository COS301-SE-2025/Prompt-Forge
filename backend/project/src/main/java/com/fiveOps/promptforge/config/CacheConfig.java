package com.fiveOps.promptforge.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Primary
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .maximumSize(1000));
        return cacheManager;
    }

    // Named cache managers (optional)
    @Bean
    public CacheManager promptsCache() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("prompts");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS));
        return cacheManager;
    }
    
    @Bean
    public CacheManager tagsCache() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("tags");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(2, TimeUnit.HOURS));
        return cacheManager;
    }
}