package com.fiveOps.promptforge.securityConfig;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    // Local cache: Key=IP, Value=RequestCount
    private final Cache<String, Integer> requestCounts = Caffeine.newBuilder()
        .expireAfterWrite(1, TimeUnit.MINUTES) // Reset counters every minute
        .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain chain) 
            throws IOException, ServletException {
        
        String clientIp = request.getRemoteAddr();
        int count = requestCounts.get(clientIp, key -> 0) + 1;
        requestCounts.put(clientIp, count);

        if (count > 100) { // 100 requests/minute limit
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}