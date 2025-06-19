package com.fiveOps.promptforge.authentication.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.authentication.dto.AuthResponse;
import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.dto.GoogleLoginRequest;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;



import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;




@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void signup(SignupRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new IllegalArgumentException("Email already exists");
    }

    if (userRepository.existsByUsername(request.getUsername())) {
        throw new IllegalArgumentException("Username already taken");
    }

    User user = new User();
    user.setUserId(UUID.randomUUID());
    user.setEmail(request.getEmail());
    user.setUsername(request.getUsername());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setIsVerified(false);
    user.setIsActive(true);
    user.setRole("buyer");
    user.setBadges(new UUID[]{});
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());

    userRepository.save(user);
}


    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return jwtUtil.generateToken(user.getEmail());
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String idTokenString = request.getToken();
        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);

        String email = payload.getEmail();
        boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
        String name = (String) payload.get("name");

        if (!emailVerified) {
            throw new IllegalArgumentException("Email not verified by Google");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setUserId(UUID.randomUUID());
            newUser.setEmail(email);
            newUser.setUsername(name.replaceAll("\\s+", "_").toLowerCase());
            newUser.setRole("buyer");
            newUser.setIsVerified(true);
            newUser.setIsActive(true);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(jwt);
    }

    
    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList("YOUR_GOOGLE_CLIENT_ID"))
            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            } else {
                throw new IllegalArgumentException("Invalid Google ID token");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token", e);
        }
    }
}
