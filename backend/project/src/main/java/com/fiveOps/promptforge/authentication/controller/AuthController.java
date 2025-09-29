package com.fiveOps.promptforge.authentication.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiveOps.promptforge.authentication.dto.LoginRequest;
import com.fiveOps.promptforge.authentication.dto.SignupRequest;
import com.fiveOps.promptforge.authentication.service.AuthService;
import com.fiveOps.promptforge.authentication.util.RsaKeyManager;
import com.fiveOps.promptforge.user_profile.model.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

  private final AuthService authService;
  private final RsaKeyManager rsaKeyManager;

  public AuthController(AuthService authService, RsaKeyManager rsaKeyManager) {
    this.authService = authService;
    this.rsaKeyManager = rsaKeyManager;
  }

  @Value("${GOOGLE_CLIENT_ID}")
  private String googleClientId;

  @PostMapping("/signup")
  public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    // If frontend sent an encrypted password, decrypt it first
    if (request.getIsEncrypted() != null && request.getIsEncrypted()) {
      String decrypted = rsaKeyManager.decryptBase64EncryptedRSA(request.getEncryptedPassword());
      request.setPassword(decrypted);
    }

    authService.signup(request);
    return ResponseEntity.ok().headers(headers).body(Map.of("message", "Signup successful"));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
      LOGGER.info("Login attempt by user: {}", request.getEmail());

      // If password is encrypted in payload, decrypt before authenticating
      if (request.getIsEncrypted() != null && request.getIsEncrypted()) {
        String decrypted = rsaKeyManager.decryptBase64EncryptedRSA(request.getEncryptedPassword());
        request.setPassword(decrypted);
      }

      String token = authService.login(request);
      LOGGER.info("Generated token: {}", (token != null ? token.substring(0, 20) + "..." : "NULL"));
      // Get user info for response
      User user = authService.getUserByEmail(request.getEmail());

      Map<String, Object> responseBody = new HashMap<>();
      responseBody.put("message", "Login successful");
      responseBody.put("userId", user.getUserId().toString());
      responseBody.put("username", user.getUsername());
      responseBody.put("email", user.getEmail());
      responseBody.put("token", token); // Include token in response for localStorage storage

      ResponseCookie cookie =
          ResponseCookie.from("token", token)
              .httpOnly(true)
              .secure(true)
              .path("/")
              .maxAge(7 * 24 * 60 * 60) // 7 days
              .sameSite("None")
              .build();

      return ResponseEntity.ok()
          .header(HttpHeaders.SET_COOKIE, cookie.toString())
          .body(responseBody);
    } catch (RuntimeException e) {
      LOGGER.error("Login failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(HttpServletResponse response) {
    ResponseCookie cookie =
        ResponseCookie.from("token", "")
            .httpOnly(true)
            .secure(true) // Match login settings
            .path("/")
            .maxAge(0) // Delete cookie
            .sameSite("None") // Match login settings
            .build();

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(Map.of("message", "Logout successful"));
  }

  @PostMapping("/google")
  public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
    try {
      String idTokenString = body.get("credential");
      if (idTokenString == null) {
        return ResponseEntity.badRequest().body(Map.of("message", "Missing Google credential"));
      }

      GoogleIdTokenVerifier verifier =
          new GoogleIdTokenVerifier.Builder(
                  GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance())
              .setAudience(Collections.singletonList(googleClientId))
              .build();

      GoogleIdToken idToken = verifier.verify(idTokenString);
      if (idToken == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Invalid Google token"));
      }

      Payload payload = idToken.getPayload();
      String email = payload.getEmail();
      String googleId = payload.getSubject();
      String name = (String) payload.get("name");
      String pictureUrl = (String) payload.get("picture");

      // Generate JWT token and ensure user exists/updated
      String token = authService.googleLogin(googleId, email, name, pictureUrl);

      LOGGER.info("Generated token: {}", (token != null ? token.substring(0, 20) + "..." : "NULL"));

      // Get user info for response
      User user = authService.getUserByEmail(email);

      Map<String, Object> responseBody = new HashMap<>();
      responseBody.put("message", "Google login successful");
      responseBody.put("userId", user.getUserId().toString());
      responseBody.put("username", user.getUsername());
      responseBody.put("email", user.getEmail());
      responseBody.put("token", token); // Include token in response for localStorage storage

      ResponseCookie cookie =
          ResponseCookie.from("token", token)
              .httpOnly(true)
              .secure(true)
              .path("/")
              .maxAge(7 * 24 * 60 * 60)
              .sameSite("None")
              .build();

      return ResponseEntity.ok()
          .header(HttpHeaders.SET_COOKIE, cookie.toString())
          .body(responseBody);

    } catch (Exception e) {
      LOGGER.error("Google login failed", e);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Google login failed"));
    }
  }

  @RequestMapping("/public-key")
  public ResponseEntity<?> publicKey() {
    try {
      Map<String, Object> jwk = rsaKeyManager.getPublicJwk();
      return ResponseEntity.ok().body(jwk);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "Failed to retrieve public key"));
    }
  }

  // debug-decrypt endpoint removed
}
