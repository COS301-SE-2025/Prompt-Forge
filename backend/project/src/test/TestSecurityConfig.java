@TestConfiguration
@Profile("test")
public class TestSecurityConfig {

    @Bean
    @Primary
    public JwtFilter testJwtFilter() {
        return new JwtFilter(new TestJwtUtil(), null) {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                          HttpServletResponse response,
                                          FilterChain filterChain)
                    throws IOException, ServletException {
                String token = extractToken(request);
                String path = request.getRequestURI();

                // Skip authentication for whitelisted paths
                if (shouldSkipFilter(path)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // Handle test tokens
                if (token != null) {
                    if (token.equals(EXPIRED_TOKEN)) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
                        return;
                    }
                    if (token.equals(INVALID_TOKEN)) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                        return;
                    }
                    if (token.startsWith("valid.")) {
                        UsernamePasswordAuthenticationToken auth = 
                            new UsernamePasswordAuthenticationToken(
                                "test@example.com", 
                                null, 
                                Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                } else {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
                    return;
                }

                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), 
                        authException.getMessage());
                });
        return http.build();
    }

    // Test JWT Utility
    private static class TestJwtUtil extends JwtUtil {
        @Override
        public boolean validateToken(String token) {
            return !token.equals(EXPIRED_TOKEN) && !token.equals(INVALID_TOKEN);
        }

        @Override
        public String extractUsername(String token) {
            return "test@example.com";
        }
    }

    @Bean
@Primary
public Filter dummyRateLimitFilter() {
    return new Filter() {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            chain.doFilter(request, response); // no rate limiting
        }
    };
}
}