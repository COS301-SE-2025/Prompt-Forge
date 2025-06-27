package com.fiveOps.promptforge.securityConfig;

import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("JWT Filter - " + method + " " + requestPath);

       
        if (shouldSkipFilter(requestPath)) {
            System.out.println("Skipping JWT filter for: " + requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String email = null;

        
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
  
        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    System.out.println("Found JWT token in cookie");
                    break;
                }
            }
        }

        
        if (token != null && !token.trim().isEmpty()) {
            try {
                email = jwtUtil.extractUsername(token);
                System.out.println("Extracted email from JWT: " + email);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (jwtUtil.validateToken(token)) {
                      
                        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            email, "", Collections.emptyList());

                      
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("JWT authentication successful for: " + email);
                    } else {
                        System.out.println("JWT token validation failed");
                    }
                }
            } catch (Exception e) {
                System.err.println(" JWT parsing error: " + e.getMessage());
                // Continue without authentication
            }
        } else {
            System.out.println("No JWT token found in request");
        }

        filterChain.doFilter(request, response);
    }

    
    private boolean shouldSkipFilter(String requestPath) {
        return requestPath.startsWith("/auth/") ||
               requestPath.startsWith("/public/") ||
               requestPath.startsWith("/swagger-ui/") ||
               requestPath.startsWith("/v3/api-docs");
    }
}
