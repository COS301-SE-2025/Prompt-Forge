package com.fiveOps.promptforge.securityConfig;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTClaimsSetVerifier;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;

import java.net.URL;
import java.util.List;

public class GoogleIdTokenVerifier {

    private static final String GOOGLE_ISSUER_1 = "https://accounts.google.com";
    private static final String GOOGLE_ISSUER_2 = "accounts.google.com";
    private static final String GOOGLE_JWK_URL = "https://www.googleapis.com/oauth2/v3/certs";

    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;
    private final String clientId;

    public GoogleIdTokenVerifier(String clientId) throws Exception {
        this.clientId = clientId;
        jwtProcessor = new DefaultJWTProcessor<>();

        // Configure timeouts and size limit for JWK retrieval
        int connectTimeout = 2000;  // milliseconds
        int readTimeout = 2000;     // milliseconds
        int sizeLimit = 1024 * 1024; // 1 MB

        DefaultResourceRetriever resourceRetriever =
            new DefaultResourceRetriever(connectTimeout, readTimeout, sizeLimit);

        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(GOOGLE_JWK_URL), resourceRetriever);
        JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);

        // Set claims verifier with BadJWTException as per interface contract
        jwtProcessor.setJWTClaimsSetVerifier(new JWTClaimsSetVerifier<SecurityContext>() {
            @Override
            public void verify(JWTClaimsSet claims, SecurityContext context) throws BadJWTException {
                String issuer = claims.getIssuer();
                if (!GOOGLE_ISSUER_1.equals(issuer) && !GOOGLE_ISSUER_2.equals(issuer)) {
                    throw new BadJWTException("Invalid token issuer");
                }

                List<String> audience = claims.getAudience();
                if (audience == null || !audience.contains(clientId)) {
                    throw new BadJWTException("Audience mismatch");
                }
                // Add more checks here as needed (expiry, issued at, etc.)
            }
        });
    }

    /**
     * Verifies the ID token string and returns the JWT claims if valid.
     * Throws Exception if invalid.
     */
    public JWTClaimsSet verify(String idTokenString) throws Exception {
        SecurityContext ctx = null;
        return jwtProcessor.process(idTokenString, ctx);
    }
}
