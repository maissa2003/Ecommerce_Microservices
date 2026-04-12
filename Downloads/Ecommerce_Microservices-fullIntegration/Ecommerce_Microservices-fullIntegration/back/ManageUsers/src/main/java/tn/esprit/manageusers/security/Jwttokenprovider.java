package tn.esprit.manageusers.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Token Provider Component
 * Responsible for:
 * - Generating JWT tokens
 * - Validating JWT tokens
 * - Extracting claims from tokens
 */
@Component
public class Jwttokenprovider {

    @Value("${jwt.secret:MySecretKeyForJWTTokenGenerationAndValidationPurposesOnly123456}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private long jwtExpirationMs;

    /**
     * Get the signing key for JWT operations
     * Uses HMAC-SHA512 algorithm
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate JWT token with email and role
     *
     * @param email User's email
     * @param role  User's role (ADMIN, CUSTOMER)
     * @return JWT token string
     */
    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, email);
    }

    /**
     * Generate JWT token from UserDetails
     *
     * @param userDetails Spring Security UserDetails object
     * @return JWT token string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .findFirst()
                .orElse("USER"));
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Create JWT token with claims and subject
     *
     * @param claims Claims to include in token
     * @param subject Token subject (email)
     * @return Compact JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract email from JWT token
     *
     * @param token JWT token
     * @return Email (subject)
     */
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extract role from JWT token
     *
     * @param token JWT token
     * @return User role
     */
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("role");
    }

    /**
     * Extract expiration date from JWT token
     *
     * @param token JWT token
     * @return Token expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Extract any claim from JWT token
     *
     * @param token JWT token
     * @param claimsResolver Function to extract specific claim
     * @return Extracted claim value
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Get all claims from JWT token
     *
     * @param token JWT token
     * @return Claims object
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Check if token is expired
     *
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Validate JWT token
     * Checks if token is properly signed and not expired
     *
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate JWT token with UserDetails
     * Checks if token email matches UserDetails username and token is not expired
     *
     * @param token JWT token
     * @param userDetails Spring Security UserDetails
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String email = getEmailFromToken(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}