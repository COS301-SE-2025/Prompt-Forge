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
                        "/api/user/paginated",
                        "/api/user/me/followers/paginated",
                        "/api/user/me/following/paginated",
                        "/api/user/*/follow",
                        "/api/user/*/follow-status",
                        "/api/test/**",
                        "/api/editor/**",
                        "/api/comparison/**",
                        "/api/dashboard",
                        "/api/analytics/**",
                        "/api/prompts/**",
                        "/api/store/prompts/**",
                        "/api/cart/**",
                        "/api/ml/**",
                        "/api/prompt-wars/**",
                        "/ws/**")
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
    defaultConfig.setAllowedOriginPatterns(
        Arrays.asList(
            "http://localhost:5173",
            "https://prompt-forge.co.za",
            "https://69v54mpz44.execute-api.eu-north-1.amazonaws.com",
            "https://d898wq8ttyuze.cloudfront.net/api"));
    defaultConfig.setAllowedMethods(
        Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    defaultConfig.setAllowedHeaders(Arrays.asList("*"));
    defaultConfig.setAllowCredentials(true);
    defaultConfig.setMaxAge(3600L);

    CorsConfiguration noCredentialsConfig = new CorsConfiguration();
    noCredentialsConfig.setAllowedOriginPatterns(
        Arrays.asList("http://localhost:5173", "https://prompt-forge.co.za"));
    noCredentialsConfig.setAllowedMethods(
        Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
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