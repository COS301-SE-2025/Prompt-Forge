package com.fiveOps.promptforge.authentication.controller;   

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


import com.fiveOps.promptforge.authentication.dto.AuthResponse;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.GoogleLoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.HttpServletResponse;


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
        String token = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("token", token)
            .httpOnly(true)
            .secure(true) // set to false only in local dev without HTTPS
            .path("/")
            .maxAge(7 * 24 * 60 * 60) // 7 days
            .sameSite("Lax") // or "Strict" / "None" depending on use
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(new AuthResponse(token)); // optional body
    } catch (RuntimeException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
    }
}


    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        AuthResponse authResponse = authService.loginWithGoogle(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletResponse response) {
    // Clear the cookie by setting maxAge=0
    Cookie cookie = new Cookie("token", null);
    cookie.setHttpOnly(true);
    cookie.setSecure(true);  // if using HTTPS
    cookie.setPath("/");
    cookie.setMaxAge(0);     // delete cookie
    response.addCookie(cookie);

    return ResponseEntity.ok(Map.of("message", "Logout successful"));
}

}
