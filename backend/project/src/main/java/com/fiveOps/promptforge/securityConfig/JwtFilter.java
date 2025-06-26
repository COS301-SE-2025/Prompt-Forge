package com.fiveOps.promptforge.securityConfig;

import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
    this.jwtUtil = jwtUtil;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
  ) throws ServletException, IOException {
    try {
      String requestPath = request.getRequestURI();
      String method = request.getMethod();

      System.out.println("🔍 JWT Filter - " + method + " " + requestPath);

      //Skip JWT validation for auth endpoints only
      if (shouldSkipFilter(requestPath)) {
        System.out.println("Skipping JWT filter for: " + requestPath);
        filterChain.doFilter(request, response);
        return;
      }

      String token = null;
      String email = null;

      // First try to get token from Authorization header
      String authHeader = request.getHeader("Authorization");
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

      //If no Authorization header, try to get token from cookie
      if (token == null && request.getCookies() != null) {
        for (Cookie cookie : request.getCookies()) {
          if ("token".equals(cookie.getName())) {
            token = cookie.getValue();
            System.out.println("🍪 Found JWT token in cookie");
            break;
          }
        }
      }

      // Process token if found and set authentication
      if (token != null && !token.trim().isEmpty()) {
        try {
          email = jwtUtil.extractUsername(token);

          if (
            email != null &&
            SecurityContextHolder.getContext().getAuthentication() == null
          ) {
            if (jwtUtil.validateToken(token)) {
              // ✅ Create UserDetails with the email as username
              UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                email,
                "",
                Collections.emptyList()
              );

              // ✅ Set authentication in SecurityContext
              UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
              );

              SecurityContextHolder.getContext().setAuthentication(authToken);
              System.out.println(
                "✅ JWT authentication successful for: " + email
              );
            } else {
              System.out.println("❌ JWT token validation failed");
            }
          }
        } catch (ExpiredJwtException ex) {
          response.setContentType("application/json");
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.getWriter().write("Token expired");
          return;
        } catch (JwtException | IllegalArgumentException ex) {
          response.setContentType("application/json");
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.getWriter().write("Invalid token");
          return;
        }
      } else if (!shouldSkipFilter(request.getRequestURI())) {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Missing token");
        return;
      }

      filterChain.doFilter(request, response);
    } catch (Exception ex) {
      response.setContentType("application/json");
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.getWriter().write("{\"error\":\"Authentication failed\"}");
    }
  }

  //  Only skip auth endpoints - let JWT filter process dashboard
  private boolean shouldSkipFilter(String requestPath) {
    return (
      requestPath.startsWith("/auth/") ||
      requestPath.startsWith("/public/") ||
      requestPath.startsWith("/swagger-ui/") ||
      requestPath.startsWith("/v3/api-docs")
    );
  }
}
