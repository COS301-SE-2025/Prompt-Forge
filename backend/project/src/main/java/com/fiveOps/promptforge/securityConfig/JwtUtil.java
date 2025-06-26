package com.fiveOps.promptforge.securityConfig;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
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
      .subject(email)  
      .issuedAt(new Date())  
      .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) 
      .compact();
  }

  public String extractUsername(String token) {
    return Jwts
      .parser()
      .verifyWith(getSigningKey())
      .build()
      .parseSignedClaims(token)  
      .getPayload() 
      .getSubject();
  }

 
  public Claims extractAllClaims(String token) {
    return Jwts
      .parser()
      .verifyWith(getSigningKey())
      .build()
      .parseSignedClaims(token)  
      .getPayload();  }

 
  public boolean isTokenExpired(String token) {
    try {
      Claims claims = extractAllClaims(token);
      return claims.getExpiration().before(new Date());
    } catch (Exception e) {
      return true;
    }
  }

  
 public boolean validateToken(String token) throws ExpiredJwtException {
    try {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
            
        return !claims.getExpiration().before(new Date());
    } catch (ExpiredJwtException ex) {
        throw ex; // Re-throw for specific handling
    } catch (JwtException | IllegalArgumentException ex) {
        throw new JwtException("Invalid JWT token");
    }
}
}