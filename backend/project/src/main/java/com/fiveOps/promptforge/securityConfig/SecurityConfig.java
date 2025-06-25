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

@Configuration
public class SecurityConfig {

  private final JwtFilter jwtFilter;

  public SecurityConfig(JwtFilter jwtFilter) {
    this.jwtFilter = jwtFilter;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
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
            "/api/test/**", // ✅ Allow editor/comparison endpoints without auth
            "/api/editor/**", // ✅ Future editor-specific endpoints
            "/api/comparison/**" // ✅ Future comparison-specific endpoints
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

  // ✅ Custom CORS configuration with path-specific rules
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

     CorsConfiguration defaultConfig = new CorsConfiguration();
      defaultConfig.setAllowedOriginPatterns(Arrays.asList(
          "http://localhost:5173"));
      defaultConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      defaultConfig.setAllowedHeaders(Arrays.asList("*"));
      defaultConfig.setAllowCredentials(true); // ✅ Default: allow credentials
      defaultConfig.setMaxAge(3600L);

      // ✅ Editor/Comparison pages configuration (no credentials)
      CorsConfiguration noCredentialsConfig = new CorsConfiguration();
      noCredentialsConfig.setAllowedOriginPatterns(Arrays.asList(
          "http://localhost:5173")); // ✅ Wildcard allowed without credentials
      noCredentialsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      noCredentialsConfig.setAllowedHeaders(Arrays.asList("*"));
      noCredentialsConfig.setAllowCredentials(false); // ✅ No credentials for editor/comparison
      noCredentialsConfig.setMaxAge(3600L);

    // ✅ Editor/Comparison pages configuration (no credentials)
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    // ✅ Apply no-credentials config to editor/comparison endpoints
    source.registerCorsConfiguration("/api/test/**", noCredentialsConfig);
    source.registerCorsConfiguration("/api/editor/**", noCredentialsConfig);
    source.registerCorsConfiguration("/api/comparison/**", noCredentialsConfig);

    // ✅ Apply default config (with credentials) to all other endpoints
    source.registerCorsConfiguration("/**", defaultConfig);

    return source;
  }
}
