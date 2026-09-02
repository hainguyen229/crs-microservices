package com.example.registrationservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        // Không có token -> để Spring Security xử lý
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authorization.substring(7).trim();

            SecretKey key = Keys.hmacShaKeyFor(
                    jwtSecret.getBytes(StandardCharsets.UTF_8)
            );

            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String username = claims.getSubject();
            String role = claims.get("role", String.class);

            Number userIdNumber = claims.get("userId", Number.class);
            Long userId = userIdNumber != null
                    ? userIdNumber.longValue()
                    : null;

            if (username == null || username.isBlank()) {
                throw new RuntimeException("JWT không có username");
            }

            if (role == null || role.isBlank()) {
                throw new RuntimeException("JWT không có role");
            }

            if (userId == null) {
                throw new RuntimeException("JWT không có userId");
            }

            // Chuẩn hóa role
            role = role.trim().toUpperCase();

            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            userId,
                            Collections.singletonList(authority)
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println(
                    "JWT OK -> username = " + username +
                            ", userId = " + userId +
                            ", authority = " + authority.getAuthority()
            );

        } catch (Exception e) {

            SecurityContextHolder.clearContext();

            System.out.println("JWT ERROR -> " + e.getMessage());

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"error\":\"Invalid JWT\",\"message\":\""
                            + e.getMessage()
                            + "\"}"
            );

            return;
        }

        filterChain.doFilter(request, response);
    }
}