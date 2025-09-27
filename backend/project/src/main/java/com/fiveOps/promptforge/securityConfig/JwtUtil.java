package com.fiveOps.promptforge.securityConfig;

import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
  private static final Logger LOGGER = LoggerFactory.getLogger(JwtUtil.class);

  @Value("${jwt.secret}")
  private String secretKey;

  private SecretKey getSigningKey() {
    byte[] keyBytes = Base64.getDecoder().decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(String email) {
    return Jwts.builder()
        .subject(email)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
        .signWith(getSigningKey())
        .compact();
  }

  public String extractUsername(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .getSubject();
  }

  public Claims extractAllClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }

  public boolean isTokenExpired(String token) {
    try {
      Claims claims = extractAllClaims(token);
      return claims.getExpiration().before(new Date());
    } catch (Exception e) {
      return true;
    }
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
      return !isTokenExpired(token);
    } catch (ExpiredJwtException e) {
      LOGGER.info("Token expired for user: {}", e.getClaims().getSubject());
      return false;
    } catch (Exception e) {
      LOGGER.debug("Token validation failed: {}", e.getMessage());
      return false;
    }
  }
}
