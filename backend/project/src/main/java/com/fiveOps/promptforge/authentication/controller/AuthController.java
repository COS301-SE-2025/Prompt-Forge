package com.fiveOps.promptforge.authentication.controller;   


import java.util.Map;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;
import com.fiveOps.promptforge.user_profile.model.User;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpStatus;

@RestController

@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
    
        authService.signup(request);
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(Map.of("message", "Signup successful"));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("Login attempt for email: " + request.getEmail());
            
            String token = authService.login(request);
            System.out.println("Generated token: " + (token != null ? token.substring(0, 20) + "..." : "NULL"));

            // Get user info for response
            User user = authService.getUserByEmail(request.getEmail());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Login successful");
            responseBody.put("userId", user.getUserId().toString());
            responseBody.put("username", user.getUsername());
            responseBody.put("email", user.getEmail());

            ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false) 
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();

            System.out.println("Setting cookie: " + cookie.toString());

            return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(responseBody);

        } catch (RuntimeException e) {
            System.err.println("Login failed: " + e.getMessage());
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        }
    }
    

    @PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletResponse response) {
    // Clear the cookie by setting maxAge=0
    Cookie cookie = new Cookie("token", null);
    cookie.setHttpOnly(true);
    cookie.setSecure(false);  // if using HTTPS
    cookie.setPath("/");
    cookie.setMaxAge(0);     // delete cookie
    response.addCookie(cookie);

    return ResponseEntity.ok(Map.of("message", "Logout successful"));
}

}
