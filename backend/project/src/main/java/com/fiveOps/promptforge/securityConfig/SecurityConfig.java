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
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/api/auth/**",
                        "/public/**",
                        "/api/user/**",
                        "/api/test/**",
                        "/api/editor/**",
                        "/api/comparison/**",
                        "/api/dashboard",
                        "/api/analytics/**",
                        "/api/prompts/**",
                        "/api/store/prompts/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .httpBasic(httpBasic -> httpBasic.disable())
        .formLogin(formLogin -> formLogin.disable())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration defaultConfig = new CorsConfiguration();
    defaultConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173"));
    defaultConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    defaultConfig.setAllowedHeaders(Arrays.asList("*"));
    defaultConfig.setAllowCredentials(true);
    defaultConfig.setMaxAge(3600L);

    CorsConfiguration noCredentialsConfig = new CorsConfiguration();
    noCredentialsConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173"));
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