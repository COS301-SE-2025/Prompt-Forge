package com.fiveOps.promptforge.authentication.controller;   

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.authentication.dto.AuthResponse;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
