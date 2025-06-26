package com.fiveOps.promptforge.securityConfig;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Configuration
public class SecurityConfig {

  private final JwtFilter jwtFilter;
  private final JwtUtil jwtUtil;

  public SecurityConfig(JwtFilter jwtFilter, JwtUtil jwtUtil) {
    this.jwtFilter = jwtFilter;
    this.jwtUtil = jwtUtil;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  
    @Bean
    public JwtDecoder jwtDecoder() {
        return new JwtDecoder() {
            @Override
            public Jwt decode(String token) throws JwtException {
                try {
                    Claims claims = jwtUtil.extractAllClaims(token);
                    
                    return Jwt.withTokenValue(token)
                            .header("alg", "HS256")
                            .claim("sub", claims.getSubject())
                            .issuedAt(claims.getIssuedAt().toInstant())
                            .expiresAt(claims.getExpiration().toInstant())
                            .build();
                } catch (Exception e) {
                    throw new JwtException("Invalid JWT", e);
                }
            }
        };
    }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth ->
        auth
          .requestMatchers(
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/auth/**",
            "/public/**",
            "/user/**",
            "/api/test/**", 
            "/api/editor/**", 
            "/api/comparison/**", 
            "/api/dashboard",
            "/api/analytics/**",
            "/prompts/**",
            "/store/prompts/**"
            
          )
          .permitAll()
          .anyRequest()
          .authenticated()
      )
      .sessionManagement(sm ->
        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .httpBasic(httpBasic -> httpBasic.disable())
      .formLogin(formLogin -> formLogin.disable())
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

     CorsConfiguration defaultConfig = new CorsConfiguration();
      defaultConfig.setAllowedOriginPatterns(Arrays.asList(
          "http://localhost:5173"));
      defaultConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      defaultConfig.setAllowedHeaders(Arrays.asList("*"));
      defaultConfig.setAllowCredentials(true); 
      defaultConfig.setMaxAge(3600L);

      
      CorsConfiguration noCredentialsConfig = new CorsConfiguration();
      noCredentialsConfig.setAllowedOriginPatterns(Arrays.asList(
          "http://localhost:5173")); 
      noCredentialsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      noCredentialsConfig.setAllowedHeaders(Arrays.asList("*"));
      noCredentialsConfig.setAllowCredentials(false); 
      noCredentialsConfig.setMaxAge(3600L);

    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    
    source.registerCorsConfiguration("/api/test/**", noCredentialsConfig);
    source.registerCorsConfiguration("/api/editor/**", noCredentialsConfig);
    source.registerCorsConfiguration("/api/comparison/**", noCredentialsConfig);


    source.registerCorsConfiguration("/**", defaultConfig);

    return source;
  }
}
