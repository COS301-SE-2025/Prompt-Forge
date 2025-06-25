package com.fiveOps.promptforge.securityConfig;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  Dotenv dotenv = Dotenv.load();
  String secret = dotenv.get("JWT_SECRET");

  private SecretKey getSigningKey() {
    byte[] keyBytes = Base64.getDecoder().decode(secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(String email) {
    return Jwts
      .builder()
      .setSubject(email)
      .setIssuedAt(new Date())
      .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10h
      .signWith(getSigningKey(), SignatureAlgorithm.HS256)
      .compact();
  }

  public String extractUsername(String token) {
    return Jwts
      .parserBuilder()
      .setSigningKey(getSigningKey())
      .build()
      .parseClaimsJws(token)
      .getBody()
      .getSubject();
  }

  // ✅ Add this method to extract all claims
  public Claims extractAllClaims(String token) {
    return Jwts
      .parserBuilder()
      .setSigningKey(getSigningKey())
      .build()
      .parseClaimsJws(token)
      .getBody();
  }

  // ✅ Add this method to check if token is expired
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
      Jwts
        .parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token);
      return !isTokenExpired(token);
    } catch (Exception e) {
      return false;
    }
  }
}
